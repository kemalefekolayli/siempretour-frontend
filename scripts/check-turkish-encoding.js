const fs = require('fs');
const path = require('path');

const root = process.cwd();
const checkedFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'template_tours_grid_page.html',
  'template_tour_page.html',
  'tour-grid.html',
  'js/lang-detect.js',
  'js/api-service.js',
  'js/reviews.js',
  'js/template_tour_page.js',
  'css/style.css',
  'css/chat-widget.css'
];

const mojibakePattern = /Ã|Ä±|Ä°|ÄŸ|Äž|ÅŸ|Åž|Å|Ã§|Ã‡|Ã¼|Ãœ|Ã¶|Ã–|Â|â€|ï¿½/;
const brokenTurkishPattern = /\b(?:Hakk\?m\?zda|Giri\?|Kay\?t|T\?rkiye|\?leti\?im|\?zel|\?artlar|\?ifreni)\b/;

const issues = [];

for (const relFile of checkedFiles) {
  const file = path.join(root, relFile);
  if (!fs.existsSync(file)) continue;
  const rel = path.relative(root, file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (mojibakePattern.test(line) || brokenTurkishPattern.test(line)) {
      issues.push(`${rel}:${index + 1}: ${line.trim().slice(0, 180)}`);
    }
  });
}

if (issues.length) {
  console.error(`TURKISH_ENCODING_ISSUES=${issues.length}`);
  for (const issue of issues.slice(0, 200)) console.error(issue);
  if (issues.length > 200) console.error(`...TRUNCATED ${issues.length - 200} MORE`);
  process.exit(1);
}

console.log('TURKISH_ENCODING_OK');
