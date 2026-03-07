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
SLEEP_BETWEEN_CALLS = 0.3  # rate limit safety

CATEGORIES = [
    "Luxury",
    "Safari",
    "Ship/Cruise",
    "Adventure",
    "Polar",
    "Family",
    "Yoga&Wellness",
    "Horse Riding",
    "Diving",
    "Honeymoon",
    "Culture"
]

PROMPT_TEMPLATE = """
You are classifying travel tours.

Choose ONE AND ONLY ONE category from the list below.
Do not explain.
Do not add extra text.
Respond with only the category name.

Allowed categories:
{categories}

{tour_name_block}
{general_info_block}
{day_info_block}
""".strip()

client = OpenAI()


# ===============================
# HELPERS
# ===============================
def _is_nonempty_text(x) -> bool:
    return isinstance(x, str) and x.strip() != ""


def _build_day_info_text(day_info) -> str:
    """
    Accepts either:
    - list of dicts: [{"title": "...", "description": "..."}, ...]
    - dict
    - string
    Returns a compact text summary used for classification.
    """
    if day_info is None:
        return ""

    # If it's already a string
    if isinstance(day_info, str):
        return day_info.strip()

    parts = []

    # If it's a dict (single day or a blob)
    if isinstance(day_info, dict):
        t = day_info.get("title")
        d = day_info.get("description")
        if _is_nonempty_text(t) or _is_nonempty_text(d):
            chunk = []
            if _is_nonempty_text(t):
                chunk.append(f"Title: {t.strip()}")
            if _is_nonempty_text(d):
                chunk.append(f"Description: {d.strip()}")
            parts.append("\n".join(chunk))
        else:
            # fallback: stringify dict if nothing obvious exists
            # (but keep it minimal)
            s = json.dumps(day_info, ensure_ascii=False)
            if _is_nonempty_text(s):
                parts.append(s)
        return "\n\n".join(parts).strip()

    # If it's a list (most common for day plans)
    if isinstance(day_info, list):
        for i, item in enumerate(day_info, start=1):
            if isinstance(item, dict):
                t = item.get("title")
                d = item.get("description")
                if not (_is_nonempty_text(t) or _is_nonempty_text(d)):
                    continue

                chunk = [f"Day {i}:"]
                if _is_nonempty_text(t):
                    chunk.append(f"- Title: {t.strip()}")
                if _is_nonempty_text(d):
                    chunk.append(f"- Description: {d.strip()}")
                parts.append("\n".join(chunk))

            elif isinstance(item, str) and item.strip():
                parts.append(f"Day {i}: {item.strip()}")

        return "\n\n".join(parts).strip()

    # Unknown type: last resort convert to string
    s = str(day_info).strip()
    return s


def _make_optional_block(label: str, content: str) -> str:
    """
    Returns a labeled block only if content is non-empty.
    """
    if not _is_nonempty_text(content):
        return ""
    return f"{label}:\n{content.strip()}"


# ===============================
# CATEGORY CALL
# ===============================
def get_category(tour_name, general_info, day_info):
    day_info_text = _build_day_info_text(day_info)

    tour_name_block = _make_optional_block("Tour name", tour_name or "")
    general_info_block = _make_optional_block("General information", general_info or "")
    day_info_block = _make_optional_block("Day-by-day info (titles & descriptions)", day_info_text)

    prompt = PROMPT_TEMPLATE.format(
        categories="\n".join(CATEGORIES),
        tour_name_block=tour_name_block,
        general_info_block=general_info_block,
        day_info_block=day_info_block
    ).strip()

    # If absolutely nothing exists besides categories, fail early (optional safety)
    # You can remove this if you still want a best-guess category.
    if not (tour_name_block or general_info_block or day_info_block):
        raise ValueError("No usable text fields found (tourName/generalInfo/dayInfo are empty).")

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a strict classifier. Output must be exactly one allowed category."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    category = (response.choices[0].message.content or "").strip()

    if category not in CATEGORIES:
        raise ValueError(f"Invalid category returned: {category}")

    return category


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
            print(f"❌ Invalid format: {tours_path}")
            continue

        changed = False

        for tour in tqdm(tours, desc=f"{country} tours"):
            # 🔥 RESUME LOGIC
            if tour.get("category"):
                continue

            try:
                category = get_category(
                    tour.get("tourName"),
                    tour.get("generalInfo"),
                    tour.get("dayInfo")  # ✅ dayInfo title+description da dahil
                )

                tour["category"] = category
                changed = True

                time.sleep(SLEEP_BETWEEN_CALLS)

            except Exception as e:
                print(f"\n⚠️ Skipped tour ID {tour.get('id')}: {e}")
                continue

        if changed:
            with open(tours_path, "w", encoding="utf-8") as f:
                json.dump(tours, f, ensure_ascii=False, indent=2)

            print(f"✅ Updated: {tours_path}")


# ===============================
# RUN
# ===============================
if __name__ == "__main__":
    print("📂 ROOT_DIR =", ROOT_DIR)
    process_all_countries()