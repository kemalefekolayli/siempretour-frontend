const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:8080/api';
const PHOTOS_DIR = path.join(__dirname, '..', 'images', 'tour-photos');
const MD_FILE_PATH = path.join(__dirname, '..', 'BACKEND_INTEGRATION_NOTES.md');

const ADMIN_JWT_SECRET = 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';
const PAGE_SIZE = 200;
const SKIP_TOURS_WITH_EXISTING_PHOTO = false;
const PRINT_API_DETAILS_ONLY = process.argv.includes('--print-api-details');
const UPDATE_DELAY_MS = 175;
const MAX_UPDATE_RETRIES = 10;
const CLEAR_UNMATCHED_PHOTO_LINKS = true;

const IMAGE_FIELDS = ['mainPhoto', 'image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const TOKEN_WORDS = new Set([
  'a', 'an', 'and', 'at', 'best', 'city', 'classic', 'day', 'days', 'deluxe', 'experience',
  'explore', 'from', 'full', 'guided', 'half', 'in', 'of', 'on', 'private', 'small', 'the',
  'to', 'tour', 'tours', 'trip', 'walk', 'with',
  'camp', 'camps', 'custom', 'dry', 'falls', 'green', 'holiday', 'holidays', 'image', 'known',
  'luxury', 'made', 'national', 'park', 'parks', 'pool', 'pools', 'river', 'rio', 'safari',
  'safaris', 'season', 'tailor', 'week', 'water', 'waterfall', 'waterfalls',
  'adventure', 'classic', 'discovering', 'discovery', 'eastern', 'expedition', 'exploring',
  'family', 'group', 'hidden', 'highlights', 'honeymoon', 'honeymoons', 'icons', 'immersive',
  'itinerary', 'journey', 'landscapes', 'signature', 'small', 'treasures', 'undiscovered',
  'wildlife',
]);

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compactKey(value) {
  return normalizeText(value).replace(/\s+/g, '');
}

function readBackendDocs() {
  if (!fs.existsSync(MD_FILE_PATH)) {
    throw new Error(`Backend API markdown file not found: ${MD_FILE_PATH}`);
  }

  return fs.readFileSync(MD_FILE_PATH, 'utf8');
}

function parseEndpoint(md, method, matcher) {
  const lines = md.split(/\r?\n/);
  const upperMethod = method.toUpperCase();

  for (const line of lines) {
    const match = line.match(/`?((GET|POST|PUT|PATCH|DELETE)\s+\/api\/[^`\s]+)/i);
    if (!match) continue;

    const [foundMethod, foundUrl] = match[1].split(/\s+/, 2);
    if (foundMethod.toUpperCase() !== upperMethod) continue;
    if (matcher(foundUrl, line)) return { method: foundMethod.toUpperCase(), path: foundUrl };
  }

  return null;
}

function parseApiDetails(md) {
  const baseMatch = md.match(/API base:\s*`?([^`\r\n]+)`?/i);
  const authRequired = /Authorization:\s*Bearer|Requires admin token|JWT auth/i.test(md);
  const imageFields = IMAGE_FIELDS.filter((field) => new RegExp(`\\b${field}\\b`, 'i').test(md));
  if (/image1\s*\.\.\s*image6/i.test(md)) {
    for (const field of ['image1', 'image2', 'image3', 'image4', 'image5', 'image6']) {
      if (!imageFields.includes(field)) imageFields.push(field);
    }
  }

  const uploadEndpoint =
    parseEndpoint(md, 'POST', (url, line) => /upload|photo|image/i.test(url + line)) ||
    parseEndpoint(md, 'PUT', (url, line) => /\/api\/tours\/\*\*|\/api\/tours\/\{id\}|photo|image/i.test(url + line));

  const toursListingEndpoint =
    parseEndpoint(md, 'POST', (url) => /\/api\/tours\/filter/i.test(url)) ||
    parseEndpoint(md, 'GET', (url) => /\/api\/tours(?!\/by-slug)/i.test(url));

  return {
    baseUrl: (baseMatch ? baseMatch[1].trim() : BASE_URL).replace(/\/$/, ''),
    authHeader: authRequired ? 'Authorization: Bearer <admin token>' : 'none documented',
    toursListing: {
      method: toursListingEndpoint?.method,
      path: toursListingEndpoint?.path,
      requestFormat: toursListingEndpoint?.path.includes('/filter') ? 'JSON body; paged query params' : 'query params',
    },
    upload: {
      method: uploadEndpoint?.method,
      path: uploadEndpoint?.path,
      requestFormat: /multipart|form[- ]data/i.test(md) ? 'multipart/form-data' : 'JSON image field update',
      inferredFromTourUpdate: uploadEndpoint?.path === '/api/tours/**',
    },
    responseShapes: {
      tours: 'array, Spring page content, data/content/items/results, or single object fallback',
      images: imageFields.length ? IMAGE_FIELDS.filter((field) => imageFields.includes(field)) : IMAGE_FIELDS,
    },
  };
}

function printApiDetails(api) {
  console.log('=== Parsed API Details ===');
  console.log(`Base URL: ${api.baseUrl}`);
  console.log(`Auth: ${api.authHeader}`);
  console.log(`Tours listing: ${api.toursListing.method} ${api.toursListing.path || '(not found)'}`);
  console.log(`Tours request: ${api.toursListing.requestFormat}`);
  console.log(`Photo association: ${api.upload.method} ${api.upload.path || '(not found)'}`);
  console.log(`Photo request: ${api.upload.requestFormat}`);
  if (api.upload.inferredFromTourUpdate) {
    console.log('Photo link note: no binary upload is performed; frontend image paths are saved to backend image fields.');
  }
  console.log(`Image response fields: ${api.responseShapes.images.join(', ')}`);
  console.log('');
}

function assertApiDetails(api) {
  if (!api.toursListing.path) {
    throw new Error('Could not parse a tours listing endpoint from the markdown.');
  }

  if (!api.upload.path) {
    throw new Error('Could not parse a photo upload or tour image update endpoint from the markdown.');
  }
}

function generateAdminToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: 'admin@siempretour.com',
    userId: 1,
    role: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function joinUrl(baseUrl, endpointPath) {
  const relative = endpointPath
    .replace(/\{page\}/g, '0')
    .replace(/\{size\}/g, String(PAGE_SIZE))
    .replace(/\{[^}]+\}/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\/api\/?/, '/');

  return `${baseUrl.replace(/\/api$/, '')}/api${relative.startsWith('/') ? relative : `/${relative}`}`;
}

function extractTourArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of ['content', 'data', 'items', 'results', 'tours']) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
}

function getTotalPages(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (Number.isInteger(payload.totalPages)) return payload.totalPages;
  if (Number.isInteger(payload.page?.totalPages)) return payload.page.totalPages;
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok) {
    const error = new Error(`${options.method || 'GET'} ${url} failed: ${response.status} ${text.slice(0, 300)}`);
    error.status = response.status;
    error.responseText = text;
    throw error;
  }

  return text ? JSON.parse(text) : null;
}

function getEndpointWithPaging(baseUrl, endpointPath, page) {
  const hasPageToken = endpointPath.includes('{page}');
  const hasSizeToken = endpointPath.includes('{size}');
  let url = joinUrl(baseUrl, endpointPath)
    .replace('page=0', `page=${page}`)
    .replace(`size=${PAGE_SIZE}`, `size=${PAGE_SIZE}`);

  if (!hasPageToken && !/[?&]page=/.test(url)) {
    url += `${url.includes('?') ? '&' : '?'}page=${page}`;
  }

  if (!hasSizeToken && !/[?&]size=/.test(url)) {
    url += `${url.includes('?') ? '&' : '?'}size=${PAGE_SIZE}`;
  }

  return url;
}

async function fetchAllTours(api, token) {
  const tours = [];
  const endpoint = api.toursListing.path;
  const method = api.toursListing.method;

  for (let page = 0; ; page += 1) {
    const url = getEndpointWithPaging(api.baseUrl, endpoint, page);
    const payload = await requestJson(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: method === 'POST' ? JSON.stringify({}) : undefined,
    });

    const batch = extractTourArray(payload);
    tours.push(...batch);

    const totalPages = getTotalPages(payload);
    if (totalPages !== null) {
      if (page + 1 >= totalPages) break;
    } else if (batch.length < PAGE_SIZE) {
      break;
    }
  }

  return tours
    .map((tour) => ({
      ...tour,
      id: tour.id ?? tour.tourId ?? tour.uuid,
      name: tour.name ?? tour.tourName ?? tour.title,
    }))
    .filter((tour) => tour.id && tour.name);
}

function isIgnoredFileName(name) {
  return name === '.DS_Store' || name.startsWith('._');
}

function isImageFile(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function listImageFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (isIgnoredFileName(item.name)) continue;

    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...listImageFilesRecursive(itemPath));
    } else if (item.isFile() && isImageFile(itemPath)) {
      files.push(itemPath);
    }
  }

  return files;
}

function buildPhotoPools() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    throw new Error(`Photos directory not found: ${PHOTOS_DIR}`);
  }

  const folderPools = [];
  const namedPools = new Map();
  const topDirs = fs
    .readdirSync(PHOTOS_DIR, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  for (const dir of topDirs) {
    const folderPath = path.join(PHOTOS_DIR, dir.name);
    const photos = listImageFilesRecursive(folderPath).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    if (!photos.length) continue;

    const folderKey = normalizeText(dir.name);
    for (const photo of photos) {
      for (const token of normalizeText(path.basename(photo, path.extname(photo))).split(/\s+/)) {
        if (!token || token.length <= 2 || TOKEN_WORDS.has(token)) continue;

        if (!namedPools.has(token)) {
          namedPools.set(token, {
            folderName: token,
            folderKey: token,
            compactFolderKey: compactKey(token),
            photos: [],
            filenameKeys: new Set([token]),
            sourceFolderKeys: new Set(),
            specificity: 'filename',
          });
        }

        namedPools.get(token).photos.push(photo);
        namedPools.get(token).sourceFolderKeys.add(folderKey);
      }
    }

    folderPools.push({
      folderName: dir.name,
      folderKey,
      compactFolderKey: compactKey(dir.name),
      photos,
    filenameKeys: new Set(),
      sourceFolderKeys: new Set([folderKey]),
      specificity: 'folder',
    });
  }

  const filenamePools = [...namedPools.values()].map((pool) => ({
    ...pool,
    photos: [...new Set(pool.photos)].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    ),
  }));

  return [...filenamePools, ...folderPools];
}

function extractLocationKeywords(tourName) {
  return normalizeText(tourName)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TOKEN_WORDS.has(word))
    .sort((a, b) => b.length - a.length);
}

function matchScore(tour, keywords, pool) {
  const normalizedName = normalizeText(tour.name);
  const compactName = compactKey(tour.name);
  const normalizedDestination = normalizeText(tour.destination);
  const combinedText = normalizeText(getTourLocationText(tour));
  const compactCombinedText = compactKey(getTourLocationText(tour));
  let best = 0;

  if (pool.specificity === 'folder' && pool.folderKey.length >= 4 && normalizedName.includes(pool.folderKey)) {
    best = Math.max(best, 450 + pool.folderKey.length);
  }
  if (pool.specificity === 'folder' && pool.compactFolderKey.length >= 4 && compactName.includes(pool.compactFolderKey)) {
    best = Math.max(best, 430 + pool.compactFolderKey.length);
  }
  if (pool.specificity === 'folder' && pool.folderKey && normalizedDestination === pool.folderKey) {
    best = Math.max(best, 350 + pool.folderKey.length);
  }
  if (pool.specificity === 'folder' && pool.folderKey.length >= 4 && combinedText.includes(pool.folderKey)) {
    best = Math.max(best, 300 + pool.folderKey.length);
  }
  if (pool.specificity === 'folder' && pool.compactFolderKey.length >= 4 && compactCombinedText.includes(pool.compactFolderKey)) {
    best = Math.max(best, 290 + pool.compactFolderKey.length);
  }

  for (const keyword of keywords) {
    if (pool.specificity === 'folder' && pool.folderKey === keyword) best = Math.max(best, 280 + keyword.length);
    if (pool.specificity === 'folder' && pool.folderKey.length >= 4 && keyword.length >= 4 && (pool.folderKey.includes(keyword) || keyword.includes(pool.folderKey))) {
      best = Math.max(best, 240 + keyword.length);
    }
    if (
      pool.specificity === 'filename' &&
      (!normalizedDestination || pool.sourceFolderKeys.has(normalizedDestination)) &&
      normalizedName.includes(keyword) &&
      pool.filenameKeys.has(keyword)
    ) {
      best = Math.max(best, 500 + keyword.length);
    }
  }

  return best;
}

function getTourLocationText(tour) {
  return [tour.name, tour.destination, tour.departureCity, tour.country]
    .filter(Boolean)
    .join(' ');
}

function findBestPool(tour, pools) {
  const locationText = getTourLocationText(tour);
  const keywords = extractLocationKeywords(locationText);
  let best = null;

  for (const pool of pools) {
    const score = matchScore(tour, keywords, pool);
    if (!score) continue;

    if (
      !best ||
      score > best.score ||
      (score === best.score && normalizeText(locationText).includes(pool.folderKey) && !normalizeText(locationText).includes(best.pool.folderKey)) ||
      (score === best.score && pool.folderKey.length > best.pool.folderKey.length)
    ) {
      best = { pool, score, keywords };
    }
  }

  return best;
}

function hasExistingPhoto(tour) {
  return IMAGE_FIELDS.some((field) => typeof tour[field] === 'string' && tour[field].trim());
}

function photoReference(photoPath) {
  const frontendRoot = path.join(__dirname, '..');
  return path.relative(frontendRoot, photoPath).replace(/\\/g, '/');
}

function buildPhotoLinkBody(photoPath) {
  const ref = photoReference(photoPath);
  return {
    mainPhoto: ref,
    image1: ref,
  };
}

function buildTourUpdateUrl(api, tourId) {
  const endpoint = api.upload.path.replace(/\*\*/g, String(tourId)).replace(/\{id\}/g, String(tourId));
  return joinUrl(api.baseUrl, endpoint);
}

async function updateTourImageBody(api, token, tour, body) {
  const url = buildTourUpdateUrl(api, tour.id);

  for (let attempt = 1; attempt <= MAX_UPDATE_RETRIES; attempt += 1) {
    try {
      await requestJson(url, {
        method: api.upload.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      return;
    } catch (error) {
      if (error.status !== 429 || attempt === MAX_UPDATE_RETRIES) throw error;

      let retryAfterSeconds = 0;
      try {
        retryAfterSeconds = Number(JSON.parse(error.responseText).retryAfterSeconds || 0);
      } catch (_) {
        retryAfterSeconds = 0;
      }

      const waitMs = Math.max(retryAfterSeconds * 1000, 750 + attempt * 500);
      console.log(`WARN rate limited on tour ${tour.id}; retrying in ${waitMs}ms (attempt ${attempt}/${MAX_UPDATE_RETRIES})`);
      await sleep(waitMs);
    }
  }
}

async function linkTourPhoto(api, token, tour, photoPath) {
  await updateTourImageBody(api, token, tour, buildPhotoLinkBody(photoPath));
}

async function clearTourPhotoLinks(api, token, tour) {
  await updateTourImageBody(api, token, tour, {
    mainPhoto: '',
    image1: '',
  });
}

async function run() {
  const docs = readBackendDocs();
  const api = parseApiDetails(docs);
  printApiDetails(api);
  assertApiDetails(api);

  if (PRINT_API_DETAILS_ONLY) return;

  const token = generateAdminToken();
  const tours = await fetchAllTours(api, token);
  const pools = buildPhotoPools();
  const poolUsage = new Map();

  let linked = 0;
  let skipped = 0;
  let skippedExisting = 0;
  let skippedAlreadyLinked = 0;
  let skippedNoMatch = 0;
  let clearedNoMatch = 0;

  console.log(`Fetched tours: ${tours.length}`);
  console.log(`Photo pools: ${pools.length}`);
  console.log('');

  for (const tour of tours) {
    if (hasExistingPhoto(tour)) {
      console.log(`WARN already has photo; replacing link: ${tour.id} "${tour.name}"`);
      skippedExisting += 1;
      if (SKIP_TOURS_WITH_EXISTING_PHOTO) continue;
    }

    const match = findBestPool(tour, pools);
    if (!match) {
      console.log(`WARN no matching photo pool; skipping: ${tour.id} "${tour.name}"`);
      skipped += 1;
      skippedNoMatch += 1;
      if (CLEAR_UNMATCHED_PHOTO_LINKS && hasExistingPhoto(tour)) {
        await clearTourPhotoLinks(api, token, tour);
        clearedNoMatch += 1;
        console.log(`CLEAR unmatched existing photo link: ${tour.id} "${tour.name}"`);
        await sleep(UPDATE_DELAY_MS);
      }
      continue;
    }

    const usageKey = match.pool.folderKey;
    const nextIndex = poolUsage.get(usageKey) || 0;
    const photoPath = match.pool.photos[nextIndex % match.pool.photos.length];
    poolUsage.set(usageKey, nextIndex + 1);
    const ref = photoReference(photoPath);

    if (tour.mainPhoto === ref || tour.image1 === ref) {
      skippedAlreadyLinked += 1;
      console.log(`SKIP already linked: ${tour.id} "${tour.name}" <- ${ref}`);
      continue;
    }

    await linkTourPhoto(api, token, tour, photoPath);
    linked += 1;

    console.log(`OK ${tour.id} "${tour.name}" <- ${ref} (${match.pool.folderName})`);
    await sleep(UPDATE_DELAY_MS);
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Photo links saved: ${linked}`);
  console.log(`Tours skipped: ${skipped}`);
  console.log(`Skipped already had photo: ${skippedExisting}`);
  console.log(`Skipped already linked to same photo: ${skippedAlreadyLinked}`);
  console.log(`Skipped no matching pool: ${skippedNoMatch}`);
  console.log(`Cleared unmatched existing photo links: ${clearedNoMatch}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
