const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CURRENT_PHOTOS_DIR = path.resolve(process.env.CURRENT_PHOTOS_DIR || path.join(ROOT, 'images', 'tour-photos'));
const ORIGINAL_PHOTOS_DIR = path.resolve(
  process.env.ORIGINAL_PHOTOS_DIR || path.join(ROOT, 'avrupa-turlari', 'avrupa-turlari')
);
const OUT_DIR = path.resolve(process.env.OUT_DIR || path.join(ROOT, 'reports'));
const MIN_HERO_WIDTH = Number(process.env.MIN_HERO_WIDTH || 1200);
const USED_ONLY = process.env.USED_ONLY === '1';
const API_BASE = process.env.API_BASE || 'http://localhost:8080/api';
const IMAGE_EXT = /\.(webp|jpe?g|png|avif|gif)$/i;
const IMAGE_FIELDS = ['mainPhoto', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6'];

const countryAliases = {
  'Bosnia Herzegovina': ['Bosnia-Herzegovina'],
  'Channel Islands': ['Channel-Islands'],
  'Czech Republic': ['Czech-republic', 'Czech-Republic'],
  'Faroe Islands': ['Faroe-islands', 'Faroe-Islands'],
  Turkey: ['Turkiye'],
  Uk: ['United-Kingdom', 'United Kingdom', 'UK'],
};

function isIgnored(name) {
  return name === '.DS_Store' || name.startsWith('._') || name === '__MACOSX';
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isIgnored(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile() && IMAGE_EXT.test(ent.name)) out.push(full);
  }
  return out;
}

async function fetchUsedImagePaths() {
  const used = new Map();

  for (let page = 0; ; page += 1) {
    const response = await fetch(`${API_BASE}/tours/filter?page=${page}&size=200`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (!response.ok) {
      throw new Error(`POST /tours/filter failed: ${response.status} ${await response.text()}`);
    }

    const payload = await response.json();
    const tours = Array.isArray(payload) ? payload : payload.content || payload.data || payload.items || payload.results || [];

    for (const tour of tours) {
      for (const field of IMAGE_FIELDS) {
        const imagePath = tour[field];
        if (!imagePath || typeof imagePath !== 'string') continue;
        if (!imagePath.startsWith('images/tour-photos/')) continue;
        const currentRel = imagePath.replace(/^images\/tour-photos\//, '');
        if (!used.has(currentRel)) {
          used.set(currentRel, { path: imagePath, tours: 0, fields: new Set() });
        }
        used.get(currentRel).tours += 1;
        used.get(currentRel).fields.add(field);
      }
    }

    const totalPages = Number.isInteger(payload.totalPages) ? payload.totalPages : null;
    if (totalPages != null) {
      if (page + 1 >= totalPages) break;
    } else if (tours.length < 200) {
      break;
    }
  }

  return used;
}

function imageDimensions(file) {
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
      if (isSof) return { width: b.readUInt16BE(offset + 7), height: b.readUInt16BE(offset + 5), type: 'JPEG' };
      offset += 2 + length;
    }
  }

  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    let offset = 12;
    while (offset + 8 <= b.length) {
      const tag = b.toString('ascii', offset, offset + 4);
      const length = b.readUInt32LE(offset + 4);
      const data = offset + 8;

      if (tag === 'VP8X') {
        return { width: 1 + b.readUIntLE(data + 4, 3), height: 1 + b.readUIntLE(data + 7, 3), type: 'WEBP' };
      }
      if (tag === 'VP8 ') {
        const start = data + 10;
        return { width: b.readUInt16LE(start) & 0x3fff, height: b.readUInt16LE(start + 2) & 0x3fff, type: 'WEBP' };
      }
      if (tag === 'VP8L') {
        const bits = b.readUInt32LE(data + 1);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1, type: 'WEBP' };
      }

      offset = data + length + (length % 2);
    }
  }

  if (b.toString('ascii', 1, 4) === 'PNG') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), type: 'PNG' };
  }

  return { width: 0, height: 0, type: 'unknown' };
}

function relFromCurrent(file) {
  return path.relative(CURRENT_PHOTOS_DIR, file).replace(/\\/g, '/');
}

function candidateOriginalPaths(currentRel) {
  const parts = currentRel.split('/');
  const [country, maybeRegionOrSet, maybeSetOrFile, maybeFile] = parts;
  const names = [country, ...(countryAliases[country] || [])];
  const candidates = [];

  for (const name of names) {
    candidates.push(path.join(ORIGINAL_PHOTOS_DIR, name, ...parts.slice(1)));

    if (parts.length >= 4 && /^\d\d-/.test(maybeRegionOrSet)) {
      candidates.push(path.join(ORIGINAL_PHOTOS_DIR, name, maybeSetOrFile, maybeFile));
    }
  }

  return [...new Set(candidates)];
}

function findOriginal(currentRel) {
  for (const candidate of candidateOriginalPaths(currentRel)) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function csvEscape(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [];
  const usedPaths = USED_ONLY ? await fetchUsedImagePaths() : null;
  const currentFiles = USED_ONLY
    ? [...usedPaths.keys()].map((rel) => path.join(CURRENT_PHOTOS_DIR, rel)).filter((file) => fs.existsSync(file))
    : walk(CURRENT_PHOTOS_DIR);

  for (const currentPath of currentFiles) {
    const currentRel = relFromCurrent(currentPath);
    const usedMeta = usedPaths?.get(currentRel);
    const currentStat = fs.statSync(currentPath);
    const currentDim = imageDimensions(currentPath);
    const originalPath = findOriginal(currentRel);
    const originalStat = originalPath ? fs.statSync(originalPath) : null;
    const originalDim = originalPath ? imageDimensions(originalPath) : null;
    const currentPixels = currentDim.width * currentDim.height;
    const originalPixels = originalDim ? originalDim.width * originalDim.height : 0;
    const improvementRatio = currentPixels > 0 ? originalPixels / currentPixels : 0;
    const sameBytes = Boolean(originalPath && currentStat.size === originalStat.size);
    const better =
      Boolean(originalPath) &&
      (originalDim.width > currentDim.width || originalDim.height > currentDim.height || originalStat.size > currentStat.size * 1.25);

    rows.push({
      path: `images/tour-photos/${currentRel}`,
      currentWidth: currentDim.width,
      currentHeight: currentDim.height,
      currentBytes: currentStat.size,
      currentType: currentDim.type,
      originalMatch: Boolean(originalPath),
      originalPath: originalPath ? path.relative(ROOT, originalPath).replace(/\\/g, '/') : '',
      originalWidth: originalDim?.width || 0,
      originalHeight: originalDim?.height || 0,
      originalBytes: originalStat?.size || 0,
      originalType: originalDim?.type || '',
      sameBytes,
      better,
      improvementRatio: Number(improvementRatio.toFixed(2)),
      lowForHero: currentDim.width > 0 && currentDim.width < MIN_HERO_WIDTH,
      usedByTourImageRefs: usedMeta?.tours || 0,
      usedFields: usedMeta ? [...usedMeta.fields].sort().join('|') : '',
    });
  }

  const summary = {
    mode: USED_ONLY ? 'used-backend-image-paths' : 'all-current-photo-files',
    currentPhotosDir: CURRENT_PHOTOS_DIR,
    originalPhotosDir: ORIGINAL_PHOTOS_DIR,
    totalCurrentImages: rows.length,
    originalMatches: rows.filter((r) => r.originalMatch).length,
    missingOriginalMatch: rows.filter((r) => !r.originalMatch).length,
    betterOriginalAvailable: rows.filter((r) => r.better).length,
    alreadySameBytes: rows.filter((r) => r.sameBytes).length,
    lowForHero: rows.filter((r) => r.lowForHero).length,
    usedImageRefsCovered: rows.reduce((sum, row) => sum + row.usedByTourImageRefs, 0),
    dimensions: Object.fromEntries(
      [...rows.reduce((m, r) => m.set(`${r.currentWidth}x${r.currentHeight}`, (m.get(`${r.currentWidth}x${r.currentHeight}`) || 0) + 1), new Map())]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    ),
  };

  const csvHeader = Object.keys(rows[0] || { path: '' });
  const csv = [csvHeader.join(','), ...rows.map((row) => csvHeader.map((key) => csvEscape(row[key])).join(','))].join('\n');
  const summaryPath = path.join(OUT_DIR, 'photo-quality-summary.json');
  const rowsPath = path.join(OUT_DIR, 'photo-quality-rows.json');
  const csvPath = path.join(OUT_DIR, 'photo-quality-report.csv');

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(rowsPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  fs.writeFileSync(csvPath, `${csv}\n`, 'utf8');

  console.log(JSON.stringify(summary, null, 2));
  console.log(`CSV=${csvPath}`);
  console.log(`ROWS=${rowsPath}`);
  console.log(`SUMMARY=${summaryPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
