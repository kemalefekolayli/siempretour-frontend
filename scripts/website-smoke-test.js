const fs = require('fs');
const path = require('path');

const base = 'http://localhost:8080/api';
const root = process.cwd();
const countries = [
  'Albania','Andorra','Austria','Bosnia Herzegovina','Bulgaria','Channel Islands','Croatia','Czech Republic','Denmark','England','Estonia','Faroe Islands','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kosovo','Lapland','Latvia','Lithuania','Malta','Moldova','Montenegro','Norway','Poland','Portugal','Romania','Scotland','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Uk'
];
const langs = ['en', 'tr'];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 6) {
  let attempt = 0;
  while (attempt <= retries) {
    const res = await fetch(url);
    if (res.status !== 429) return res;
    attempt += 1;
    await sleep(250 + attempt * 200);
  }
  return fetch(url);
}

(async () => {
  const issues = [];
  let totalTours = 0;

  for (const country of countries) {
    for (const lang of langs) {
      const url = `${base}/tours/by-destination?destination=${encodeURIComponent(country)}&lang=${encodeURIComponent(lang)}`;
      const r = await fetchWithRetry(url);
      if (!r.ok) {
        issues.push(`FETCH_FAIL ${country} ${lang} ${r.status}`);
        continue;
      }

      const tours = await r.json();
      if (!Array.isArray(tours)) {
        issues.push(`NOT_ARRAY ${country} ${lang}`);
        continue;
      }

      totalTours += tours.length;

      for (const t of tours) {
        if (!t.slug) {
          issues.push(`NO_SLUG ${country} ${lang} id=${t.id}`);
          continue;
        }

        if (!t.image1) issues.push(`NO_IMAGE1 ${country} ${lang} slug=${t.slug}`);
        if (!t.mainPhoto) issues.push(`NO_MAINPHOTO ${country} ${lang} slug=${t.slug}`);

        for (const f of ['image1', 'mainPhoto']) {
          const rel = t[f];
          if (!rel) continue;
          const abs = path.join(root, ...rel.split('/'));
          if (!fs.existsSync(abs)) {
            issues.push(`MISSING_FILE ${country} ${lang} ${f} slug=${t.slug} path=${rel}`);
          }
        }

        const dr = await fetchWithRetry(`${base}/tours/by-slug/${encodeURIComponent(t.slug)}?lang=${encodeURIComponent(lang)}`);
        if (!dr.ok) {
          issues.push(`DETAIL_FAIL ${country} ${lang} slug=${t.slug} status=${dr.status}`);
          continue;
        }
        const detail = await dr.json();
        if (!detail?.image1) issues.push(`DETAIL_NO_IMAGE1 ${country} ${lang} slug=${t.slug}`);

        await sleep(20);
      }
    }
  }

  console.log(`TOTAL_TOURS_CHECKED=${totalTours}`);
  if (issues.length === 0) {
    console.log('SMOKE_OK');
    return;
  }

  console.log(`ISSUE_COUNT=${issues.length}`);
  for (const item of issues.slice(0, 300)) console.log(item);
  if (issues.length > 300) console.log(`...TRUNCATED ${issues.length - 300} MORE`);
  process.exitCode = 2;
})();
