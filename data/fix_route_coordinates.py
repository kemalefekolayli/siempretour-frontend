import os
import json
import unicodedata
from tqdm import tqdm

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "big_siempre_tour_tours_tr")
CACHE_PATH = os.path.join(BASE_DIR, "geocode_cache.json")

# ===============================
# NORMALIZE (cache key uyumu için)
# ===============================
ALIASES = {
    "uk": "United Kingdom",
    "usa": "United States",
    "us": "United States",
    "u.s.a": "United States",
    "cote d'ivoire": "Ivory Coast",
    "côte d'ivoire": "Ivory Coast",
}

def to_text(x) -> str:
    if x is None:
        return ""
    if isinstance(x, str):
        return x
    try:
        return json.dumps(x, ensure_ascii=False)
    except Exception:
        return str(x)

def normalize_text(text: str) -> str:
    text = to_text(text).strip()
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    return text.strip()

def normalize_country(country: str) -> str:
    c = normalize_text(country)
    if not c:
        return ""
    low = c.lower()
    if low in ALIASES:
        return ALIASES[low]
    return c

def normalize_place_name(name: str) -> str:
    return normalize_text(name)

def make_cache_key(name: str, country: str) -> str:
    n = normalize_place_name(name)
    c = normalize_country(country)
    return f"{n}||{c}".lower()

# ===============================
# LOAD CACHE
# ===============================
def load_cache():
    if not os.path.exists(CACHE_PATH):
        raise FileNotFoundError(f"Cache not found: {CACHE_PATH}")
    with open(CACHE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# ===============================
# BUILD COORDS FROM CACHE
# ===============================
def build_coords_for_tour(tour: dict, cache: dict):
    route = tour.get("route")
    if not isinstance(route, list) or not route:
        return []

    destination = normalize_country(tour.get("destination", ""))

    coords = []
    for item in route:
        if not isinstance(item, dict):
            continue

        name = to_text(item.get("name")).strip()
        if not name:
            continue

        item_country_raw = item.get("country")
        item_country = normalize_country(item_country_raw) if item_country_raw else ""

        # 1) name + item.country
        key1 = make_cache_key(name, item_country)
        hit = cache.get(key1)

        # 2) name + destination
        if not (hit and hit.get("found")) and destination:
            key2 = make_cache_key(name, destination)
            hit = cache.get(key2)
        else:
            key2 = None

        # 3) name only (country empty)
        if not (hit and hit.get("found")):
            key3 = make_cache_key(name, "")
            hit = cache.get(key3)
        else:
            key3 = None

        if hit and hit.get("found") and "lat" in hit and "lng" in hit:
            # country: item.country varsa onu, yoksa destination'ı yaz
            final_country = item_country or destination or None
            coords.append({
                "name": name.strip(),
                "country": final_country,
                "lat": hit["lat"],
                "lng": hit["lng"]
            })

    return coords

# ===============================
# MAIN: REWRITE ROUTECOORDINATES
# ===============================
def rewrite_all_route_coordinates():
    cache = load_cache()

    files = []
    for country in os.listdir(ROOT_DIR):
        country_path = os.path.join(ROOT_DIR, country)
        tours_path = os.path.join(country_path, "tours.json")
        if os.path.isdir(country_path) and os.path.exists(tours_path):
            files.append(tours_path)

    total_files_changed = 0
    total_tours_updated = 0

    for path in tqdm(files, desc="🗂️ Scanning tours.json", unit="file"):
        with open(path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        if not isinstance(tours, list):
            continue

        changed = False
        updated_in_file = 0

        for tour in tours:
            if not isinstance(tour, dict):
                continue

            new_coords = build_coords_for_tour(tour, cache)
            if not new_coords:
                continue

            old_coords = tour.get("routeCoordinates")
            old_len = len(old_coords) if isinstance(old_coords, list) else 0
            new_len = len(new_coords)

            # ✅ Daha iyi sonuç varsa overwrite et
            # - eski yoksa
            # - ya da yeni daha uzunsa (daha çok nokta kurtardıysa)
            if old_len == 0 or new_len > old_len:
                tour["routeCoordinates"] = new_coords
                changed = True
                updated_in_file += 1

        if changed:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)
            total_files_changed += 1
            total_tours_updated += updated_in_file

    print("\n==============================")
    print(f"✅ Files updated: {total_files_changed}")
    print(f"✅ Tours improved: {total_tours_updated}")
    print("==============================\n")

if __name__ == "__main__":
    rewrite_all_route_coordinates()