import os
import json

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "big_siempre_tour_tours")

ISTANBUL_POINT = {
    "name": "Istanbul",
    "country": "Turkey",
    "lat": 41.015137,
    "lng": 28.979530
}

# ===============================
# MAIN
# ===============================
def process_all():

    if not os.path.exists(ROOT_DIR):
        raise FileNotFoundError("ROOT_DIR not found")

    for country in os.listdir(ROOT_DIR):

        tours_path = os.path.join(ROOT_DIR, country, "tours.json")

        if not os.path.exists(tours_path):
            continue

        print(f"Processing: {country}")

        with open(tours_path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        if not isinstance(tours, list):
            continue

        changed = False

        for tour in tours:

            route_coords = tour.get("routeCoordinates")

            if not isinstance(route_coords, list) or len(route_coords) == 0:
                continue

            # Eğer zaten Istanbul varsa atla
            first = route_coords[0]
            if (
                first.get("name") == "Istanbul"
                and first.get("country") == "Turkey"
            ):
                continue

            # Başına ekle
            tour["routeCoordinates"] = [ISTANBUL_POINT] + route_coords
            changed = True

        if changed:
            with open(tours_path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)

            print(f"Updated: {tours_path}")

    print("DONE")


if __name__ == "__main__":
    process_all()
