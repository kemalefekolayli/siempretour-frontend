import os
import json
import time
from openai import OpenAI
from tqdm import tqdm

# ===============================
# CONFIG (PATH SAFE)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "big_siempre_tour_tours")

MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.3  # rate limit safety

client = OpenAI()

# ===============================
# GPT ROUTE CALL (JSON GUARANTEED)
# ===============================
def extract_route_for_tour(tour: dict):
    destination = (tour.get("destination") or "").strip()
    places_visited = (tour.get("placesVisited") or "").strip()
    general_info = (tour.get("generalInfo") or "").strip()

    # Build itinerary text from dayInfo
    day_infos = tour.get("dayInfo", []) or []
    itinerary_lines = []
    for i, day in enumerate(day_infos):
        desc = (day.get("description") or "").strip()
        if desc:
            itinerary_lines.append(f"Day {i+1}: {desc}")
    itinerary = "\n".join(itinerary_lines).strip()

    # IMPORTANT: f-string kullanıyoruz -> .format yok -> {} problemi yok
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

Tour destination: {destination}

Places visited (may be empty):
{places_visited}

General information:
{general_info}

Day-by-day itinerary:
{itinerary}
""".strip()

    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        # JSON output'u kilitliyor (markdown vs. engeller)
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
            if "route" in tour and tour["route"]:
                continue

            # dayInfo yoksa skip (çok zayıf sinyal)
            if not tour.get("dayInfo"):
                continue

            try:
                route = extract_route_for_tour(tour)
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
