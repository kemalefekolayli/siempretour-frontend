const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const zipPath = path.join(root, 'avrupa-turlari.zip');
const extractRoot = path.join(root, '.tmp-avrupa-turlari');
const extractedBase = path.join(extractRoot, 'avrupa-turlari');
const photosRoot = path.join(root, 'images', 'tour-photos');

const mapCountry = {
  'Bosnia-Herzegovina': 'Bosnia Herzegovina',
  'Channel-Islands': 'Channel Islands',
  'Czech-republic': 'Czech Republic',
  'Faroe-islands': 'Faroe Islands',
  'United-Kingdom': 'Uk',
  'Turkiye': 'Turkey',
};

const skipCountries = new Set(['India']);

function normalizeCountry(country) {
  return mapCountry[country] || country;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isIgnoredName(name) {
  return name === '.DS_Store' || name.startsWith('._');
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src, { withFileTypes: true });

  for (const item of items) {
    if (isIgnoredName(item.name)) continue;

    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);

    if (item.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
}

function getNumericSetDirs(countryDir) {
  if (!fs.existsSync(countryDir)) return [];

  return fs
    .readdirSync(countryDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+$/.test(d.name))
    .map((d) => d.name)
    .sort((a, b) => Number(a) - Number(b));
}

function isImageFile(name) {
  return /\.(webp|jpg|jpeg|png|gif)$/i.test(name);
}

function getSetImages(countryFolderName, setName) {
  const setDir = path.join(photosRoot, countryFolderName, setName);
  if (!fs.existsSync(setDir)) return [];

  return fs
    .readdirSync(setDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => !isIgnoredName(name) && isImageFile(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => toPosix(path.join('images', 'tour-photos', countryFolderName, setName, name)));
}

function updateJsonFile(jsonPath, countryFolderName) {
  if (!fs.existsSync(jsonPath)) {
    return { updatedTours: 0, totalTours: 0, sets: 0, setsWithoutImages: 0 };
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const tours = JSON.parse(raw);

  if (!Array.isArray(tours)) {
    return { updatedTours: 0, totalTours: 0, sets: 0, setsWithoutImages: 0 };
  }

  const countryPhotosPath = path.join(photosRoot, countryFolderName);
  const sets = getNumericSetDirs(countryPhotosPath);

  if (sets.length === 0) {
    return { updatedTours: 0, totalTours: tours.length, sets: 0, setsWithoutImages: 0 };
  }

  const setToImages = new Map();
  let setsWithoutImages = 0;

  for (const setName of sets) {
    const images = getSetImages(countryFolderName, setName);
    setToImages.set(setName, images);
    if (images.length === 0) setsWithoutImages += 1;
  }

  let updatedTours = 0;

  tours.forEach((tour, idx) => {
    const setName = sets[idx % sets.length];
    const images = setToImages.get(setName) || [];
    if (images.length === 0) return;

    tour.image1 = images[0 % images.length];
    tour.image2 = images[1 % images.length];
    tour.image3 = images[2 % images.length];
    tour.image4 = images[3 % images.length];
    tour.image5 = images[4 % images.length];
    tour.image6 = images[5 % images.length];
    tour.mainPhoto = tour.image1;

    updatedTours += 1;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(tours, null, 2) + '\n', 'utf8');

  return {
    updatedTours,
    totalTours: tours.length,
    sets: sets.length,
    setsWithoutImages,
  };
}

function run() {
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip not found: ${zipPath}`);
  }

  if (fs.existsSync(extractRoot)) {
    fs.rmSync(extractRoot, { recursive: true, force: true });
  }
  ensureDir(extractRoot);

  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractRoot.replace(/'/g, "''")}' -Force"`,
    { stdio: 'inherit' }
  );

  if (!fs.existsSync(extractedBase)) {
    throw new Error(`Extracted folder not found: ${extractedBase}`);
  }

  const zipCountries = fs
    .readdirSync(extractedBase, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('__MACOSX'))
    .map((d) => d.name)
    .filter((name) => !skipCountries.has(name));

  const copyReport = [];

  for (const zipCountry of zipCountries) {
    const normalized = normalizeCountry(zipCountry);
    const src = path.join(extractedBase, zipCountry);
    const dest = path.join(photosRoot, normalized);

    copyDirRecursive(src, dest);
    copyReport.push({ zipCountry, normalized });
  }

  const jsonBases = [
    path.join(root, 'data', 'big_siempre_tour_tours'),
    path.join(root, 'data', 'big_siempre_tour_tours_tr'),
  ];

  const updateReport = [];

  for (const { zipCountry, normalized } of copyReport) {
    for (const jsonBase of jsonBases) {
      const jsonPath = path.join(jsonBase, normalized, 'tours.json');
      const stats = updateJsonFile(jsonPath, normalized);

      if (stats.totalTours > 0) {
        updateReport.push({
          dataset: path.basename(jsonBase),
          country: normalized,
          fromZip: zipCountry,
          ...stats,
        });
      }
    }
  }

  fs.rmSync(extractRoot, { recursive: true, force: true });

  console.log('\n=== Photo Copy Done ===');
  console.log(`Countries copied: ${copyReport.length}`);

  console.log('\n=== JSON Update Report ===');
  for (const row of updateReport.sort((a, b) => {
    if (a.dataset !== b.dataset) return a.dataset.localeCompare(b.dataset);
    return a.country.localeCompare(b.country);
  })) {
    console.log(
      `${row.dataset}\t${row.country}\tupdated:${row.updatedTours}/${row.totalTours}\tsets:${row.sets}\tsetsWithoutImages:${row.setsWithoutImages}`
    );
  }
}

run();
