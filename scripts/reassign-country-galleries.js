const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.cwd();
const photosRoot = path.join(root, 'images', 'tour-photos');
const base = 'http://localhost:8080/api';
const secret = 'docker-local-dev-secret-key-min-256-bits-long-enough-for-hs256';
const imageExt = /\.(webp|jpg|jpeg|png|gif|avif)$/i;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const compact = (s) => norm(s).replace(/\s+/g, '');
const rel = (p) => path.relative(root, p).replace(/\\/g, '/');

const preferredRegion = new Map(Object.entries({
  Japan:'05-Asia', India:'05-Asia', Indonesia:'05-Asia', Nepal:'05-Asia', Thailand:'05-Asia', Vietnam:'05-Asia', Cambodia:'05-Asia', Laos:'05-Asia', Bangladesh:'05-Asia', Sri_Lanka:'05-Asia', 'Sri Lanka':'05-Asia', Jordan:'05-Asia', Philippines:'05-Asia', Malaysia:'05-Asia', Maldives:'05-Asia', Mongolia:'05-Asia', Kazakhstan:'05-Asia', Kyrgyzstan:'05-Asia', Armenia:'05-Asia', Azerbaijan:'05-Asia', Pakistan:'05-Asia', Burma:'05-Asia', Myanmar:'05-Asia', Singapore:'05-Asia', China:'05-Asia',
  Albania:'01-Europe', Andorra:'01-Europe', Austria:'01-Europe', Germany:'01-Europe', France:'01-Europe', Italy:'01-Europe', Greece:'01-Europe', Spain:'01-Europe', Portugal:'01-Europe', Switzerland:'01-Europe', Sweden:'01-Europe', Finland:'01-Europe', Iceland:'01-Europe', Ireland:'01-Europe', England:'01-Europe', Uk:'01-Europe', Turkey:'01-Europe', Croatia:'01-Europe', Serbia:'01-Europe', Norway:'01-Europe', Poland:'01-Europe', Romania:'01-Europe', Bulgaria:'01-Europe', Denmark:'01-Europe', Estonia:'01-Europe', Latvia:'01-Europe', Lithuania:'01-Europe', Malta:'01-Europe', Moldova:'01-Europe', Montenegro:'01-Europe', Slovakia:'01-Europe', Slovenia:'01-Europe', Scotland:'01-Europe', Hungary:'01-Europe', Kosovo:'01-Europe', Lapland:'01-Europe', 'Bosnia Herzegovina':'01-Europe', 'Channel Islands':'01-Europe', 'Czech Republic':'01-Europe', 'Faroe Islands':'01-Europe',
  Argentina:'03-Latin-America', Brazil:'03-Latin-America', Chile:'03-Latin-America', Colombia:'03-Latin-America', Peru:'03-Latin-America', Mexico:'03-Latin-America', Bolivia:'03-Latin-America', Paraguay:'03-Latin-America', Uruguay:'03-Latin-America', Venezuela:'03-Latin-America', Guatemala:'03-Latin-America', Panama:'03-Latin-America', Belize:'03-Latin-America', Bahamas:'03-Latin-America', Jamaica:'03-Latin-America', 'Costa Rica':'03-Latin-America', 'Dominican Republic':'03-Latin-America', 'Ecuador & Galapagos':'03-Latin-America', 'Trinidad And Tobago':'03-Latin-America',
  Australia:'04-South-Pacific', Fiji:'04-South-Pacific', Tahiti:'04-South-Pacific', Tonga:'04-South-Pacific', Borneo:'04-South-Pacific', 'New Zealand':'04-South-Pacific', 'Bora Bora':'04-South-Pacific', 'Papua New Guinea':'04-South-Pacific', 'French Polynesia':'04-South-Pacific', 'Solomon Islands':'04-South-Pacific',
  Iran:'07-Middle-East-North Africa', Iraq:'07-Middle-East-North Africa', Israel:'07-Middle-East-North Africa', Lebanon:'07-Middle-East-North Africa', Oman:'07-Middle-East-North Africa', Syria:'07-Middle-East-North Africa', Yemen:'07-Middle-East-North Africa', Egypt:'07-Middle-East-North Africa', Tunisia:'07-Middle-East-North Africa', Morocco:'07-Middle-East-North Africa', Libya:'07-Middle-East-North Africa', 'Saudi Arabia':'07-Middle-East-North Africa', 'United Arab Emirates':'07-Middle-East-North Africa',
  Antarctica:'08-Antarctica', Greenland:'08-Antarctica', 'Arctic Cruises':'08-Antarctica', Spitsbergen:'08-Antarctica', 'St Helena':'08-Antarctica',
  Algeria:'02-Africa', Angola:'02-Africa', Benin:'02-Africa', Botswana:'02-Africa', Burundi:'02-Africa', Cameroon:'02-Africa', Chad:'02-Africa', Congo:'02-Africa', Djibouti:'02-Africa', Ethiopia:'02-Africa', Gabon:'02-Africa', Gambia:'02-Africa', Ghana:'02-Africa', Guinea:'02-Africa', Kenya:'02-Africa', Liberia:'02-Africa', Madagascar:'02-Africa', Malawi:'02-Africa', Mauritius:'02-Africa', Mozambique:'02-Africa', Namibia:'02-Africa', Rwanda:'02-Africa', Senegal:'02-Africa', Tanzania:'02-Africa', Uganda:'02-Africa', Zambia:'02-Africa', Zimbabwe:'02-Africa', Swaziland:'02-Africa', 'South Africa':'02-Africa', 'Sierra Leone':'02-Africa', 'Ivory Coast':'02-Africa', 'Western Sahara':'02-Africa', 'Burkina Faso':'02-Africa', 'South Sudan':'02-Africa'
}));

function token() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const h = b64({ alg:'HS256', typ:'JWT' });
  const p = b64({ sub:'admin@siempretour.com', userId:1, role:'ADMIN', iat:Math.floor(Date.now()/1000), exp:Math.floor(Date.now()/1000)+86400 });
  const s = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}
const adminToken = token();

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes:true })) {
    if (ent.name === '.DS_Store' || ent.name.startsWith('._')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listImages(p));
    else if (ent.isFile() && imageExt.test(ent.name) && !/map\./i.test(ent.name)) out.push(p);
  }
  return out;
}
function countryDirName(dest) {
  if (!dest) return null;
  const dirs = fs.readdirSync(photosRoot, { withFileTypes:true }).filter(d => d.isDirectory()).map(d => d.name);
  const c = compact(dest);
  return dirs.find(d => compact(d) === c) || null;
}
function poolForDestination(dest) {
  const dirName = countryDirName(dest);
  if (!dirName) return [];
  const dir = path.join(photosRoot, dirName);
  const region = preferredRegion.get(dirName) || preferredRegion.get(dest);
  const all = listImages(dir).map(p => rel(p));
  const score = (r) => {
    const parts = r.split('/');
    const afterCountry = parts[3] || '';
    if (/^\d+$/.test(afterCountry)) return 0;
    if (region && afterCountry === region) return 1;
    if (/^09-African-safari$/.test(afterCountry)) return 9;
    if (/^0\d-/.test(afterCountry)) return 6;
    return 3;
  };
  return all.sort((a,b) => score(a)-score(b) || a.localeCompare(b, undefined, { numeric:true, sensitivity:'base' }));
}
function extract(payload){ if(Array.isArray(payload)) return payload; for(const k of ['content','data','items','results','tours']) if(Array.isArray(payload?.[k])) return payload[k]; return []; }
async function req(url, options={}, tries=12){
  for(let i=0;i<tries;i++){
    const r = await fetch(url, options);
    if(r.status !== 429) return r;
    await sleep(900 + i*350);
  }
  return fetch(url, options);
}
async function getTours(){
  const tours=[];
  for(let page=0;;page++){
    const r=await req(`${base}/tours/filter?page=${page}&size=200`, {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    if(!r.ok) throw new Error(`filter ${r.status} ${await r.text()}`);
    const p=await r.json(); const batch=extract(p); tours.push(...batch);
    const total = Number.isInteger(p.totalPages) ? p.totalPages : null;
    if(total != null){ if(page+1 >= total) break; } else if(batch.length < 200) break;
  }
  return tours;
}
function bodyFor(pool, offset){
  const pick = (i) => pool[(offset + i) % pool.length];
  return { mainPhoto: pick(0), image1: pick(0), image2: pick(1), image3: pick(2), image4: pick(3), image5: pick(4), image6: pick(5) };
}
function same(t,b){ return ['mainPhoto','image1','image2','image3','image4','image5','image6'].every(k => (t[k]||'') === (b[k]||'')); }
async function update(t,b){
  for(let i=0;i<12;i++){
    const r=await fetch(`${base}/tours/${t.id}`, {method:'PUT', headers:{'Content-Type':'application/json', Authorization:`Bearer ${adminToken}`}, body:JSON.stringify(b)});
    if(r.ok) return true;
    if(r.status === 429){ await sleep(1000+i*450); continue; }
    throw new Error(`PUT ${t.id} ${r.status} ${await r.text()}`);
  }
  throw new Error(`PUT ${t.id} rate limited too long`);
}
(async()=>{
  const tours = await getTours();
  const usage = new Map();
  let reviewed=0, changed=0, skippedNoPool=0, already=0;
  const examples=[];
  for(const t of tours){
    const pool = poolForDestination(t.destination);
    if(!pool.length){ skippedNoPool++; continue; }
    reviewed++;
    const key = compact(t.destination);
    const idx = usage.get(key) || 0;
    usage.set(key, idx+1);
    const b = bodyFor(pool, idx);
    if(same(t,b)){ already++; continue; }
    await update(t,b);
    changed++;
    if(examples.length < 20) examples.push(`${t.id}\t${t.destination}\t${t.name}\t${t.image1||''}\t=>\t${b.image1}`);
    if(changed % 100 === 0) console.log(`CHANGED=${changed} reviewed=${reviewed}`);
  }
  console.log(`REVIEWED_WITH_POOL=${reviewed}`);
  console.log(`CHANGED=${changed}`);
  console.log(`ALREADY_OK=${already}`);
  console.log(`SKIPPED_NO_POOL=${skippedNoPool}`);
  console.log('EXAMPLES');
  console.log(examples.join('\n'));
})();
