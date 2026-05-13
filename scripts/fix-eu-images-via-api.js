const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const API_BASE = 'http://localhost:8080/api';
const SECRET = 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';
const root = process.cwd();
const photosRoot = path.join(root, 'images', 'tour-photos');

const EU_COUNTRIES = [
  'Albania','Andorra','Austria','Bosnia Herzegovina','Bulgaria','Channel Islands','Croatia','Czech Republic','Denmark','England','Estonia','Faroe Islands','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kosovo','Lapland','Latvia','Lithuania','Malta','Moldova','Montenegro','Norway','Poland','Portugal','Romania','Scotland','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Uk'
];
const LANGS = ['en', 'tr'];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function generateAdminToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'admin@siempretour.com',
    userId: 1,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };

  const base64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signature = crypto.createHmac('sha256', SECRET).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function getSets(country) {
  const cdir = path.join(photosRoot, country);
  if (!fs.existsSync(cdir)) return [];

  return fs.readdirSync(cdir, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d+$/.test(d.name))
    .map(d => d.name)
    .sort((a, b) => Number(a) - Number(b));
}

function getImages(country, setName) {
  const sdir = path.join(photosRoot, country, setName);
  if (!fs.existsSync(sdir)) return [];

  return fs.readdirSync(sdir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(n => /\.(webp|jpg|jpeg|png|gif)$/i.test(n) && n !== '.DS_Store' && !n.startsWith('._'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map(n => `images/tour-photos/${country}/${setName}/${n}`);
}

async function fetchTours(country, lang) {
  const url = `${API_BASE}/tours/by-destination?destination=${encodeURIComponent(country)}&lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${country}/${lang}: ${res.status}`);
  return res.json();
}

async function updateTourImages(id, body, token) {
  let tries = 6;
  while (tries > 0) {
    const res = await fetch(`${API_BASE}/tours/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) return;

    if (res.status === 429) {
      tries -= 1;
      await sleep(400 + (6 - tries) * 250);
      continue;
    }

    const txt = await res.text();
    throw new Error(`PUT ${id} failed: ${res.status} ${txt.slice(0, 220)}`);
  }

  throw new Error(`PUT ${id} failed repeatedly with 429`);
}

async function run() {
  const token = generateAdminToken();
  let updated = 0;
  let skipped = 0;

  for (const country of EU_COUNTRIES) {
    const sets = getSets(country);
    if (!sets.length) {
      skipped += 1;
      continue;
    }

    const setImages = new Map();
    for (const s of sets) setImages.set(s, getImages(country, s));

    for (const lang of LANGS) {
      const tours = await fetchTours(country, lang);
      if (!Array.isArray(tours) || !tours.length) continue;

      for (let i = 0; i < tours.length; i++) {
        const t = tours[i];
        const setName = sets[i % sets.length];
        const imgs = setImages.get(setName) || [];
        if (!imgs.length || !t?.id) continue;

        const body = {
          mainPhoto: imgs[0 % imgs.length],
          image1: imgs[0 % imgs.length],
          image2: imgs[1 % imgs.length],
          image3: imgs[2 % imgs.length],
          image4: imgs[3 % imgs.length],
          image5: imgs[4 % imgs.length],
          image6: imgs[5 % imgs.length],
        };

        await updateTourImages(t.id, body, token);
        updated += 1;
        await sleep(45);
      }
    }
  }

  console.log(`UPDATED_TOURS=${updated}`);
  console.log(`SKIPPED_COUNTRIES_WITHOUT_SETS=${skipped}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
