#!/usr/bin/env node
/* eslint-disable no-console */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_API_BASE = 'http://localhost:8080/api';
const DEFAULT_AZURE_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const CACHE_FILE = path.join(__dirname, '.tour-translation-cache.json');
const DEFAULT_MAX_CHARS = 1900000;
const BATCH_LIMIT = 80;
const CHAR_LIMIT = 40000;

const TEXT_FIELDS = [
  'name',
  'generalInfo',
  'placesVisited',
  'whatExpect',
  'imagealt',
  'personNumber',
  'dates',
  'minimumAge',
  'meet',
  'departureCity'
];

function usage() {
  console.log([
    'Usage:',
    '  node scripts/fill-missing-en-tours.js [--dry-run] [--apply] [--limit 10] [--max-chars 1900000]',
    '',
    'What it does:',
    '  Finds active TR tours that do not have an active EN tour with the same slug.',
    '  Translates visible text fields to English and creates language=en records via /api/admin/tours.',
    '  Re-running is idempotent because existing EN slugs are skipped before creating.',
    '',
    'Env:',
    `  API_BASE_URL                 default: ${DEFAULT_API_BASE}`,
    '  ADMIN_JWT                    required for --apply unless LOCAL_ADMIN_JWT=1',
    '  LOCAL_ADMIN_JWT=1            generates a local Docker admin token',
    '  JWT_SECRET                   default local Docker secret when LOCAL_ADMIN_JWT=1',
    '  AZURE_TRANSLATOR_KEY         required for --apply',
    '  AZURE_TRANSLATOR_REGION      required for --apply',
    `  AZURE_TRANSLATOR_ENDPOINT    default: ${DEFAULT_AZURE_ENDPOINT}`,
    '  MAX_TRANSLATE_CHARS          default: 1900000, use 0 for no local cap'
  ].join('\n'));
}

function parseArgs(argv) {
  const opts = {
    apply: false,
    dryRun: true,
    from: 'tr',
    to: 'en',
    maxChars: Number(process.env.MAX_TRANSLATE_CHARS || DEFAULT_MAX_CHARS),
    apiBase: (process.env.API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '')
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--apply') { opts.apply = true; opts.dryRun = false; }
    else if (arg === '--dry-run') { opts.dryRun = true; opts.apply = false; }
    else if (arg === '--limit') opts.limit = Number(args[++i]);
    else if (arg === '--max-chars') opts.maxChars = Number(args[++i]);
    else if (arg === '--base-url') opts.apiBase = String(args[++i] || '').replace(/\/$/, '');
  }

  return opts;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function hash(text) {
  return crypto.createHash('sha256').update(String(text)).digest('hex');
}

function cacheKey(text, from, to, textType) {
  return [from, to, textType, hash(text)].join(':');
}

function encodeBase64Url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function localAdminJwt() {
  const secret = process.env.JWT_SECRET || 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: process.env.ADMIN_EMAIL || 'admin@siempretour.com',
    userId: Number(process.env.ADMIN_USER_ID || 1),
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
  };
  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const signature = crypto.createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function adminToken() {
  if (process.env.ADMIN_JWT) return process.env.ADMIN_JWT;
  if (process.env.LOCAL_ADMIN_JWT === '1') return localAdminJwt();
  return '';
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${text.slice(0, 500)}`);
  }
  return body;
}

async function fetchTours(apiBase, lang) {
  function fetchPage(page) {
    return requestJson(`${apiBase}/tours/filter?page=${page}&size=30`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, isActive: true })
    });
  }

  const first = await fetchPage(0);
  if (Array.isArray(first)) return first;

  const totalPages = first.totalPages || 1;
  const pages = [first];
  const CONCURRENCY = 8;
  let nextPage = 1;

  async function worker() {
    while (nextPage < totalPages) {
      const page = nextPage;
      nextPage += 1;
      pages[page] = await fetchPage(page);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, Math.max(0, totalPages - 1)) }, worker));
  return pages.flatMap((page) => page && page.content ? page.content : []);
}

function cleanString(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\x00/g, '').replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function cleanDeep(value) {
  if (typeof value === 'string') return cleanString(value);
  if (Array.isArray(value)) return value.map(cleanDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cleanDeep(entry)]));
  }
  return value;
}

function textType(value) {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || '')) ? 'html' : 'plain';
}

function pushTextItem(items, owner, key) {
  const value = owner && owner[key];
  if (typeof value !== 'string' || !value.trim()) return;
  items.push({ owner, key, text: value, textType: textType(value) });
}

function collectTranslatableItems(dto) {
  const items = [];
  TEXT_FIELDS.forEach((field) => pushTextItem(items, dto, field));
  (dto.dayInfo || []).forEach((day) => {
    pushTextItem(items, day, 'title');
    pushTextItem(items, day, 'description');
  });
  (dto.route || []).forEach((stop) => {
    pushTextItem(items, stop, 'name');
    pushTextItem(items, stop, 'country');
  });
  return items;
}

function sourceToEnglishCreateDto(source) {
  const dto = {
    name: source.name || source.tourName || 'Unnamed Tour',
    slug: source.slug,
    language: 'en',
    destination: source.destination,
    generalInfo: source.generalInfo || '',
    placesVisited: source.placesVisited || '',
    whatExpect: source.whatExpect || '',
    mainPhoto: source.mainPhoto || '',
    image1: source.image1 || '',
    image2: source.image2 || '',
    image3: source.image3 || '',
    image4: source.image4 || '',
    image5: source.image5 || '',
    image6: source.image6 || '',
    imagealt: source.imagealt || '',
    personNumber: source.personNumber || '',
    dates: source.dates || '',
    minimumAge: source.minimumAge == null ? '' : String(source.minimumAge),
    meet: source.meet || '',
    map: source.map || '',
    price: source.price,
    discountedPrice: source.discountedPrice,
    destinations: Array.isArray(source.destinations) && source.destinations.length ? source.destinations : [source.destination].filter(Boolean),
    departureCity: source.departureCity || '',
    duration: source.duration || source.durationDays || 1,
    minParticipants: source.minParticipants || 1,
    maxParticipants: source.maxParticipants || 30,
    startDate: source.startDate || null,
    endDate: source.endDate || null,
    bookingDeadline: source.bookingDeadline || null,
    category: source.category,
    status: source.status || 'PUBLISHED',
    isActive: source.isActive !== false,
    eventType: source.eventType || null,
    shipName: source.shipName || '',
    shipCompany: source.shipCompany || '',
    dayInfo: (source.dayInfo || []).map((day, index) => ({
      dayNumber: day.dayNumber || index + 1,
      title: day.title || '',
      description: day.description || ''
    })),
    route: (source.route || []).map((stop) => ({
      name: stop.name || '',
      country: stop.country || ''
    })),
    routeCoordinates: (source.routeCoordinates || []).map((coord) => ({
      name: coord.name || '',
      country: coord.country || '',
      lat: coord.lat,
      lng: coord.lng
    }))
  };

  return cleanDeep(dto);
}

function pendingChars(items, cache, from, to) {
  return items.reduce((sum, item) => {
    return cache[cacheKey(item.text, from, to, item.textType)] ? sum : sum + item.text.length;
  }, 0);
}

function chunkItems(items) {
  const chunks = [];
  let current = [];
  let chars = 0;
  items.forEach((item) => {
    const len = item.text.length;
    if (current.length && (current.length >= BATCH_LIMIT || chars + len > CHAR_LIMIT)) {
      chunks.push(current);
      current = [];
      chars = 0;
    }
    current.push(item);
    chars += len;
  });
  if (current.length) chunks.push(current);
  return chunks;
}

async function translateAzure(batch, from, to, type) {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_AZURE_ENDPOINT).replace(/\/$/, '');

  if (!key || !region) {
    throw new Error('AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION are required for --apply.');
  }

  const url = `${endpoint}/translate?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&textType=${encodeURIComponent(type)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batch.map((item) => ({ text: item.text })))
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Azure Translator failed: HTTP ${response.status} ${body}`);
  }

  const payload = await response.json();
  return payload.map((entry) => entry.translations && entry.translations[0] ? entry.translations[0].text : '');
}

async function translateDto(dto, cache, opts) {
  const items = collectTranslatableItems(dto);

  items.forEach((item) => {
    const cached = cache[cacheKey(item.text, opts.from, opts.to, item.textType)];
    if (cached) item.owner[item.key] = cached;
  });

  const pending = items.filter((item) => !cache[cacheKey(item.text, opts.from, opts.to, item.textType)]);
  for (const type of ['plain', 'html']) {
    const byType = pending.filter((item) => item.textType === type);
    for (const chunk of chunkItems(byType)) {
      const translated = await translateAzure(chunk, opts.from, opts.to, type);
      translated.forEach((value, index) => {
        const item = chunk[index];
        cache[cacheKey(item.text, opts.from, opts.to, item.textType)] = value;
        item.owner[item.key] = value;
      });
      writeJson(CACHE_FILE, cache);
      console.log(`Translated ${chunk.length} ${type} strings.`);
    }
  }
}

async function createTour(apiBase, token, dto) {
  return requestJson(`${apiBase}/admin/tours`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(dto)
  });
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    usage();
    return;
  }

  const [trTours, enTours] = await Promise.all([
    fetchTours(opts.apiBase, 'tr'),
    fetchTours(opts.apiBase, 'en')
  ]);

  const enSlugs = new Set(enTours.map((tour) => tour.slug).filter(Boolean));
  let missing = trTours.filter((tour) => tour.slug && !enSlugs.has(tour.slug));
  missing.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
  if (opts.limit) missing = missing.slice(0, opts.limit);

  const cache = readJson(CACHE_FILE, {});
  const planned = [];
  let totalPendingChars = 0;

  missing.forEach((tour) => {
    const dto = sourceToEnglishCreateDto(tour);
    const items = collectTranslatableItems(dto);
    const chars = pendingChars(items, cache, opts.from, opts.to);
    planned.push({ tour, dto, chars, strings: items.length });
    totalPendingChars += chars;
  });

  console.log(`TR active tours: ${trTours.length}`);
  console.log(`EN active tours: ${enTours.length}`);
  console.log(`Missing EN tours selected: ${planned.length}`);
  console.log(`Pending uncached characters: ${totalPendingChars}`);
  console.log(`Mode: ${opts.apply ? 'apply' : 'dry-run'}`);

  if (!opts.apply) return;

  const token = adminToken();
  if (!token) throw new Error('ADMIN_JWT is required for --apply, or set LOCAL_ADMIN_JWT=1 for local Docker.');

  let usedChars = 0;
  let created = 0;
  let skippedForBudget = 0;

  for (const item of planned) {
    if (opts.maxChars > 0 && usedChars + item.chars > opts.maxChars) {
      skippedForBudget += 1;
      continue;
    }

    await translateDto(item.dto, cache, opts);
    await createTour(opts.apiBase, token, item.dto);
    usedChars += item.chars;
    created += 1;
    console.log(`Created EN ${created}/${planned.length}: ${item.tour.slug} (${item.chars} chars)`);
  }

  console.log(`Done. Created: ${created}. Skipped by local character budget: ${skippedForBudget}. Charged/counted this run estimate: ${usedChars}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
