const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const photosRoot = path.join(root, 'images', 'tour-photos');
const apiBase = 'http://localhost:8080/api';
const jwtSecret = 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';

const mapCountry = {
  'Bosnia-Herzegovina': 'Bosnia Herzegovina',
  'Channel-Islands': 'Channel Islands',
  'Czech-republic': 'Czech Republic',
  'Faroe-islands': 'Faroe Islands',
  'United-Kingdom': 'Uk',
  Turkiye: 'Turkey',
};

const skipZipCountries = new Set(['India']);
const imageExt = /\.(webp|jpg|jpeg|png|gif|avif)$/i;
const avrupaZipCountries = [
  'Albania',
  'Andorra',
  'Austria',
  'Bosnia Herzegovina',
  'Bulgaria',
  'Channel Islands',
  'Croatia',
  'Czech Republic',
  'Denmark',
  'England',
  'Estonia',
  'Faroe Islands',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Ireland',
  'Italy',
  'Kosovo',
  'Lapland',
  'Latvia',
  'Lithuania',
  'Malta',
  'Moldova',
  'Montenegro',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Scotland',
  'Serbia',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Turkey',
  'Uk',
];

function normalizeCountry(country) {
  return mapCountry[country] || country;
}

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isIgnoredName(name) {
  return name === '.DS_Store' || name.startsWith('._');
}

function adminToken() {
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    sub: 'admin@siempretour.com',
    userId: 1,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  });
  const signature = crypto.createHmac('sha256', jwtSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function getZipCountriesFromExtractedPhotos() {
  return avrupaZipCountries.filter((country) => !skipZipCountries.has(country) && getNumericSetDirs(country).length > 0);
}

function getNumericSetDirs(country) {
  const countryDir = path.join(photosRoot, country);
  if (!fs.existsSync(countryDir)) return [];

  return fs
    .readdirSync(countryDir, { withFileTypes: true })
    .filter((item) => item.isDirectory() && /^\d+$/.test(item.name))
    .map((item) => item.name)
    .sort((a, b) => Number(a) - Number(b));
}

function getSetImages(country, setName) {
  const setDir = path.join(photosRoot, country, setName);
  if (!fs.existsSync(setDir)) return [];

  return fs
    .readdirSync(setDir, { withFileTypes: true })
    .filter((item) => item.isFile() && !isIgnoredName(item.name) && imageExt.test(item.name) && !/map\./i.test(item.name))
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => toPosix(path.join('images', 'tour-photos', country, setName, name)));
}

async function fetchDestinationTours(country, lang) {
  const url = `${apiBase}/tours/by-destination?destination=${encodeURIComponent(country)}&lang=${encodeURIComponent(lang)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${await response.text()}`);
  }
  const tours = await response.json();
  return Array.isArray(tours) ? tours.filter((tour) => tour.id) : [];
}

function buildBody(images) {
  return {
    mainPhoto: images[0 % images.length],
    image1: images[0 % images.length],
    image2: images[1 % images.length],
    image3: images[2 % images.length],
    image4: images[3 % images.length],
    image5: images[4 % images.length],
    image6: images[5 % images.length],
  };
}

function sameImages(tour, body) {
  return ['mainPhoto', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6'].every((field) => {
    return (tour[field] || '') === (body[field] || '');
  });
}

async function updateTour(tour, body, token) {
  const response = await fetch(`${apiBase}/tours/${tour.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`PUT tour ${tour.id} failed: ${response.status} ${await response.text()}`);
  }
}

async function run() {
  const token = adminToken();
  const countries = getZipCountriesFromExtractedPhotos();
  const langs = ['en', 'tr'];
  const examples = [];
  let totalTours = 0;
  let changed = 0;
  let unchanged = 0;
  let skippedNoImages = 0;

  for (const country of countries) {
    const sets = getNumericSetDirs(country);
    const setImages = new Map(sets.map((setName) => [setName, getSetImages(country, setName)]));

    for (const lang of langs) {
      const tours = await fetchDestinationTours(country, lang);
      if (!tours.length) continue;

      totalTours += tours.length;

      for (let index = 0; index < tours.length; index += 1) {
        const tour = tours[index];
        const setName = sets[index % sets.length];
        const images = setImages.get(setName) || [];

        if (!images.length) {
          skippedNoImages += 1;
          continue;
        }

        const body = buildBody(images);
        if (sameImages(tour, body)) {
          unchanged += 1;
          continue;
        }

        await updateTour(tour, body, token);
        changed += 1;

        if (examples.length < 20) {
          examples.push(`${tour.id}\t${country}\t${lang}\t${tour.name}\t=>\t${body.image1}`);
        }
      }
    }
  }

  console.log(`COUNTRIES=${countries.length}`);
  console.log(`TOURS_PROCESSED=${totalTours}`);
  console.log(`CHANGED=${changed}`);
  console.log(`UNCHANGED=${unchanged}`);
  console.log(`SKIPPED_NO_IMAGES=${skippedNoImages}`);
  console.log('EXAMPLES');
  console.log(examples.join('\n'));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
