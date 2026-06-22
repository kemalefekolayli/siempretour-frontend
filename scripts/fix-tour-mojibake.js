#!/usr/bin/env node
/* eslint-disable no-console */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_API_BASE = 'http://localhost:8080/api';
const PAGE_SIZE = 30;
const DEFAULT_REPORT_FILE = path.join(__dirname, '..', 'reports', 'tour-mojibake-report.json');

const TOP_LEVEL_TEXT_FIELDS = [
  'name',
  'destination',
  'generalInfo',
  'placesVisited',
  'whatExpect',
  'imagealt',
  'personNumber',
  'dates',
  'minimumAge',
  'meet',
  'departureCity',
  'shipName',
  'shipCompany'
];

const REPORT_ONLY_FIELDS = [
  'slug',
  'language',
  'mainPhoto',
  'image1',
  'image2',
  'image3',
  'image4',
  'image5',
  'image6',
  'map'
];

const CP1252_BYTE_TO_CHAR = {
  0x80: '\u20ac',
  0x82: '\u201a',
  0x83: '\u0192',
  0x84: '\u201e',
  0x85: '\u2026',
  0x86: '\u2020',
  0x87: '\u2021',
  0x88: '\u02c6',
  0x89: '\u2030',
  0x8a: '\u0160',
  0x8b: '\u2039',
  0x8c: '\u0152',
  0x8e: '\u017d',
  0x91: '\u2018',
  0x92: '\u2019',
  0x93: '\u201c',
  0x94: '\u201d',
  0x95: '\u2022',
  0x96: '\u2013',
  0x97: '\u2014',
  0x98: '\u02dc',
  0x99: '\u2122',
  0x9a: '\u0161',
  0x9b: '\u203a',
  0x9c: '\u0153',
  0x9e: '\u017e',
  0x9f: '\u0178'
};

const LOST_CHARACTER_REPAIRS = [
  [/\?zeti/g, '\u00d6zeti'],
  [/G\?verte/g, 'G\u00fcverte'],
  [/g\?verte/g, 'g\u00fcverte'],
  [/i\?in/g, 'i\u00e7in'],
  [/l\?tfen/g, 'l\u00fctfen'],
  [/m\?kemmel/g, 'm\u00fckemmel'],
  [/b\?y\?k/g, 'b\u00fcy\u00fck'],
  [/y\?ksek/g, 'y\u00fcksek'],
  [/d\?nya/g, 'd\u00fcnya'],
  [/D\?nya/g, 'D\u00fcnya'],
  [/g\?n/g, 'g\u00fcn'],
  [/G\?n/g, 'G\u00fcn'],
  [/g\?ne/g, 'g\u00fcne'],
  [/s\?per/g, 's\u00fcper'],
  [/g\?zel/g, 'g\u00fczel'],
  [/s\?rpriz/g, 's\u00fcrpriz'],
  [/\?ocuk/g, '\u00e7ocuk'],
  [/\?zel/g, '\u00f6zel'],
  [/\?cretsiz/g, '\u00fccretsiz'],
  [/\?evre/g, '\u00e7evre'],
  [/\?izg/g, '\u00e7izg'],
  [/\?ok/g, '\u00e7ok'],
  [/\?nce/g, '\u00f6nce'],
  [/\?rnek/g, '\u00f6rnek'],
  [/\?zellik/g, '\u00f6zellik'],
  [/a\?\u0131k/g, 'a\u00e7\u0131k']
];

const STRONG_UNRESOLVED_RE = /(?:\uFFFD|ï¿½|[\u0080-\u009f])/;
const MOJIBAKE_HINT_RE = /[ÃÂÄÅâÐÑï\uFFFD\u0080-\u009f]/;

function usage() {
  console.log([
    'Usage:',
    '  node scripts/fix-tour-mojibake.js [--dry-run] [--apply] [--lang tr|en] [--limit 10]',
    '',
    'What it does:',
    '  Scans every tour returned by /api/admin/tours for mojibake in visible text fields.',
    '  Safe repair candidates are generated from UTF-8 text that was decoded as Latin-1/Windows-1252.',
    '  --apply updates only fields that improve the mojibake score and do not introduce replacement chars.',
    '',
    'Env:',
    `  API_BASE_URL       default: ${DEFAULT_API_BASE}`,
    '  ADMIN_JWT          required for non-local API apply/fetch',
    '  LOCAL_ADMIN_JWT=1  force-generate a local Docker admin token',
    '  JWT_SECRET         default local Docker secret when local token is generated'
  ].join('\n'));
}

function parseArgs(argv) {
  const opts = {
    apply: false,
    dryRun: true,
    apiBase: (process.env.API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, ''),
    reportFile: DEFAULT_REPORT_FILE,
    report: true,
    activeOnly: false,
    lang: ''
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--apply') { opts.apply = true; opts.dryRun = false; }
    else if (arg === '--dry-run') { opts.dryRun = true; opts.apply = false; }
    else if (arg === '--base-url') opts.apiBase = String(args[++i] || '').replace(/\/$/, '');
    else if (arg === '--lang' || arg === '--language') opts.lang = String(args[++i] || '').trim();
    else if (arg === '--limit') opts.limit = Number(args[++i]);
    else if (arg === '--active-only') opts.activeOnly = true;
    else if (arg === '--report') opts.reportFile = path.resolve(String(args[++i] || DEFAULT_REPORT_FILE));
    else if (arg === '--no-report') opts.report = false;
  }

  return opts;
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

function isLocalApi(apiBase) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$)/i.test(apiBase);
}

function adminToken(apiBase) {
  if (process.env.ADMIN_JWT) return process.env.ADMIN_JWT;
  if (process.env.LOCAL_ADMIN_JWT === '1' || isLocalApi(apiBase)) return localAdminJwt();
  return '';
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (error) {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${String(text).slice(0, 500)}`);
  }
  return body;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAdminTours(opts, token) {
  async function fetchPage(page) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
      sortBy: 'id',
      sortDirection: 'asc'
    });
    if (opts.lang) params.set('lang', opts.lang);
    if (opts.activeOnly) params.set('isActive', 'true');
    return requestJson(`${opts.apiBase}/admin/tours?${params.toString()}`, {
      headers: authHeaders(token)
    });
  }

  const first = await fetchPage(0);
  if (Array.isArray(first)) return first;

  const totalPages = first.totalPages || 1;
  const pages = [first];
  let nextPage = 1;
  const concurrency = Math.min(8, Math.max(1, totalPages - 1));

  async function worker() {
    while (nextPage < totalPages) {
      const page = nextPage;
      nextPage += 1;
      pages[page] = await fetchPage(page);
    }
  }

  if (totalPages > 1) await Promise.all(Array.from({ length: concurrency }, worker));
  return pages.flatMap((page) => (page && page.content ? page.content : []));
}

function cp1252Char(byte) {
  return CP1252_BYTE_TO_CHAR[byte] || String.fromCharCode(byte);
}

function bytesToCp1252Text(bytes) {
  return Array.from(bytes, cp1252Char).join('');
}

function buildGeneratedMojibakeMap() {
  const ranges = [
    [0x00a0, 0x024f],
    [0x0370, 0x03ff],
    [0x0400, 0x04ff],
    [0x0600, 0x06ff],
    [0x2010, 0x2040],
    [0x20a0, 0x20cf]
  ];
  const map = new Map();

  ranges.forEach(([start, end]) => {
    for (let codePoint = start; codePoint <= end; codePoint += 1) {
      if (codePoint >= 0xd800 && codePoint <= 0xdfff) continue;
      const good = String.fromCodePoint(codePoint);
      const bytes = Buffer.from(good, 'utf8');
      if (bytes.length < 2) continue;

      [bytes.toString('latin1'), bytesToCp1252Text(bytes)].forEach((bad) => {
        if (bad && bad !== good && bad.length >= 2) map.set(bad, good);
      });
    }
  });

  return Array.from(map.entries()).sort((a, b) => b[0].length - a[0].length);
}

const GENERATED_MOJIBAKE_MAP = buildGeneratedMojibakeMap();

function replaceAll(value, search, replacement) {
  return value.split(search).join(replacement);
}

function repairGeneratedMojibake(value) {
  let text = value;
  for (let pass = 0; pass < 3; pass += 1) {
    let next = text;
    GENERATED_MOJIBAKE_MAP.forEach(([bad, good]) => {
      if (next.includes(bad)) next = replaceAll(next, bad, good);
    });
    if (next === text) break;
    text = next;
  }
  return text;
}

function lostCharacterScore(value) {
  return LOST_CHARACTER_REPAIRS.reduce((score, [pattern]) => {
    const matches = String(value || '').match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);
}

function repairKnownLostCharacters(value) {
  let text = value;
  LOST_CHARACTER_REPAIRS.forEach(([pattern, replacement]) => {
    text = text.replace(pattern, replacement);
  });
  return text;
}

function repairOrphanMojibakeMarkers(value) {
  return value
    .replace(/Â(?=\s|$)/g, '')
    .replace(/\s{2,}/g, ' ');
}

function countMatches(value, pattern) {
  const matches = String(value || '').match(pattern);
  return matches ? matches.length : 0;
}

function mojibakeScore(value) {
  const text = String(value || '');
  return (
    countMatches(text, /\uFFFD/g) * 100 +
    countMatches(text, /ï¿½/g) * 100 +
    countMatches(text, /[\u0080-\u009f]/g) * 30 +
    countMatches(text, /(?:Ã.|Â.|Ä.|Å.|â..|Ð.|Ñ.)/g) * 8 +
    countMatches(text, /[ÃÂÄÅâÐÑï]/g) * 2 +
    lostCharacterScore(text) * 12
  );
}

function isSafeRepair(original, candidate) {
  if (candidate === original) return false;
  if (!candidate || candidate.includes('\uFFFD')) return false;
  return mojibakeScore(candidate) < mojibakeScore(original);
}

function repairText(value) {
  if (typeof value !== 'string' || !value) {
    return { changed: false, value, unresolved: false };
  }

  const original = value;
  let candidate = original;

  if (MOJIBAKE_HINT_RE.test(candidate)) {
    candidate = repairGeneratedMojibake(candidate);
    candidate = repairOrphanMojibakeMarkers(candidate);
  }
  if (candidate.includes('?')) {
    candidate = repairKnownLostCharacters(candidate);
  }

  if (isSafeRepair(original, candidate)) {
    return {
      changed: true,
      value: candidate,
      originalScore: mojibakeScore(original),
      candidateScore: mojibakeScore(candidate)
    };
  }

  return {
    changed: false,
    value,
    unresolved: STRONG_UNRESOLVED_RE.test(original)
  };
}

function preview(value, max = 160) {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function addChange(changes, field, before, after, scores) {
  changes.push({
    field,
    before: preview(before),
    after: preview(after),
    originalScore: scores.originalScore,
    candidateScore: scores.candidateScore
  });
}

function addUnresolved(unresolved, field, value) {
  unresolved.push({ field, value: preview(value) });
}

function scanStringField({ owner, key, field, changes, unresolved, setValue }) {
  const value = owner && owner[key];
  if (typeof value !== 'string' || !value) return false;

  const repaired = repairText(value);
  if (repaired.changed) {
    setValue(repaired.value);
    addChange(changes, field, value, repaired.value, repaired);
    return true;
  }
  if (repaired.unresolved) addUnresolved(unresolved, field, value);
  return false;
}

function scanTour(tour) {
  const payload = {};
  const changes = [];
  const unresolved = [];

  TOP_LEVEL_TEXT_FIELDS.forEach((field) => {
    scanStringField({
      owner: tour,
      key: field,
      field,
      changes,
      unresolved,
      setValue: (value) => { payload[field] = value; }
    });
  });

  REPORT_ONLY_FIELDS.forEach((field) => {
    const value = tour[field];
    if (typeof value !== 'string' || !value) return;
    const repaired = repairText(value);
    if (repaired.changed || repaired.unresolved) {
      addUnresolved(unresolved, `${field} (report-only)`, value);
    }
  });

  if (Array.isArray(tour.destinations) && tour.destinations.length) {
    let changed = false;
    const destinations = tour.destinations.map((destination, index) => {
      if (typeof destination !== 'string') return destination;
      const repaired = repairText(destination);
      if (repaired.changed) {
        changed = true;
        addChange(changes, `destinations[${index}]`, destination, repaired.value, repaired);
        return repaired.value;
      }
      if (repaired.unresolved) addUnresolved(unresolved, `destinations[${index}]`, destination);
      return destination;
    });
    if (changed) payload.destinations = destinations;
  }

  if (Array.isArray(tour.dayInfo) && tour.dayInfo.length) {
    let changed = false;
    const dayInfo = tour.dayInfo.map((day, index) => {
      const next = {
        dayNumber: day.dayNumber || index + 1,
        title: day.title || '',
        description: day.description || ''
      };

      ['title', 'description'].forEach((field) => {
        if (scanStringField({
          owner: next,
          key: field,
          field: `dayInfo[${index}].${field}`,
          changes,
          unresolved,
          setValue: (value) => { next[field] = value; }
        })) changed = true;
      });

      return next;
    });
    if (changed) payload.dayInfo = dayInfo;
  }

  if (Array.isArray(tour.route) && tour.route.length) {
    let changed = false;
    const route = tour.route.map((stop, index) => {
      const next = {
        name: stop.name || '',
        country: stop.country || ''
      };

      ['name', 'country'].forEach((field) => {
        if (scanStringField({
          owner: next,
          key: field,
          field: `route[${index}].${field}`,
          changes,
          unresolved,
          setValue: (value) => { next[field] = value; }
        })) changed = true;
      });

      return next;
    });
    if (changed) payload.route = route;
  }

  if (Array.isArray(tour.routeCoordinates) && tour.routeCoordinates.length) {
    let changed = false;
    const routeCoordinates = tour.routeCoordinates.map((coord, index) => {
      const next = {
        name: coord.name || '',
        country: coord.country || '',
        lat: coord.lat,
        lng: coord.lng
      };

      ['name', 'country'].forEach((field) => {
        if (scanStringField({
          owner: next,
          key: field,
          field: `routeCoordinates[${index}].${field}`,
          changes,
          unresolved,
          setValue: (value) => { next[field] = value; }
        })) changed = true;
      });

      return next;
    });
    if (changed) payload.routeCoordinates = routeCoordinates;
  }

  return { changes, unresolved, payload };
}

async function updateTour(apiBase, token, tourId, payload) {
  return requestJson(`${apiBase}/admin/tours/${tourId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token)
    },
    body: JSON.stringify(payload)
  });
}

function writeReport(reportFile, report) {
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

function summarizeByLanguage(tours) {
  return tours.reduce((summary, tour) => {
    const lang = tour.language || 'unknown';
    summary[lang] = (summary[lang] || 0) + 1;
    return summary;
  }, {});
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    usage();
    return;
  }

  const token = adminToken(opts.apiBase);
  if (!token) {
    throw new Error('ADMIN_JWT is required unless the API base is localhost or LOCAL_ADMIN_JWT=1 is set.');
  }

  const fetchedTours = await fetchAdminTours(opts, token);
  const tours = opts.limit ? fetchedTours.slice(0, opts.limit) : fetchedTours;

  const results = tours.map((tour) => {
    const scanned = scanTour(tour);
    return {
      id: tour.id,
      slug: tour.slug,
      language: tour.language,
      isActive: tour.isActive,
      changes: scanned.changes,
      unresolved: scanned.unresolved,
      payload: scanned.payload
    };
  });

  const repairable = results.filter((result) => result.changes.length);
  const unresolved = results.filter((result) => result.unresolved.length);
  const fieldChangeCount = repairable.reduce((sum, result) => sum + result.changes.length, 0);
  const unresolvedFieldCount = unresolved.reduce((sum, result) => sum + result.unresolved.length, 0);

  const report = {
    generatedAt: new Date().toISOString(),
    mode: opts.apply ? 'apply' : 'dry-run',
    apiBase: opts.apiBase,
    scannedTours: tours.length,
    fetchedTours: fetchedTours.length,
    languageCounts: summarizeByLanguage(tours),
    repairableTours: repairable.length,
    repairableFields: fieldChangeCount,
    unresolvedTours: unresolved.length,
    unresolvedFields: unresolvedFieldCount,
    repairs: repairable.map(({ payload, ...result }) => result),
    unresolved: unresolved.map(({ payload, changes, ...result }) => result)
  };

  console.log(`Fetched tours: ${fetchedTours.length}`);
  console.log(`Scanned tours: ${tours.length}`);
  console.log(`Language counts: ${JSON.stringify(report.languageCounts)}`);
  console.log(`Repairable tours: ${repairable.length}`);
  console.log(`Repairable fields: ${fieldChangeCount}`);
  console.log(`Unresolved suspicious tours: ${unresolved.length}`);
  console.log(`Unresolved suspicious fields: ${unresolvedFieldCount}`);
  console.log(`Mode: ${opts.apply ? 'apply' : 'dry-run'}`);

  if (repairable.length) {
    console.log('Sample repairs:');
    repairable.slice(0, 10).forEach((result) => {
      const first = result.changes[0];
      console.log(`  #${result.id} ${result.language || '?'} ${result.slug || '(no slug)'} ${first.field}: "${first.before}" -> "${first.after}"`);
    });
  }

  if (opts.apply) {
    let updated = 0;
    for (const result of repairable) {
      await updateTour(opts.apiBase, token, result.id, result.payload);
      updated += 1;
      console.log(`Updated ${updated}/${repairable.length}: #${result.id} ${result.language || '?'} ${result.slug || '(no slug)'} (${result.changes.length} fields)`);
    }
    report.updatedTours = updated;
  }

  if (opts.report) {
    writeReport(opts.reportFile, report);
    console.log(`Report written: ${opts.reportFile}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
