#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_BASE = 'http://localhost:5501';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.CHROME_DEBUG_PORT || 9327);
const WAIT_MS = Number(process.env.ENCODING_WAIT_MS || 9000);

const URLS = [
  '/index.html?lang=tr',
  '/index.html?lang=en',
  '/login.html?lang=tr',
  '/login.html?lang=en',
  '/cruise-grid.html?lang=tr',
  '/cruise-grid.html?lang=en',
  '/cruise-list.html?lang=tr',
  '/cruise-list.html?lang=en',
  '/template_tours_grid_page.html?country=Albania&lang=tr',
  '/template_tours_grid_page.html?country=Albania&lang=en',
  '/template_tour_page.html?id=albania-holidays-small-group-tour&country=Albania&lang=tr',
  '/template_tour_page.html?id=albania-holidays-small-group-tour&country=Albania&lang=en',
  '/booking.html?id=albania-holidays-small-group-tour&country=Albania&lang=tr',
  '/booking.html?id=albania-holidays-small-group-tour&country=Albania&lang=en'
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

async function waitForChrome() {
  const versionUrl = `http://127.0.0.1:${PORT}/json/version`;
  for (let i = 0; i < 60; i += 1) {
    try {
      return await fetchJson(versionUrl);
    } catch (error) {
      await sleep(250);
    }
  }
  throw new Error('Chrome DevTools endpoint did not become ready.');
}

function connectCdp(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  const callbacks = new Map();
  let nextId = 1;

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !callbacks.has(message.id)) return;
    const { resolve, reject } = callbacks.get(message.id);
    callbacks.delete(message.id);
    if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
    else resolve(message.result);
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const id = nextId;
          nextId += 1;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((sendResolve, sendReject) => {
            callbacks.set(id, { resolve: sendResolve, reject: sendReject });
          });
        },
        close() {
          socket.close();
        }
      });
    });
    socket.addEventListener('error', reject);
  });
}

function scanExpression() {
  return `
(() => {
  const badTextRe = /(?:Ã.|Ä.|Å[\\u0080-\\u017f]|Â.|â[\\u0080-\\u017f]|�|\\?zeti|\\?ocuk|i\\?in|l\\?tfen|G\\?verte|g\\?verte)/;
  const ignored = 'script, style, noscript, template, svg, canvas, code, pre';
  const attrNames = ['placeholder', 'title', 'aria-label', 'alt', 'value'];

  function isVisibleElement(el) {
    if (!el || el.closest(ignored)) return false;
    if (el.closest('[aria-hidden="true"], [hidden], [data-i18n-skip]')) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }

  function short(text) {
    return String(text || '').replace(/\\s+/g, ' ').trim().slice(0, 220);
  }

  const issues = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!isVisibleElement(parent)) return NodeFilter.FILTER_REJECT;
      return short(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) {
    const text = short(walker.currentNode.nodeValue);
    if (badTextRe.test(text)) issues.push({ type: 'text', text });
  }

  document.querySelectorAll('*').forEach((node) => {
    if (!isVisibleElement(node)) return;
    attrNames.forEach((attr) => {
      if (!node.hasAttribute(attr)) return;
      const text = short(node.getAttribute(attr));
      if (badTextRe.test(text)) issues.push({ type: attr, text });
    });
  });

  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang,
    issueCount: issues.length,
    issues: issues.slice(0, 25)
  };
})()
`;
}

async function scanUrl(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await sleep(WAIT_MS);
  const result = await cdp.send('Runtime.evaluate', {
    expression: scanExpression(),
    returnByValue: true,
    awaitPromise: true
  });
  return result.result.value;
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, '');
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found: ${CHROME}`);

  const userDataDir = path.join(os.tmpdir(), `siempre-encoding-${Date.now()}`);
  const chrome = spawn(CHROME, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-cache',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    await waitForChrome();
    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
    const target = targets.find((item) => item.type === 'page') || targets[0];
    const cdp = await connectCdp(target.webSocketDebuggerUrl);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const results = [];
    for (const relativeUrl of URLS) {
      const result = await scanUrl(cdp, base + relativeUrl);
      results.push(result);
      console.log(`${result.issueCount ? 'ENCODING_ISSUES' : 'ENCODING_OK'} ${relativeUrl} count=${result.issueCount}`);
      result.issues.forEach((issue) => console.log(`  ${issue.type}: ${issue.text}`));
    }

    cdp.close();
    const total = results.reduce((sum, result) => sum + result.issueCount, 0);
    if (total) {
      console.log(`ENCODING_TOTAL_ISSUES=${total}`);
      process.exitCode = 1;
    } else {
      console.log('ENCODING_SMOKE_OK');
    }
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
