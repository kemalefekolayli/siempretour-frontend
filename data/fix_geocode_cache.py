import os
import json
import time
import urllib.parse
import requests
from openai import OpenAI

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH = os.path.join(BASE_DIR, "geocode_cache.json")
CACHE_BACKUP_PATH = os.path.join(BASE_DIR, "geocode_cache.backup.json")

MAPBOX_TOKEN = "pk.eyJ1IjoidG9sZ2F5aWxtYXp6IiwiYSI6ImNtbHRha3FyYTBlZnkzZXMxbW02bTJ0cmQifQ.PgjbsMatO5oIZhAAhICEZQ"  # <-- doldur
OPENAI_MODEL = "gpt-4o-mini"

SLEEP_BETWEEN_OPENAI = 0.2
SLEEP_BETWEEN_MAPBOX = 0.1
MAX_MAPBOX_RETRIES = 4

# Optional: kaç tane false işleyecek (test için)
LIMIT = None  # örn: 50

client = OpenAI()

# ===============================
# COUNTRY MAP (ISO2)
# (senin önceki dosyandan alıp yapıştırabilirsin, burada minimal tuttum)
# ===============================
COUNTRY_TO_ISO2 = {
    "Afghanistan":"af","Albania":"al","Algeria":"dz","Andorra":"ad","Angola":"ao",
    "Antigua and Barbuda":"ag","Argentina":"ar","Armenia":"am","Australia":"au",
    "Austria":"at","Azerbaijan":"az","Bahamas":"bs","Bahrain":"bh","Bangladesh":"bd",
    "Barbados":"bb","Belarus":"by","Belgium":"be","Belize":"bz","Benin":"bj",
    "Bhutan":"bt","Bolivia":"bo","Bosnia and Herzegovina":"ba","Botswana":"bw",
    "Brazil":"br","Brunei":"bn","Bulgaria":"bg","Burkina Faso":"bf","Burundi":"bi",
    "Cambodia":"kh","Cameroon":"cm","Canada":"ca","Cape Verde":"cv",
    "Central African Republic":"cf","Chad":"td","Chile":"cl","China":"cn",
    "Colombia":"co","Comoros":"km","Congo":"cg","Costa Rica":"cr","Croatia":"hr",
    "Cuba":"cu","Cyprus":"cy","Czech Republic":"cz","Denmark":"dk","Djibouti":"dj",
    "Dominica":"dm","Dominican Republic":"do","Ecuador":"ec","Egypt":"eg",
    "El Salvador":"sv","Equatorial Guinea":"gq","Eritrea":"er","Estonia":"ee",
    "Eswatini":"sz","Ethiopia":"et","Fiji":"fj","Finland":"fi","France":"fr",
    "Gabon":"ga","Gambia":"gm","Georgia":"ge","Germany":"de","Ghana":"gh",
    "Greece":"gr","Grenada":"gd","Guatemala":"gt","Guinea":"gn","Guinea-Bissau":"gw",
    "Guyana":"gy","Haiti":"ht","Honduras":"hn","Hungary":"hu","Iceland":"is",
    "India":"in","Indonesia":"id","Iran":"ir","Iraq":"iq","Ireland":"ie",
    "Israel":"il","Italy":"it","Ivory Coast":"ci","Jamaica":"jm","Japan":"jp",
    "Jordan":"jo","Kazakhstan":"kz","Kenya":"ke","Kiribati":"ki","Kuwait":"kw",
    "Kyrgyzstan":"kg","Laos":"la","Latvia":"lv","Lebanon":"lb","Lesotho":"ls",
    "Liberia":"lr","Libya":"ly","Liechtenstein":"li","Lithuania":"lt","Luxembourg":"lu",
    "Madagascar":"mg","Malawi":"mw","Malaysia":"my","Maldives":"mv","Mali":"ml",
    "Malta":"mt","Marshall Islands":"mh","Mauritania":"mr","Mauritius":"mu",
    "Mexico":"mx","Micronesia":"fm","Moldova":"md","Monaco":"mc","Mongolia":"mn",
    "Montenegro":"me","Morocco":"ma","Mozambique":"mz","Myanmar":"mm","Namibia":"na",
    "Nauru":"nr","Nepal":"np","Netherlands":"nl","New Zealand":"nz","Nicaragua":"ni",
    "Niger":"ne","Nigeria":"ng","North Korea":"kp","North Macedonia":"mk",
    "Norway":"no","Oman":"om","Pakistan":"pk","Palau":"pw","Panama":"pa",
    "Papua New Guinea":"pg","Paraguay":"py","Peru":"pe","Philippines":"ph",
    "Poland":"pl","Portugal":"pt","Qatar":"qa","Romania":"ro","Russia":"ru",
    "Rwanda":"rw","Saint Kitts and Nevis":"kn","Saint Lucia":"lc",
    "Saint Vincent and the Grenadines":"vc","Samoa":"ws","San Marino":"sm",
    "Sao Tome and Principe":"st","Saudi Arabia":"sa","Senegal":"sn","Serbia":"rs",
    "Seychelles":"sc","Sierra Leone":"sl","Singapore":"sg","Slovakia":"sk",
    "Slovenia":"si","Solomon Islands":"sb","Somalia":"so","South Africa":"za",
    "South Korea":"kr","South Sudan":"ss","Spain":"es","Sri Lanka":"lk",
    "Sudan":"sd","Suriname":"sr","Sweden":"se","Switzerland":"ch","Syria":"sy",
    "Taiwan":"tw","Tajikistan":"tj","Tanzania":"tz","Thailand":"th",
    "Timor-Leste":"tl","Togo":"tg","Tonga":"to","Trinidad and Tobago":"tt",
    "Tunisia":"tn","Turkey":"tr","Turkmenistan":"tm","Tuvalu":"tv",
    "Uganda":"ug","Ukraine":"ua","United Arab Emirates":"ae",
    "United Kingdom":"gb","United States":"us","Uruguay":"uy",
    "Uzbekistan":"uz","Vanuatu":"vu","Vatican City":"va","Venezuela":"ve",
    "Vietnam":"vn","Yemen":"ye","Zambia":"zm","Zimbabwe":"zw"
}

ALIASES = {
    "uk": "United Kingdom",
    "usa": "United States",
    "us": "United States",
    "u.s.a": "United States",
    "cote d'ivoire": "Ivory Coast",
    "côte d'ivoire": "Ivory Coast",
}

def normalize_country(country: str) -> str:
    if not country:
        return ""
    c = str(country).strip()
    low = c.lower()
    if low in ALIASES:
        return ALIASES[low]
    return c

def parse_cache_key(key: str):
    """
    cache key format: "name||country" (lowercase olabilir)
    """
    if "||" not in key:
        return key.strip(), ""
    name, country = key.split("||", 1)
    return name.strip(), country.strip()

# ===============================
# OpenAI Fix
# ===============================
def openai_make_geocode_query(place_name: str, country_hint: str):
    """
    Returns dict:
    {
      "query": "...",
      "country": "Official country name or null",
      "confidence": 0..100,
      "skip": true/false
    }
    """
    place_name = (place_name or "").strip()
    country_hint = (country_hint or "").strip()

    prompt = f"""
You convert ambiguous travel itinerary place names into geocoding-friendly queries (Mapbox).

Input:
- place_name: {place_name}
- country_hint (may be empty): {country_hint}

Return JSON ONLY in this exact format:
{{
  "query": "string",
  "country": "official country name or null",
  "confidence": 0,
  "skip": false
}}

Rules:
- query must be short and geocoding-friendly (e.g., "Cusco, Peru", "Serengeti National Park, Tanzania").
- If the place_name is too generic to geocode reliably ("Old Town", "Highlands", "Coast"), set skip=true and confidence<=30.
- If you can infer a likely country from the hint, set country accordingly; else null.
- confidence must be an integer 0..100.
""".strip()

    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Return only valid JSON. No markdown. No extra text."},
            {"role": "user", "content": prompt}
        ]
    )

    data = json.loads(resp.choices[0].message.content)
    query = data.get("query")
    country = data.get("country", None)
    confidence = data.get("confidence", 0)
    skip = data.get("skip", False)

    if not isinstance(query, str) or not query.strip():
        return None

    if isinstance(country, str) and not country.strip():
        country = None

    if not isinstance(confidence, int):
        try:
            confidence = int(confidence)
        except Exception:
            confidence = 0

    skip = bool(skip)

    return {
        "query": query.strip(),
        "country": country.strip() if isinstance(country, str) else None,
        "confidence": confidence,
        "skip": skip
    }

# ===============================
# Mapbox Geocode
# ===============================
def mapbox_geocode_query(query: str, country: str | None):
    if not MAPBOX_TOKEN or not MAPBOX_TOKEN.strip():
        raise RuntimeError("MAPBOX_TOKEN is empty.")

    query = (query or "").strip()
    if not query:
        return None

    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{urllib.parse.quote(query)}.json"

    params = {
        "access_token": MAPBOX_TOKEN,
        "limit": 1,
        "types": "place,locality,region,poi"
    }

    c = normalize_country(country or "")
    iso2 = COUNTRY_TO_ISO2.get(c)
    if iso2:
        params["country"] = iso2

    backoff = 1.0
    for _ in range(MAX_MAPBOX_RETRIES):
        r = requests.get(url, params=params, timeout=20)

        if r.status_code in (429, 500, 502, 503, 504):
            time.sleep(backoff)
            backoff *= 2
            continue

        if r.status_code != 200:
            return None

        data = r.json()
        feats = data.get("features") or []
        if not feats:
            return None

        lng, lat = feats[0]["center"]
        return {"lat": lat, "lng": lng}

    return None

# ===============================
# Main
# ===============================
def main():
    if not os.path.exists(CACHE_PATH):
        raise FileNotFoundError(f"Cache not found: {CACHE_PATH}")

    # backup
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        cache = json.load(f)

    with open(CACHE_BACKUP_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print(f"✅ Backup written: {CACHE_BACKUP_PATH}")

    false_keys = [k for k, v in cache.items() if isinstance(v, dict) and v.get("found") is False]

    if LIMIT is not None:
        false_keys = false_keys[:LIMIT]

    print(f"🧠 found:false entries: {len(false_keys)}")

    updated = 0
    skipped = 0
    still_false = 0

    for idx, key in enumerate(false_keys, start=1):
        entry = cache.get(key, {})
        if entry.get("openai_tried"):
            continue  # daha önce denendiyse tekrar para yakma

        name, country_hint = parse_cache_key(key)

        fix = openai_make_geocode_query(name, country_hint)
        entry["openai_tried"] = True
        entry["openai_suggestion"] = fix  # debug için saklayalım

        if not fix or fix.get("skip") or fix.get("confidence", 0) < 40:
            cache[key] = entry
            skipped += 1
            continue

        # Mapbox retry with fixed query
        coords = mapbox_geocode_query(fix["query"], fix.get("country") or country_hint)

        time.sleep(SLEEP_BETWEEN_OPENAI)
        time.sleep(SLEEP_BETWEEN_MAPBOX)

        if coords:
            cache[key] = {
                "found": True,
                "lat": coords["lat"],
                "lng": coords["lng"],
                "fixed_by_openai": True,
                "openai_query": fix["query"],
                "openai_country": fix.get("country"),
                "openai_confidence": fix.get("confidence", 0)
            }
            updated += 1
        else:
            entry["found"] = False
            cache[key] = entry
            still_false += 1

        if idx % 25 == 0:
            # ara ara yaz (güvenlik)
            with open(CACHE_PATH, "w", encoding="utf-8") as f:
                json.dump(cache, f, ensure_ascii=False, indent=2)
            print(f"💾 autosave @ {idx}/{len(false_keys)} (updated={updated}, skipped={skipped}, still_false={still_false})")

    # final save
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print("\n==============================")
    print(f"✅ Updated to found:true: {updated}")
    print(f"⏭️ Skipped (too vague):   {skipped}")
    print(f"❌ Still found:false:     {still_false}")
    print("==============================")
    print(f"✅ Cache saved: {CACHE_PATH}")

if __name__ == "__main__":
    main()