// Builds the "Tur Rehberleri" data files from the travel-guide archive.
//
//   Input : unzipped archive folder containing data/<region>/<country>/<section>.json
//   Output: data/tur-rehberleri/index.json           (regions + country cards)
//           data/tur-rehberleri/<country-slug>.json  (sections with rendered HTML)
//
// Usage (marked is not a site dependency; install it next to the script run):
//   npm i marked@14 && node tools/build_tur_rehberleri.js <archive-folder> [frontend-root]
//
// Raw HTML inside the Markdown is escaped, so the generated HTML only contains
// what Markdown itself produces (headings, paragraphs, lists, tables, emphasis).

const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');

const archive = process.argv[2];
const frontend = process.argv[3] || path.resolve(__dirname, '..');
if (!archive) {
  console.error('Usage: node tools/build_tur_rehberleri.js <archive-folder> [frontend-root]');
  process.exit(1);
}
const dataDir = path.join(archive, 'data');
const outDir = path.join(frontend, 'data', 'tur-rehberleri');
const photoRoot = path.join(frontend, 'images', 'tour-photos');

// Region folder -> Turkish name, display order, card color for photo-less cards.
const REGIONS = {
  'europe': { tr: 'Avrupa', en: 'Europe', order: 1, color: '#2f5d8a' },
  'asia': { tr: 'Asya', en: 'Asia', order: 2, color: '#a4452c' },
  'africa': { tr: 'Afrika', en: 'Africa', order: 3, color: '#b9772f' },
  'middle-east': { tr: 'Orta Doğu', en: 'Middle East', order: 4, color: '#a8742f' },
  'south-america': { tr: 'Güney Amerika', en: 'South America', order: 5, color: '#3f7d4e' },
  'central-america': { tr: 'Orta Amerika', en: 'Central America', order: 6, color: '#3a7f72' },
  'north-america': { tr: 'Kuzey Amerika', en: 'North America', order: 7, color: '#4d5f86' },
  'caribbean': { tr: 'Karayipler', en: 'Caribbean', order: 8, color: '#2b8aa0' },
  'oceania': { tr: 'Okyanusya', en: 'Oceania', order: 9, color: '#2c7aa8' },
  'polar-region': { tr: 'Kutup Bölgeleri', en: 'Polar Regions', order: 10, color: '#4f7894' },
  'uk': { tr: 'Birleşik Krallık', en: 'United Kingdom', order: 11, color: '#5a4f86' }
};

// Country folder -> [Turkish name, tour-page country key (nav data-country) or null,
// photo folder under images/tour-photos or null]. overview:true marks a region's
// general guide, shown first in its region.
const C = {
  // Africa
  'africa': ['Afrika Genel', null, 'Tanzania', true], 'algeria': ['Cezayir', 'Algeria', 'algeria'],
  'angola': ['Angola', 'Angola', 'angola'], 'benin': ['Benin', 'Benin', 'benin'],
  'botswana': ['Botsvana', 'Botswana', 'botswana'], 'burkina-faso': ['Burkina Faso', 'Burkina Faso', 'Burkina Faso'],
  'burundi': ['Burundi', 'Burundi', 'burundi'], 'cameroon': ['Kamerun', 'Cameroon', 'cameroon'],
  'cape-verde': ['Yeşil Burun Adaları', 'Cape Verde Islands', 'Cape_Verde_Islands'],
  'central-african-republic': ['Orta Afrika Cumhuriyeti', null, null], 'chad': ['Çad', 'Chad', 'chad'],
  'comoros': ['Komorlar', 'Comoros', 'Comoros'], 'congo': ['Kongo', 'Congo', 'Congo'],
  'djibouti': ['Cibuti', 'Djibouti', 'Djibouti'], 'equatorial-guinea': ['Ekvator Ginesi', 'Equatorial Guinea', 'Equatorial_Guinea'],
  'eritrea': ['Eritre', 'Eritrea', 'Eritrea'], 'ethiopia': ['Etiyopya', 'Ethiopia', 'Ethiopia'],
  'gabon': ['Gabon', 'Gabon', 'Gabon'], 'gambia': ['Gambiya', 'Gambia', 'gambia'], 'ghana': ['Gana', 'Ghana', 'Ghana'],
  'guinea': ['Gine', 'Guinea', 'Guinea'], 'guinea-bissau': ['Gine-Bissau', null, null],
  'ivory-coast': ['Fildişi Sahili', 'Ivory Coast', 'Ivory-Coast'], 'kenya': ['Kenya', 'Kenya', 'Kenya'],
  'liberia': ['Liberya', 'Liberia', 'Liberia'], 'libya': ['Libya', 'Libya', 'libya'],
  'madagascar': ['Madagaskar', 'Madagascar', 'Madagascar'], 'malawi': ['Malavi', 'Malawi', 'Malawi'],
  'mali': ['Mali', 'Mali', 'Mali'], 'mauritania': ['Moritanya', 'Mauritania', 'Mauritania'],
  'mauritius': ['Mauritius', 'Mauritius', 'mauritius'], 'morocco': ['Fas', 'Morocco', 'Morocco'],
  'mozambique': ['Mozambik', 'Mozambique', 'Mozambique'], 'namibia': ['Namibya', 'Namibia', 'Namibia'],
  'nigeria': ['Nijerya', 'Nigeria', 'Nigeria'], 'rwanda': ['Ruanda', 'Rwanda', 'Rwanda'],
  'sao-tome-principe': ['São Tomé ve Príncipe', 'Sao Tome And Principe', 'Sao_Tome_And_Principe'],
  'senegal': ['Senegal', 'Senegal', 'senegal'], 'seychelles': ['Seyşeller', 'Seychelles', 'Seychelles'],
  'sierra-leone': ['Sierra Leone', 'Sierra Leone', 'sierra-leone'], 'somaliland': ['Somaliland', null, null],
  'south-africa': ['Güney Afrika', 'South Africa', 'South_Africa'], 'south-sudan': ['Güney Sudan', 'South Sudan', 'South-Sudan'],
  'st-helena': ['Saint Helena', 'St Helena', 'Saint_Helena'], 'sudan': ['Sudan', null, null],
  'swaziland': ['Esvatini', 'Swaziland', 'Swaziland'], 'tanzania': ['Tanzanya', 'Tanzania', 'Tanzania'],
  'togo': ['Togo', null, null], 'tunisia': ['Tunus', 'Tunisia', 'Tunisia'], 'uganda': ['Uganda', 'Uganda', 'uganda'],
  'western-sahara': ['Batı Sahra', 'Western Sahara', 'Western-Sahara'], 'zambia': ['Zambiya', 'Zambia', 'Zambia'],
  'zimbabwe': ['Zimbabve', 'Zimbabwe', 'zimbabwe'],
  // Asia
  'asia': ['Asya Genel', null, 'Japan', true], 'azerbaijan': ['Azerbaycan', 'Azerbaijan', 'Azerbaijan'],
  'bangladesh': ['Bangladeş', 'Bangladesh', 'Bangladesh'], 'bhutan': ['Butan', 'Bhutan', 'Bhutan'],
  'borneo': ['Borneo', 'Borneo', 'Borneo'], 'brunei': ['Brunei', 'Brunei', 'Brunei'],
  'burma': ['Myanmar (Burma)', 'Burma', 'Myanmar'], 'cambodia': ['Kamboçya', 'Cambodia', 'Cambodia'],
  'china': ['Çin', 'China', 'China'], 'india': ['Hindistan', 'India', 'India'], 'indonesia': ['Endonezya', 'Indonesia', 'Indonesia'],
  'japan': ['Japonya', 'Japan', 'Japan'], 'kazakhstan': ['Kazakistan', 'Kazakhstan', 'Kazakhstan'],
  'kyrgyzstan': ['Kırgızistan', 'Kyrgyzstan', 'Kyrgyzstan'], 'laos': ['Laos', 'Laos', 'Laos'],
  'malaysia': ['Malezya', 'Malaysia', 'Malaysia'], 'maldives': ['Maldivler', 'Maldives', 'Maldives'],
  'mongolia': ['Moğolistan', 'Mongolia', 'Mongolia'], 'nepal': ['Nepal', 'Nepal', 'Nepal'],
  'pakistan': ['Pakistan', 'Pakistan', 'Pakistan'], 'philippines': ['Filipinler', 'Philippines', 'Philippines'],
  'singapore': ['Singapur', 'Singapore', 'Singapore'], 'south-korea': ['Güney Kore', 'South Korea', 'South_Korea'],
  'sri-lanka': ['Sri Lanka', 'Sri Lanka', 'Sri_Lanka'], 'taiwan': ['Tayvan', 'Taiwan', 'Taiwan'],
  'tajikistan': ['Tacikistan', 'Tajikistan', 'Tajikistan'], 'thailand': ['Tayland', 'Thailand', 'Thailand'],
  'tibet': ['Tibet', 'Tibet', 'Tibet'], 'timor-leste': ['Doğu Timor', 'East Timor', 'East_Timor'],
  'turkmenistan': ['Türkmenistan', 'Turkmenistan', 'Turkmenistan'], 'uzbekistan': ['Özbekistan', 'Uzbekistan', 'Uzbekistan'],
  'vietnam': ['Vietnam', 'Vietnam', 'Vietnam'],
  // Caribbean
  'caribbean': ['Karayipler Genel', null, 'cuba', true], 'cuba': ['Küba', 'Cuba', 'cuba'],
  'dominica': ['Dominika', 'Dominica', 'Dominica'], 'dominican-republic': ['Dominik Cumhuriyeti', 'Dominican Republic', 'Dominican Republic'],
  'grenada': ['Grenada', null, null], 'jamaica': ['Jamaika', 'Jamaica', 'Jamaica'],
  'saint-lucia': ['Saint Lucia', 'Saint Lucia', 'Saint_Lucia'], 'tobago': ['Tobago', 'Trinidad And Tobago', 'Trinidad-Tobago'],
  // Central America
  'central-america': ['Orta Amerika Genel', null, 'CostaRica', true], 'belize': ['Belize', 'Belize', 'Belize'],
  'costa-rica': ['Kosta Rika', 'Costa Rica', 'CostaRica'], 'el-salvador': ['El Salvador', 'El Salvador', 'El_Salvador'],
  'guatemala': ['Guatemala', 'Guatemala', 'Guatemala'], 'honduras': ['Honduras', null, null],
  'nicaragua': ['Nikaragua', 'Nicaragua', 'Nicaragua'], 'panama': ['Panama', 'Panama', 'Panama'],
  // Europe
  'europe': ['Avrupa Genel', null, 'Italy', true], 'walking-holidays-in-europe': ['Avrupa Yürüyüş Tatilleri', null, 'Slovenia'],
  'albania': ['Arnavutluk', 'Albania', 'Albania'], 'andorra': ['Andorra', 'Andorra', 'Andorra'],
  'armenia': ['Ermenistan', 'Armenia', 'Armenia'], 'austria': ['Avusturya', 'Austria', 'Austria'],
  'azores': ['Azor Adaları', 'Azores', 'Azores'], 'bosnia-herzegovina': ['Bosna-Hersek', 'Bosnia Herzegovina', 'Bosnia-Herzegovina'],
  'bulgaria': ['Bulgaristan', 'Bulgaria', 'Bulgaria'], 'canary-islands': ['Kanarya Adaları', 'Canary Islands', 'Canary_Islands'],
  'croatia': ['Hırvatistan', 'Croatia', 'Croatia'], 'cyprus': ['Kıbrıs', 'Cyprus', 'Cyprus'],
  'czechia': ['Çekya', 'Czech Republic', 'Czech-republic'], 'denmark': ['Danimarka', 'Denmark', 'Denmark'],
  'estonia': ['Estonya', 'Estonia', 'Estonia'], 'faroe-islands': ['Faroe Adaları', 'Faroe Islands', 'Faroe-islands'],
  'finland': ['Finlandiya', 'Finland', 'Finland'], 'france': ['Fransa', 'France', 'France'],
  'georgia': ['Gürcistan', 'Georgia', 'Georgia'], 'germany': ['Almanya', 'Germany', 'Germany'],
  'greece': ['Yunanistan', 'Greece', 'Greece'], 'hungary': ['Macaristan', 'Hungary', 'Hungary'],
  'iceland': ['İzlanda', 'Iceland', 'Iceland'], 'ireland': ['İrlanda', 'Ireland', 'Ireland'],
  'italy': ['İtalya', 'Italy', 'Italy'], 'kosovo': ['Kosova', 'Kosovo', 'Kosovo'],
  'lapland': ['Laponya', 'Lapland', 'Lapland'], 'latvia': ['Letonya', 'Latvia', 'Latvia'],
  'lithuania': ['Litvanya', 'Lithuania', 'Lithuania'], 'macedonia': ['Kuzey Makedonya', null, null],
  'malta': ['Malta', 'Malta', 'Malta'], 'moldova': ['Moldova', 'Moldova', 'Moldova'],
  'montenegro': ['Karadağ', 'Montenegro', 'Montenegro'], 'norway': ['Norveç', 'Norway', 'Norway'],
  'poland': ['Polonya', 'Poland', 'Poland'], 'portugal': ['Portekiz', 'Portugal', 'Portugal'],
  'romania': ['Romanya', 'Romania', 'Romania'], 'serbia': ['Sırbistan', 'Serbia', 'Serbia'],
  'slovakia': ['Slovakya', 'Slovakia', 'Slovakia'], 'slovenia': ['Slovenya', 'Slovenia', 'Slovenia'],
  'spain': ['İspanya', 'Spain', 'Spain'], 'sweden': ['İsveç', 'Sweden', 'Sweden'],
  'switzerland': ['İsviçre', 'Switzerland', 'Switzerland'], 'the-netherlands': ['Hollanda', null, null],
  'turkey': ['Türkiye', 'Turkey', 'Turkey'],
  // Middle East
  'middle-east': ['Orta Doğu Genel', null, 'Jordan', true], 'egypt': ['Mısır', 'Egypt', 'egypt'],
  'iran': ['İran', 'Iran', 'Iran'], 'iraq': ['Irak', 'Iraq', 'Iraq'], 'israel': ['İsrail', 'Israel', 'Israel'],
  'jordan': ['Ürdün', 'Jordan', 'Jordan'], 'lebanon': ['Lübnan', 'Lebanon', 'Lebanon'], 'oman': ['Umman', 'Oman', 'Oman'],
  'palestine': ['Filistin', null, null], 'saudi-arabia': ['Suudi Arabistan', 'Saudi Arabia', 'Saudi_Arabia'],
  'syria': ['Suriye', 'Syria', 'Syria'], 'united-arab-emirates': ['Birleşik Arap Emirlikleri', 'United Arab Emirates', 'United_Arab_Emirates'],
  // North America
  'north-america': ['Kuzey Amerika Genel', null, 'Canada', true], 'alaska-usa': ['Alaska', 'Alaska', 'Alaska'],
  'canada': ['Kanada', 'Canada', 'Canada'], 'mexico': ['Meksika', 'Mexico', 'Mexico'], 'usa': ['ABD', 'Usa', 'Usa'],
  // Oceania
  'oceania': ['Okyanusya Genel', null, 'Fiji', true], 'australia': ['Avustralya', 'Australia', 'Australia'],
  'fiji': ['Fiji', 'Fiji', 'Fiji'], 'french-polynesia': ['Fransız Polinezyası', 'French Polynesia', 'French-Polynesia'],
  'new-zealand': ['Yeni Zelanda', 'New Zealand', 'New-Zealand'], 'papua-new-guinea': ['Papua Yeni Gine', 'Papua New Guinea', 'Papua-New-Guinea'],
  // Polar
  'antarctica-arctic': ['Kutup Bölgeleri Genel', null, 'Antarctica', true], 'antarctica': ['Antarktika', 'Antarctica', 'Antarctica'],
  'arctic-cruises': ['Arktik Gemi Turları', 'Arctic Cruises', 'Arctic Cruises'], 'falkland-islands': ['Falkland Adaları', null, null],
  'greenland': ['Grönland', 'Greenland', 'Greenland'], 'spitsbergen': ['Spitsbergen', 'Spitsbergen', 'Spitsbergen'],
  // South America
  'south-america': ['Güney Amerika Genel', null, 'Peru', true], 'argentina': ['Arjantin', 'Argentina', 'Argentina'],
  'bolivia': ['Bolivya', 'Bolivia', 'Bolivia'], 'brazil': ['Brezilya', 'Brazil', 'Brazil'], 'chile': ['Şili', 'Chile', 'Chile'],
  'colombia': ['Kolombiya', 'Colombia', 'colombia'], 'ecuador': ['Ekvador', 'Ecuador & Galapagos', 'Ecuador_Galapagos'],
  'french-guiana': ['Fransız Guyanası', 'French Guiana', 'French_Guiana'], 'galapagos-islands': ['Galapagos Adaları', 'Ecuador & Galapagos', 'Ecuador_Galapagos'],
  'guyana': ['Guyana', 'Guyana', 'Guyana'], 'paraguay': ['Paraguay', 'Paraguay', 'Paraguay'],
  'patagonia': ['Patagonya', 'Patagonia', 'Patagonia'], 'peru': ['Peru', 'Peru', 'Peru'],
  'suriname': ['Surinam', 'Suriname', 'Suriname'], 'uruguay': ['Uruguay', 'Uruguay', 'Uruguay'],
  'venezuela': ['Venezuela', 'Venezuela', 'Venezuela'],
  // UK
  'uk': ['Birleşik Krallık Genel', 'Uk', 'United-Kingdom', true], 'channel-islands': ['Manş Adaları', 'Channel Islands', 'Channel-Islands'],
  'england': ['İngiltere', 'England', 'England'], 'northern-ireland': ['Kuzey İrlanda', null, null],
  'scotland': ['İskoçya', 'Scotland', 'Scotland'], 'wales': ['Galler', null, null]
};

// Short menu labels and ordering for common section types; other sections keep their title.
const SECTION_RULES = [
  { test: /^2-minute-summary$/, label: 'Özet', order: 0 },
  { test: /best-time/, label: 'En İyi Zaman', order: 1 },
  { test: /map-and-highlights|map-highlights/, label: 'Harita ve Öne Çıkanlar', order: 2 },
  { test: /^things-to-do|^what-to-do/, label: 'Yapılacaklar', order: 3 },
  { test: /food-and-drink|cooking-and-food|^food/, label: 'Yeme-İçme', order: 4 },
  { test: /travel-advice|holiday-advice|travel-tips|^tips|first-time-traveller/, label: null, order: 8 },
  { test: /responsible-tourism|responsible-travel/, label: 'Sorumlu Turizm', order: 9 }
];

// Guide-specific cover photos (public domain / CC0, from Wikimedia Commons) for
// guides without a tour-photos folder: images/tur-rehberleri/<country-slug>.webp
function coverPhoto(slug, folder) {
  const own = path.join(frontend, 'images', 'tur-rehberleri', slug + '.webp');
  if (fs.existsSync(own)) return 'images/tur-rehberleri/' + slug + '.webp';
  return firstPhoto(folder);
}

function firstPhoto(folder) {
  if (!folder) return null;
  const base = path.join(photoRoot, folder);
  if (!fs.existsSync(base)) return null;
  for (const sub of fs.readdirSync(base).sort()) {
    const dir = path.join(base, sub);
    if (!fs.statSync(dir).isDirectory()) continue;
    const img = fs.readdirSync(dir).sort().find(f => /\.(webp|jpe?g|png)$/i.test(f));
    if (img) return 'images/tour-photos/' + folder + '/' + sub + '/' + img;
  }
  return null;
}

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({ gfm: true, breaks: false });
marked.use({
  renderer: {
    html(token) { return escapeHtml(token.text || token.raw || ''); },
    // Tables get a wrapper so they scroll on small screens.
    table(token) {
      const head = token.header.map(c => '<th>' + this.parser.parseInline(c.tokens) + '</th>').join('');
      const body = token.rows.map(r => '<tr>' + r.map(c => '<td>' + this.parser.parseInline(c.tokens) + '</td>').join('') + '</tr>').join('');
      return '<div class="guide-table-wrap"><table class="guide-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
    },
    link(token) { return this.parser.parseInline(token.tokens); },
    image() { return ''; }
  }
});

function sectionMeta(pageType, title) {
  for (const rule of SECTION_RULES) {
    if (rule.test.test(pageType)) return { label: rule.label || title, order: rule.order };
  }
  return { label: title, order: 5 };
}

function render(markdown, title) {
  let md = String(markdown || '').trim();
  // The page shows the section title itself; drop a leading heading that repeats it.
  const m = md.match(/^#{1,3}\s+(.+)\n+/);
  if (m && m[1].trim().toLowerCase() === String(title).trim().toLowerCase()) md = md.slice(m[0].length);
  return marked.parse(md);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const index = { regions: [] };
const missing = [];
for (const region of fs.readdirSync(dataDir)) {
  const R = REGIONS[region];
  if (!R) { missing.push('region ' + region); continue; }
  const countries = [];
  for (const folder of fs.readdirSync(path.join(dataDir, region))) {
    const meta = C[folder];
    if (!meta) { missing.push(region + '/' + folder); continue; }
    const [nameTr, tourKey, photoFolder, overview] = meta;
    const dir = path.join(dataDir, region, folder);
    const sections = fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const sm = sectionMeta(j.page_type, j.title);
      return { id: j.page_type, label: sm.label, order: sm.order, title: j.title, html: render(j.content_markdown, j.title), nameEn: j.country_or_region };
    });
    sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'tr'));
    const nameEn = sections[0] ? sections[0].nameEn : folder;
    const photo = coverPhoto(folder, photoFolder);
    const doc = {
      slug: folder, region, regionTr: R.tr, nameTr, nameEn, tourKey: tourKey || null, photo,
      sections: sections.map(s => ({ id: s.id, label: s.label, title: s.title, html: s.html }))
    };
    fs.writeFileSync(path.join(outDir, folder + '.json'), JSON.stringify(doc));
    countries.push({ slug: folder, nameTr, nameEn, photo, tourKey: tourKey || null, overview: !!overview, sections: sections.length });
  }
  countries.sort((a, b) => (b.overview - a.overview) || a.nameTr.localeCompare(b.nameTr, 'tr'));
  index.regions.push({ id: region, tr: R.tr, en: R.en, order: R.order, color: R.color, countries });
}
index.regions.sort((a, b) => a.order - b.order);
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index));

const total = index.regions.reduce((n, r) => n + r.countries.length, 0);
const noPhoto = index.regions.flatMap(r => r.countries.filter(c => !c.photo).map(c => c.nameTr));
console.log('guides:', total, '| regions:', index.regions.length);
console.log('without photo (' + noPhoto.length + '):', noPhoto.join(', '));
if (missing.length) { console.log('UNMAPPED:', missing.join(', ')); process.exitCode = 1; }
