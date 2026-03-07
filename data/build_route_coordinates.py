import os
import json
import time
import requests
import urllib.parse
import unicodedata
from tqdm import tqdm

# =====================================================
# CONFIG
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "siempretour_tours")
CACHE_PATH = os.path.join(BASE_DIR, "geocode_cache.json")

MAPBOX_TOKEN = ""  # <-- doldur

SLEEP_BETWEEN_REQUESTS = 0.1
MAX_RETRIES = 4  # biraz artırdım

# =====================================================
# FULL COUNTRY → ISO2 MAP
# =====================================================

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
    "uk":"United Kingdom",
    "usa":"United States",
    "us":"United States",
    "u.s.a":"United States",
    "cote d'ivoire":"Ivory Coast",
    "côte d'ivoire":"Ivory Coast"
}

# =====================================================
# NORMALIZE
# =====================================================

def to_text(x) -> str:
    if x is None:
        return ""
    if isinstance(x, str):
        return x
    try:
        return json.dumps(x, ensure_ascii=False)
    except Exception:
        return str(x)

def normalize_text(text):
    text = to_text(text)
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    return text.strip()

def normalize_country(country):
    if not country:
        return ""
    country = normalize_text(country)
    lower = country.lower()
    if lower in ALIASES:
        return ALIASES[lower]
    for official in COUNTRY_TO_ISO2:
        if official.lower() == lower:
            return official
    return country

def normalize_place_name(name):
    return normalize_text(name)

# =====================================================
# CACHE
# =====================================================

def load_cache():
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

def make_cache_key(name, country):
    n = normalize_place_name(name)
    c = normalize_country(country)
    return f"{n}||{c}".lower()

# =====================================================
# MAPBOX SAFE GEOCODE
# =====================================================

def mapbox_geocode(name, country):
    if not MAPBOX_TOKEN or not MAPBOX_TOKEN.strip():
        raise RuntimeError("MAPBOX_TOKEN is empty. Fill it before geocoding (avoid poisoning the cache).")

    country = normalize_country(country)
    name = normalize_place_name(name)

    query = f"{name}, {country}" if country else name
    encoded_query = urllib.parse.quote(query)

    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{encoded_query}.json"
    params = {
        "access_token": MAPBOX_TOKEN,
        "limit": 1,
        "types": "place,locality,region,poi"
    }

    iso2 = COUNTRY_TO_ISO2.get(country)
    if iso2:
        params["country"] = iso2

    backoff = 1.0
    for _ in range(MAX_RETRIES):
        try:
            r = requests.get(url, params=params, timeout=20)

            # rate limit / transient
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(backoff)
                backoff *= 2
                continue

            if r.status_code != 200:
                # permanent-ish fail; don't retry too much
                return None

            data = r.json()
            if not data.get("features"):
                return None

            feature = data["features"][0]

            returned_country = None
            for c in feature.get("context", []):
                if "country" in c.get("id", ""):
                    returned_country = normalize_country(c.get("text"))

            if country and returned_country and returned_country != country:
                return None

            lng, lat = feature["center"]
            return {"lat": lat, "lng": lng}

        except Exception:
            time.sleep(backoff)
            backoff *= 2

    return None

# =====================================================
# COLLECT UNIQUE PLACES
# =====================================================

def collect_unique_places():
    places = set()
    files = []

    for folder in os.listdir(ROOT_DIR):
        path = os.path.join(ROOT_DIR, folder, "tours.json")
        if not os.path.exists(path):
            continue

        files.append(path)

        with open(path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        if not isinstance(tours, list):
            continue

        for tour in tours:
            if not isinstance(tour, dict):
                continue
            route = tour.get("route")
            if not isinstance(route, list):
                continue

            for item in route:
                if not isinstance(item, dict):
                    continue
                name = to_text(item.get("name")).strip()
                country = to_text(item.get("country")).strip()
                if name:
                    places.add((name, country))

    return sorted(places), files

# =====================================================
# GEOCODE UNIQUE WITH PROGRESS
# =====================================================

def geocode_all(unique, cache):
    missing = [p for p in unique if make_cache_key(*p) not in cache]

    print("\n🧠 Total Unique Places:", len(unique))
    print("📍 Missing:", len(missing))

    for name, country in tqdm(missing, desc="🌍 Geocoding", unit="place"):
        key = make_cache_key(name, country)

        try:
            result = mapbox_geocode(name, country)
        except Exception as e:
            # token boş gibi kritik şeylerde burada patlar, cache yazmayız
            print(f"\n❌ Geocode hard-fail for {name}, {country}: {e}")
            raise

        if result:
            cache[key] = {"found": True, **result}
        else:
            cache[key] = {"found": False}

        save_cache(cache)
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    return cache

# =====================================================
# WRITE ROUTE COORDS WITH PROGRESS
# =====================================================

def write_coords_all(files, cache):
    for path in tqdm(files, desc="📝 Writing routeCoordinates", unit="file"):
        with open(path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        if not isinstance(tours, list):
            continue

        changed = False

        for tour in tours:
            if not isinstance(tour, dict):
                continue

            if tour.get("routeCoordinates"):
                continue

            route = tour.get("route")
            if not isinstance(route, list):
                continue

            destination = normalize_country(tour.get("destination", ""))
            coords = []

            for item in route:
                if not isinstance(item, dict):
                    continue

                name = to_text(item.get("name")).strip()
                if not name:
                    continue

                country = normalize_country(item.get("country") or destination)
                key = make_cache_key(name, country)
                cached = cache.get(key)

                if cached and cached.get("found"):
                    coords.append({
                        "name": name,
                        "country": country if country else None,
                        "lat": cached["lat"],
                        "lng": cached["lng"]
                    })

            if coords:
                tour["routeCoordinates"] = coords
                changed = True

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)

# =====================================================
# MAIN
# =====================================================

def main():
    cache = load_cache()
    unique, files = collect_unique_places()
    cache = geocode_all(unique, cache)
    write_coords_all(files, cache)
    print("\n🚀 DONE")

if __name__ == "__main__":
    main()