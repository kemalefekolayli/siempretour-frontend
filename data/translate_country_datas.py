import os
import json
import time
from typing import Any, Dict, List
from datetime import datetime
from openai import OpenAI
from tqdm import tqdm

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SOURCE_ROOT = os.path.join(BASE_DIR, "siempre_tour_country_datas")
TARGET_ROOT = os.path.join(BASE_DIR, "siempre_tour_country_datas_tr")
FAILED_LOG_PATH = os.path.join(BASE_DIR, "failed_country_datas_translation.jsonl")

MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.3
MAX_RETRIES = 4
MAX_CHARS_PER_CALL = 12000

client = OpenAI()

# ===============================
# PROMPT
# ===============================
TRANSLATION_RULES = """
You are translating tourism website content into natural, fluent Turkish.

Hard rules:
- Output ONLY valid JSON matching the required schema.
- Translate to Turkish only.
- Preserve proper nouns when appropriate.
- Preserve numbers, currencies, dates, month names in context, durations, and URLs.
- Preserve line breaks.
- Do NOT summarize.
- For HTML fields: preserve the HTML structure exactly.
- Do NOT remove, add, rename, or reorder HTML tags.
- Do NOT modify attributes, href values, class names, style values, ids, or inline CSS.
- Only translate the visible human-readable text inside the HTML.

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

def log_failed(country: str, item_type: str, error_msg: str):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "country": country,
        "type": item_type,
        "error": str(error_msg),
    }
    with open(FAILED_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def is_nonempty_str(v: Any) -> bool:
    return isinstance(v, str) and v.strip() != ""

# ===============================
# COLLECTION
# ===============================
def collect_overview_items(item: Dict[str, Any]) -> List[Dict[str, str]]:
    items = []

    for key, value in item.items():
        # skip technical / image fields / flag
        if key == "type" or key == "__trTranslated":
            continue
        if key.lower().startswith("image"):
            continue

        if is_nonempty_str(value):
            items.append({"path": key, "text": value})

    return items

def collect_best_time_items(item: Dict[str, Any]) -> List[Dict[str, str]]:
    items = []

    # explicitly important fields
    for key in ["Main_Title", "Main_Paragraph", "when_to_go", "when_to_go_html"]:
        if is_nonempty_str(item.get(key)):
            items.append({"path": key, "text": item[key]})

    # dynamic title/paragraph pairs and any extras of that shape
    for key, value in item.items():
        if key in {"type", "__trTranslated", "Main_Title", "Main_Paragraph", "when_to_go", "when_to_go_html"}:
            continue
        if key.lower().startswith("image"):
            continue

        k = key.lower()
        if (k.startswith("title") or k.startswith("paragraph")) and is_nonempty_str(value):
            items.append({"path": key, "text": value})

    return items

def collect_translatable_items(item: Dict[str, Any]) -> List[Dict[str, str]]:
    item_type = item.get("type")

    if item_type == "overview":
        return collect_overview_items(item)

    if item_type == "best-time-to":
        return collect_best_time_items(item)

    return []

# ===============================
# APPLY
# ===============================
def apply_translations(item: Dict[str, Any], translated_items: List[Dict[str, str]]):
    for tr in translated_items:
        path = tr.get("path")
        text = tr.get("text")
        if isinstance(path, str) and isinstance(text, str):
            item[path] = text

# ===============================
# CHUNKING
# ===============================
def chunk_items(items: List[Dict[str, str]]) -> List[List[Dict[str, str]]]:
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
def translate_structured(items: List[Dict[str, str]]) -> List[Dict[str, str]]:
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
                        "name": "country_datas_translation",
                        "schema": TRANSLATION_SCHEMA,
                        "strict": True,
                    }
                },
            )

            data = json.loads(resp.output_text)
            translated = data["items"]

            if not isinstance(translated, list):
                raise ValueError("Translated payload items is not a list.")

            return translated

        except Exception:
            if attempt == MAX_RETRIES:
                raise
            time.sleep(0.8 * attempt)

def translate_items(items: List[Dict[str, str]]) -> List[Dict[str, str]]:
    batches = chunk_items(items)
    out = []

    for batch in batches:
        out.extend(translate_structured(batch))
        time.sleep(SLEEP_BETWEEN_CALLS)

    return out

# ===============================
# COUNTRY PROCESS
# ===============================
def process_country(country: str):
    src_path = os.path.join(SOURCE_ROOT, country, "datas.json")
    if not os.path.exists(src_path):
        return

    tgt_dir = os.path.join(TARGET_ROOT, country)
    tgt_path = os.path.join(tgt_dir, "datas.json")
    ensure_dir(tgt_dir)

    # resume-safe:
    # if target exists continue from target, else copy source content logically
    if os.path.exists(tgt_path):
        data = load_json(tgt_path)
    else:
        data = load_json(src_path)

    if not isinstance(data, list):
        print(f"⚠️ Invalid format: {src_path}")
        return

    print(f"\n📍 {country} | blocks: {len(data)}")

    changed_any = False

    for idx, item in enumerate(tqdm(data, desc=f"{country} datas")):
        if not isinstance(item, dict):
            continue

        if item.get("__trTranslated"):
            continue

        item_type = item.get("type", "")
        translatable = collect_translatable_items(item)

        try:
            if translatable:
                translated = translate_items(translatable)
                apply_translations(item, translated)
                changed_any = True

            item["__trTranslated"] = True
            changed_any = True

            atomic_save_json(tgt_path, data)

        except Exception as e:
            log_failed(country, str(item_type), str(e))
            atomic_save_json(tgt_path, data)
            continue

    if changed_any:
        print(f"✅ Finished: {country}")
    else:
        print(f"ℹ️ No changes: {country}")

# ===============================
# MAIN
# ===============================
def main():
    if not os.path.isdir(SOURCE_ROOT):
        raise FileNotFoundError(f"SOURCE_ROOT not found: {SOURCE_ROOT}")

    ensure_dir(TARGET_ROOT)

    countries = sorted(
        [c for c in os.listdir(SOURCE_ROOT) if os.path.isdir(os.path.join(SOURCE_ROOT, c))]
    )

    for country in countries:
        process_country(country)

    print("\n🚀 DONE")

if __name__ == "__main__":
    main()