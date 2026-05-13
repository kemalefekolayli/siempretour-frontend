const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.resolve(process.env.REPORT_PATH || path.join(ROOT, 'reports', 'photo-quality-rows.json'));
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || path.join(ROOT, 'images', 'tour-photos-backup-before-quality-replace'));
const APPLY = process.env.APPLY === '1';
const MIN_WIDTH_GAIN = Number(process.env.MIN_WIDTH_GAIN || 1);
const MIN_BYTE_GAIN = Number(process.env.MIN_BYTE_GAIN || 1.25);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyWithDirs(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function shouldReplace(row) {
  if (!row.originalMatch || !row.originalPath) return false;
  if (row.sameBytes) return false;
  if (row.originalWidth >= row.currentWidth * MIN_WIDTH_GAIN && row.originalHeight >= row.currentHeight) return true;
  return row.originalBytes >= row.currentBytes * MIN_BYTE_GAIN;
}

function run() {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error(`Report not found: ${REPORT_PATH}. Run scripts/photo-quality-report.js first.`);
  }

  const rows = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const candidates = rows.filter(shouldReplace);
  let replaced = 0;
  let skippedMissing = 0;
  const examples = [];

  for (const row of candidates) {
    const current = path.join(ROOT, row.path);
    const original = path.join(ROOT, row.originalPath);
    const backup = path.join(BACKUP_DIR, row.path.replace(/^images[\\/]/, ''));

    if (!fs.existsSync(current) || !fs.existsSync(original)) {
      skippedMissing += 1;
      continue;
    }

    if (examples.length < 20) {
      examples.push({
        path: row.path,
        current: `${row.currentWidth}x${row.currentHeight} ${row.currentBytes} bytes`,
        original: `${row.originalWidth}x${row.originalHeight} ${row.originalBytes} bytes`,
      });
    }

    if (APPLY) {
      copyWithDirs(current, backup);
      copyWithDirs(original, current);
    }

    replaced += 1;
  }

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? 'APPLY' : 'DRY_RUN',
        reportPath: REPORT_PATH,
        backupDir: BACKUP_DIR,
        candidates: candidates.length,
        replaced,
        skippedMissing,
        examples,
      },
      null,
      2
    )
  );

  if (!APPLY) {
    console.log('No files changed. Set APPLY=1 to copy originals over current assets with backups.');
  }
}

run();
