import os
import json
import time
from openai import OpenAI
from tqdm import tqdm

# ===============================
# CONFIG (PATH SAFE)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "siempretour_tours")

MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.3  # base rate limit safety

client = OpenAI()

# ===============================
# HELPERS (FORMAT SAFE)
# ===============================
def _to_text(x) -> str:
    """Safely convert possibly-non-string fields to text without crashing."""
    if x is None:
        return ""
    if isinstance(x, str):
        return x.strip()
    try:
        return json.dumps(x, ensure_ascii=False).strip()
    except Exception:
        return str(x).strip()

def _build_itinerary(day_infos) -> str:
    """Build itinerary text robustly from dayInfo that may be list/dict/str/mixed."""
    if not day_infos:
        return ""

    lines = []

    # If dayInfo is a dict (single day or blob)
    if isinstance(day_infos, dict):
        title = _to_text(day_infos.get("title"))
        desc = _to_text(day_infos.get("description"))
        if title and desc:
            return f"Day 1: {title} — {desc}".strip()
        if desc:
            return f"Day 1: {desc}".strip()
        if title:
            return f"Day 1: {title}".strip()
        # fallback stringify
        blob = _to_text(day_infos)
        return f"Day 1: {blob}".strip() if blob else ""

    # If dayInfo is a string
    if isinstance(day_infos, str):
        return day_infos.strip()

    # If dayInfo is a list (expected)
    if isinstance(day_infos, list):
        for i, day in enumerate(day_infos, start=1):
            if isinstance(day, dict):
                title = _to_text(day.get("title"))
                desc = _to_text(day.get("description"))

                if title and desc:
                    lines.append(f"Day {i}: {title} — {desc}")
                elif desc:
                    lines.append(f"Day {i}: {desc}")
                elif title:
                    lines.append(f"Day {i}: {title}")
                else:
                    continue

            elif isinstance(day, str) and day.strip():
                lines.append(f"Day {i}: {day.strip()}")
            else:
                continue

        return "\n".join(lines).strip()

    # Unknown type fallback
    blob = _to_text(day_infos)
    return blob

# ===============================
# GPT ROUTE CALL (JSON GUARANTEED)
# ===============================
def extract_route_for_tour(tour: dict):
    destination = _to_text(tour.get("destination"))
    places_visited = _to_text(tour.get("placesVisited"))
    general_info = _to_text(tour.get("generalInfo"))

    day_infos = tour.get("dayInfo") or []
    itinerary = _build_itinerary(day_infos)

    prompt = f"""
Extract the ordered geographic locations from this tour itinerary.

Return JSON in EXACTLY this format:
{{
  "route": [
    {{"name": "Place name", "country": "Country or null"}}
  ]
}}

Rules:
- Keep travel order.
- Prefer cities, regions, islands, national parks, major landmarks.
- Do NOT include hotels, wineries, restaurants, specific lodges unless they are major geographic locations.
- If the country is unknown, set it to null.
- Use destination as a strong hint for country when appropriate.

Tour destination:
{destination}

Places visited (may be empty):
{places_visited}

General information (may be empty):
{general_info}

Day-by-day itinerary (may be empty):
{itinerary}
""".strip()

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Return only valid JSON. No markdown. No extra text."},
            {"role": "user", "content": prompt}
        ],
    )

    data = json.loads(response.choices[0].message.content)

    route = data.get("route")
    if not isinstance(route, list):
        raise ValueError("Model returned JSON but 'route' is not a list.")

    # Clean + validate
    cleaned = []
    for item in route:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        country = item.get("country", None)
        if isinstance(name, str) and name.strip():
            cleaned.append({
                "name": name.strip(),
                "country": (country.strip() if isinstance(country, str) and country.strip() else None)
            })

    if not cleaned:
        raise ValueError("Route extracted but empty after cleaning.")

    return cleaned

# ===============================
# OPENAI CALL WRAPPER (BACKOFF)
# ===============================
def extract_route_with_backoff(tour: dict, max_retries: int = 6):
    """
    Retries on rate limits / transient errors using exponential backoff.
    Keeps other exceptions as-is.
    """
    base_delay = 1.0
    for attempt in range(max_retries):
        try:
            return extract_route_for_tour(tour)
        except Exception as e:
            msg = str(e).lower()
            is_rate = ("429" in msg) or ("rate limit" in msg) or ("too many requests" in msg)
            is_transient = ("timeout" in msg) or ("temporarily" in msg) or ("server" in msg) or ("503" in msg)

            if attempt < max_retries - 1 and (is_rate or is_transient):
                sleep_s = base_delay * (2 ** attempt)
                print(f"\n⏳ Retry {attempt+1}/{max_retries-1} after {sleep_s:.1f}s due to: {e}")
                time.sleep(sleep_s)
                continue
            raise

# ===============================
# MAIN PROCESS (RESUME SAFE)
# ===============================
def process_all_countries():
    if not os.path.exists(ROOT_DIR):
        raise FileNotFoundError(f"ROOT_DIR not found: {ROOT_DIR}")

    for country in os.listdir(ROOT_DIR):
        country_path = os.path.join(ROOT_DIR, country)
        tours_path = os.path.join(country_path, "tours.json")

        if not os.path.isdir(country_path):
            continue
        if not os.path.exists(tours_path):
            continue

        print(f"\n📍 Processing country: {country}")

        with open(tours_path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        if not isinstance(tours, list):
            print(f"❌ Invalid format: {tours_path} (expected list)")
            continue

        changed = False

        for tour in tqdm(tours, desc=f"{country} tours"):
            # ✅ RESUME LOGIC: route varsa tekrar çağırma
            if tour.get("route"):
                continue

            # dayInfo yoksa skip (çok zayıf sinyal)
            if not tour.get("dayInfo"):
                continue

            try:
                route = extract_route_with_backoff(tour)
                tour["route"] = route
                changed = True

                time.sleep(SLEEP_BETWEEN_CALLS)

            except Exception as e:
                print(f"\n⚠️ Route failed for {tour.get('id')}: {e}")
                continue

        if changed:
            with open(tours_path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)
            print(f"✅ Updated: {tours_path}")
        else:
            print(f"ℹ️ No changes: {tours_path}")

# ===============================
# RUN
# ===============================
if __name__ == "__main__":
    print("📂 ROOT_DIR =", ROOT_DIR)
    process_all_countries()