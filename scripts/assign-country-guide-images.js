const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data', 'siempre_tour_country_datas_tr'));
const PHOTOS_DIR = path.resolve(process.env.PHOTOS_DIR || path.join(ROOT, 'images', 'tour-photos'));
const APPLY = process.env.APPLY === '1';
const IMAGE_EXT = /\.(webp|jpe?g|png|avif)$/i;

const aliases = {
  Burma: ['Myanmar'],
  Myanmar: ['Burma'],
  'United Kingdom': ['Uk'],
  Uk: ['United-Kingdom', 'United Kingdom'],
};

const safariOk = new Set([
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Chad',
  'Congo', 'Djibouti', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Ivory Coast',
  'Kenya', 'Liberia', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia',
  'Rwanda', 'Senegal', 'Sierra Leone', 'South Africa', 'South Sudan', 'Swaziland',
  'Tanzania', 'Uganda', 'Western Sahara', 'Zambia', 'Zimbabwe',
]);

function isIgnored(name) {
  return name === '.DS_Store' || name.startsWith('._') || name === '__MACOSX';
}

function countryDir(country) {
  const names = [country, ...(aliases[country] || [])];
  for (const name of names) {
    const dir = path.join(PHOTOS_DIR, name);
    if (fs.existsSync(dir)) return { dir, sourceCountry: name, exact: name === country };
  }
  return null;
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isIgnored(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile() && IMAGE_EXT.test(ent.name)) out.push(full);
  }
  return out;
}

function dimensions(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0xff && b[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < b.length) {
      if (b[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = b[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      const length = b.readUInt16BE(offset + 2);
      const isSof =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);
      if (isSof) return { width: b.readUInt16BE(offset + 7), height: b.readUInt16BE(offset + 5) };
      offset += 2 + length;
    }
  }

  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    let offset = 12;
    while (offset + 8 <= b.length) {
      const tag = b.toString('ascii', offset, offset + 4);
      const length = b.readUInt32LE(offset + 4);
      const data = offset + 8;
      if (tag === 'VP8X') return { width: 1 + b.readUIntLE(data + 4, 3), height: 1 + b.readUIntLE(data + 7, 3) };
      if (tag === 'VP8 ') {
        const start = data + 10;
        return { width: b.readUInt16LE(start) & 0x3fff, height: b.readUInt16LE(start + 2) & 0x3fff };
      }
      if (tag === 'VP8L') {
        const bits = b.readUInt32LE(data + 1);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      offset = data + length + (length % 2);
    }
  }

  if (b.toString('ascii', 1, 4) === 'PNG') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  return { width: 0, height: 0 };
}

function shouldExclude(country, rel) {
  const value = rel.toLowerCase();
  if (/map|logo|icon|avatar|favicon|placeholder/.test(value)) return true;
  if (!safariOk.has(country) && value.includes('/09-african-safari/')) return true;
  return false;
}

function pathScore(rel) {
  const parts = rel.split('/');
  const afterCountry = parts[3] || '';
  if (/^\d+$/.test(afterCountry)) return 20;
  if (/^\d\d-[a-z-]+$/.test(afterCountry)) return 12;
  return 8;
}

function candidateImages(country, match) {
  const files = walk(match.dir);
  const candidates = [];

  for (const full of files) {
    const rel = path.relative(ROOT, full).replace(/\\/g, '/');
    if (shouldExclude(country, rel)) continue;
    const dim = dimensions(full);
    const stat = fs.statSync(full);
    if (!dim.width || !dim.height) continue;
    candidates.push({
      path: rel,
      width: dim.width,
      height: dim.height,
      bytes: stat.size,
      area: dim.width * dim.height,
      score: pathScore(rel),
      signature: `${path.basename(rel).toLowerCase()}:${stat.size}:${dim.width}x${dim.height}`,
    });
  }

  candidates.sort((a, b) => {
    if (b.width !== a.width) return b.width - a.width;
    if (b.area !== a.area) return b.area - a.area;
    if (b.score !== a.score) return b.score - a.score;
    if (b.bytes !== a.bytes) return b.bytes - a.bytes;
    return a.path.localeCompare(b.path, undefined, { numeric: true, sensitivity: 'base' });
  });

  const chosen = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate.signature)) continue;
    seen.add(candidate.signature);
    chosen.push(candidate);
    if (chosen.length >= 5) break;
  }
  return chosen;
}

function updateImages(entry, images, keys) {
  let changed = 0;
  keys.forEach((key, index) => {
    if (!images[index]) return;
    const next = images[index].path;
    if (entry[key] !== next) {
      entry[key] = next;
      changed += 1;
    }
  });
  return changed;
}

function run() {
  const countryFolders = fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && fs.existsSync(path.join(DATA_DIR, ent.name, 'datas.json')))
    .map((ent) => ent.name)
    .sort();

  const report = [];
  let countriesUpdated = 0;
  let imagesAssigned = 0;
  let skipped = 0;

  for (const country of countryFolders) {
    const jsonPath = path.join(DATA_DIR, country, 'datas.json');
    const rows = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const overview = rows.find((row) => row.type === 'overview');
    const bestTime = rows.find((row) => row.type === 'best-time-to');
    if (!overview && !bestTime) continue;

    const match = countryDir(country);
    if (!match) {
      skipped += 1;
      report.push({ country, status: 'skipped-no-country-photo-folder' });
      continue;
    }

    const images = candidateImages(country, match);
    if (!images.length) {
      skipped += 1;
      report.push({ country, status: 'skipped-no-valid-images', photoFolder: match.sourceCountry });
      continue;
    }

    let changed = 0;
    if (overview) changed += updateImages(overview, images.slice(0, 3), ['image1', 'image2', 'image3']);
    if (bestTime) changed += updateImages(bestTime, images.slice(3, 5), ['image1', 'image2']);

    if (changed) {
      countriesUpdated += 1;
      imagesAssigned += changed;
      if (APPLY) fs.writeFileSync(jsonPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    }

    report.push({
      country,
      status: changed ? 'updated' : 'already-ok',
      changed,
      photoFolder: match.sourceCountry,
      exactPhotoFolder: match.exact,
      selected: images.map((img) => `${img.path} (${img.width}x${img.height}, ${img.bytes} bytes)`),
    });
  }

  const summary = {
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    countriesChecked: countryFolders.length,
    countriesUpdated,
    imagesAssigned,
    skipped,
    reportPath: path.join(ROOT, 'reports', 'country-guide-image-assignment.json'),
  };

  fs.mkdirSync(path.dirname(summary.reportPath), { recursive: true });
  fs.writeFileSync(summary.reportPath, `${JSON.stringify({ summary, report }, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  console.log(
    report
      .filter((row) => ['Croatia', 'Hungary'].includes(row.country))
      .map((row) => JSON.stringify(row, null, 2))
      .join('\n')
  );
}

run();
