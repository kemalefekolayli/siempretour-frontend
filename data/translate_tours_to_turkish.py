import os
import json
import time
from typing import Any, Dict, List
from openai import OpenAI
from tqdm import tqdm
from datetime import datetime

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCE_ROOT = os.path.join(BASE_DIR, "big_siempre_tour_tours")
TARGET_ROOT = os.path.join(BASE_DIR, "big_siempre_tour_tours_tr")
FAILED_LOG_PATH = os.path.join(BASE_DIR, "failed_tours.jsonl")

MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.3
MAX_RETRIES = 4
MAX_CHARS_PER_CALL = 12000

client = OpenAI()

# ===============================
# PROMPT
# ===============================
TRANSLATION_RULES = """
You are translating content for a premium tour company website.

Translate ALL provided texts into natural, fluent Turkish with a premium tone.

Hard rules:
- Output ONLY valid JSON that matches the required schema. No extra text.
- Translate to Turkish only.
- Preserve proper nouns (city names, person names, ship names, brand names) as-is.
- Preserve numbers, currencies, dates, durations, day counts as-is.
- Translate audience terms naturally for a premium tone (e.g., "senior" -> "ileri yaş").
- Preserve existing line breaks.
- Do NOT change any HTML elements.
- Do not summarize.

Return EXACT structure:
{"items":[{"path":"...","text":"..."}]}
""".strip()

TRANSLATION_SCHEMA = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "text": {"type": "string"},
                },
                "required": ["path", "text"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["items"],
    "additionalProperties": False,
}

# ===============================
# UTIL
# ===============================
def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def atomic_save_json(path: str, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

def log_failed(country: str, tour_id: str, error_msg: str):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "country": country,
        "tourId": tour_id,
        "error": str(error_msg)
    }
    with open(FAILED_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def normalize_newlines(s: str) -> str:
    return s.replace("/n", "\n")

def is_nonempty_str(v: Any) -> bool:
    return isinstance(v, str) and v.strip() != ""

# ===============================
# COLLECTION
# ===============================
def collect_translatable_items(tour: Dict[str, Any]) -> List[Dict[str, str]]:
    items = []

    def add(path, value):
        if is_nonempty_str(value):
            items.append({"path": path, "text": normalize_newlines(value)})

    add("tourName", tour.get("tourName"))
    add("placesVisited", tour.get("placesVisited"))
    add("generalInfo", tour.get("generalInfo"))
    add("whatExpect", tour.get("whatExpect"))

    if isinstance(tour.get("dayInfo"), list):
        for i, day in enumerate(tour["dayInfo"]):
            if isinstance(day, dict):
                add(f"dayInfo.{i}.title", day.get("title"))
                add(f"dayInfo.{i}.description", day.get("description"))

    if isinstance(tour.get("routeCoordinates"), list):
        for i, node in enumerate(tour["routeCoordinates"]):
            if isinstance(node, dict):
                add(f"routeCoordinates.{i}.name", node.get("name"))
                add(f"routeCoordinates.{i}.country", node.get("country"))

    return items

def set_by_path(tour: Dict[str, Any], path: str, value: str):
    parts = path.split(".")
    if len(parts) == 1:
        tour[parts[0]] = value
        return
    if len(parts) == 3:
        arr, idx, field = parts
        idx = int(idx)
        tour[arr][idx][field] = value

# ===============================
# CHUNKING
# ===============================
def chunk_items(items: List[Dict[str, str]]):
    batches = []
    cur = []
    cur_len = 0
    for it in items:
        tlen = len(it["text"])
        if cur and (cur_len + tlen > MAX_CHARS_PER_CALL):
            batches.append(cur)
            cur = []
            cur_len = 0
        cur.append(it)
        cur_len += tlen
    if cur:
        batches.append(cur)
    return batches

# ===============================
# OPENAI STRUCTURED CALL
# ===============================
def translate_structured(items):
    payload = {"items": items}

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.responses.create(
                model=MODEL,
                input=[
                    {"role": "system", "content": TRANSLATION_RULES},
                    {"role": "user", "content": json.dumps(payload, ensure_ascii=False)}
                ],
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "translation_result",
                        "schema": TRANSLATION_SCHEMA,
                        "strict": True,
                    }
                },
            )
            data = json.loads(resp.output_text)
            return data["items"]

        except Exception as e:
            if attempt == MAX_RETRIES:
                raise
            time.sleep(0.8 * attempt)

def translate_items(items):
    batches = chunk_items(items)
    out = []
    for b in batches:
        out.extend(translate_structured(b))
        time.sleep(SLEEP_BETWEEN_CALLS)
    return out

# ===============================
# MAIN
# ===============================
def process_country(country):
    src = os.path.join(SOURCE_ROOT, country, "tours.json")
    if not os.path.exists(src):
        return

    tgt_dir = os.path.join(TARGET_ROOT, country)
    tgt = os.path.join(tgt_dir, "tours.json")
    ensure_dir(tgt_dir)

    if os.path.exists(tgt):
        tours = load_json(tgt)
    else:
        tours = load_json(src)

    print(f"\n📍 {country} | tours: {len(tours)}")

    for tour in tqdm(tours, desc=f"{country} tours"):
        if tour.get("__trTranslated"):
            continue

        items = collect_translatable_items(tour)

        try:
            if items:
                translated = translate_items(items)
                for it in translated:
                    set_by_path(tour, it["path"], it["text"])

            tour["__trTranslated"] = True
            atomic_save_json(tgt, tours)

        except Exception as e:
            log_failed(country, tour.get("id"), str(e))
            atomic_save_json(tgt, tours)
            continue

    print(f"✅ Finished {country}")

def main():
    ensure_dir(TARGET_ROOT)
    countries = sorted(os.listdir(SOURCE_ROOT))
    for c in countries:
        if os.path.isdir(os.path.join(SOURCE_ROOT, c)):
            process_country(c)

if __name__ == "__main__":
    main()