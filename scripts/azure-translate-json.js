#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEFAULT_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';
const CACHE_FILE = path.join(__dirname, '.azure-translation-cache.json');
const BATCH_LIMIT = 80;
const CHAR_LIMIT = 40000;

const SKIP_KEY_RE = /(^|_)(id|slug|url|href|src|path|photo|image|file|icon|language|destination|category|eventType|shipName|shipCompany|routeCoordinates|startDate|endDate)$/i;
const FILE_LIKE_RE = /^(https?:\/\/|data:|mailto:|tel:|images\/|avrupa-turlari\/|\/|\.\/|\.\.\/).*\.(jpg|jpeg|png|webp|gif|svg|avif|pdf)?($|\?)/i;

function usage() {
  console.log([
    'Usage:',
    '  node scripts/azure-translate-json.js <source.json> <target.json> [--from tr] [--to en]',
    '',
    'Required env:',
    '  AZURE_TRANSLATOR_KEY',
    '  AZURE_TRANSLATOR_REGION',
    '',
    'Optional env:',
    `  AZURE_TRANSLATOR_ENDPOINT (default: ${DEFAULT_ENDPOINT})`
  ].join('\n'));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = { from: 'tr', to: 'en' };
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else if (arg === '--from') {
      opts.from = args[++i];
    } else if (arg === '--to') {
      opts.to = args[++i];
    } else {
      positional.push(arg);
    }
  }

  opts.source = positional[0];
  opts.target = positional[1];
  return opts;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return readJson(CACHE_FILE);
  } catch (error) {
    return {};
  }
}

function writeCache(cache) {
  writeJson(CACHE_FILE, cache);
}

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function cacheKey(item, from, to) {
  return [from, to, item.textType, hash(item.text)].join(':');
}

function looksTechnical(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  if (/^[\d\s.,:+/-]+$/.test(text)) return true;
  if (FILE_LIKE_RE.test(text)) return true;
  if (/^[A-Z0-9_/-]{2,}$/.test(text) && !/\s/.test(text)) return true;
  return false;
}

function shouldTranslate(key, value) {
  if (typeof value !== 'string') return false;
  if (SKIP_KEY_RE.test(String(key || ''))) return false;
  if (looksTechnical(value)) return false;
  return true;
}

function textType(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value) ? 'html' : 'plain';
}

function collectStrings(node, items, trail = []) {
  if (Array.isArray(node)) {
    node.forEach((value, index) => collectStrings(value, items, trail.concat(index)));
    return;
  }

  if (node && typeof node === 'object') {
    Object.entries(node).forEach(([key, value]) => {
      if (shouldTranslate(key, value)) {
        items.push({ path: trail.concat(key), text: value, textType: textType(value) });
      } else {
        collectStrings(value, items, trail.concat(key));
      }
    });
  }
}

function setPath(root, trail, value) {
  let cursor = root;
  for (let i = 0; i < trail.length - 1; i += 1) {
    cursor = cursor[trail[i]];
  }
  cursor[trail[trail.length - 1]] = value;
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

async function translateBatch(batch, from, to, textTypeValue) {
  const key = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const endpoint = (process.env.AZURE_TRANSLATOR_ENDPOINT || DEFAULT_ENDPOINT).replace(/\/$/, '');

  if (!key || !region) {
    throw new Error('AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION are required.');
  }

  const url = `${endpoint}/translate?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&textType=${encodeURIComponent(textTypeValue)}`;
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

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help || !opts.source || !opts.target) {
    usage();
    process.exit(opts.help ? 0 : 1);
  }

  const sourcePath = path.resolve(opts.source);
  const targetPath = path.resolve(opts.target);
  const data = readJson(sourcePath);
  const items = [];
  collectStrings(data, items);

  const cache = readCache();
  const pending = items.filter((item) => {
    const key = cacheKey(item, opts.from, opts.to);
    if (cache[key]) {
      setPath(data, item.path, cache[key]);
      return false;
    }
    return true;
  });

  console.log(`Found ${items.length} translatable strings, ${pending.length} need Azure.`);

  for (const type of ['plain', 'html']) {
    const byType = pending.filter((item) => item.textType === type);
    for (const chunk of chunkItems(byType)) {
      const translated = await translateBatch(chunk, opts.from, opts.to, type);
      translated.forEach((value, index) => {
        const item = chunk[index];
        cache[cacheKey(item, opts.from, opts.to)] = value;
        setPath(data, item.path, value);
      });
      writeCache(cache);
      console.log(`Translated ${chunk.length} ${type} strings.`);
    }
  }

  writeJson(targetPath, data);
  console.log(`Wrote ${path.relative(process.cwd(), targetPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
