import os
import json
import time
from openai import OpenAI

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "siempretour_tours")

MODEL = "gpt-4o-mini"
SLEEP = 0.3

client = OpenAI()

# ===============================
# TRANSLATE
# ===============================
def translate_items(items):
    response = client.chat.completions.create(
        model=MODEL,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": "Translate all texts to Turkish. Return ONLY valid JSON array."
            },
            {
                "role": "user",
                "content": json.dumps(items, ensure_ascii=False)
            }
        ],
    )

    return json.loads(response.choices[0].message.content)


# ===============================
# MAIN
# ===============================
def process():

    for country in os.listdir(ROOT_DIR):

        tours_path = os.path.join(ROOT_DIR, country, "tours.json")
        if not os.path.exists(tours_path):
            continue

        print("Processing:", country)

        with open(tours_path, "r", encoding="utf-8") as f:
            tours = json.load(f)

        changed = False

        for tour in tours:

            if tour.get("__routeTranslated"):
                continue

            route = tour.get("routeCoordinates")
            if not isinstance(route, list) or not route:
                continue

            payload = []
            for i, node in enumerate(route):
                payload.append({
                    "index": i,
                    "name": node.get("name", ""),
                    "country": node.get("country", "")
                })

            try:
                translated = translate_items(payload)

                for item in translated:
                    idx = item["index"]
                    route[idx]["name"] = item["name"]
                    route[idx]["country"] = item["country"]

                tour["__routeTranslated"] = True
                changed = True

                time.sleep(SLEEP)

            except Exception as e:
                print("Error:", e)
                continue

        if changed:
            with open(tours_path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)

    print("DONE")


if __name__ == "__main__":
    process()