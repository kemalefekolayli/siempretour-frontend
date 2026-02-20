import os
import json

BASE_FOLDER = "data/siempre_tour_country_datas"  # gerekiyorsa bunu değiştir
TARGET_FILENAME = "datas.json"

def fix_text(text: str):
    original = text

    # 1) CP1252/latin1 yanlış decode -> UTF-8 düzeltmeye çalış
    # Bu, "youll", "produce " gibi hataları genelde kökten çözer.
    try:
        text = text.encode("latin1").decode("utf-8")
    except Exception:
        pass

    # 2) Kalan yaygın bozuk karakterleri deterministik düzelt
    # (Bazı dosyalarda double-encoding kalıntısı olabiliyor)
    replacements = {
        "": "’",   # right single quote
        "": "‘",   # left single quote
        "": "–",   # en dash
        "": "—",   # em dash
        "â€™": "’",
        "â€˜": "‘",
        "â€œ": "“",
        "â€": "”",
        "â€“": "–",
        "â€”": "—",
        "Â ": " ",  # non-breaking / stray Â
        "Â": "",

        # Eğer TR/Euro karakterlerinde de bozulma görürsen bunlar işe yarar:
        "Ã¶": "ö",
        "Ã¼": "ü",
        "Ã§": "ç",
        "Ä": "ğ",
        "Ä±": "ı",
        "Å": "ş",
        "Ã–": "Ö",
        "Ãœ": "Ü",
        "Ã‡": "Ç",
        "Ä": "Ğ",
        "Ä°": "İ",
        "Å": "Ş",
        "Ã©": "é",
        "Ã¨": "è",
        "Ã±": "ñ",
        "ÃŸ": "ß",
    }

    for bad, good in replacements.items():
        text = text.replace(bad, good)

    return text, (text != original)

def recursive_fix(obj, stats):
    if isinstance(obj, dict):
        return {k: recursive_fix(v, stats) for k, v in obj.items()}
    if isinstance(obj, list):
        return [recursive_fix(i, stats) for i in obj]
    if isinstance(obj, str):
        fixed, changed = fix_text(obj)
        if changed:
            stats["fixed_strings"] += 1
        return fixed
    return obj

def process_datas_json(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print(f"⚠ Skipped (not array): {path}")
        return 0

    stats = {"fixed_strings": 0}
    fixed_data = recursive_fix(data, stats)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(fixed_data, f, ensure_ascii=False, indent=4)

    return stats["fixed_strings"]

def main():
    total_files = 0
    total_fixed = 0

    for country in os.listdir(BASE_FOLDER):
        country_path = os.path.join(BASE_FOLDER, country)
        if not os.path.isdir(country_path):
            continue

        datas_path = os.path.join(country_path, TARGET_FILENAME)
        if not os.path.exists(datas_path):
            continue

        total_files += 1
        fixed_count = process_datas_json(datas_path)
        total_fixed += fixed_count
        print(f"✔ {datas_path} | fixed strings: {fixed_count}")

    print("\n==== SUMMARY ====")
    print(f"Processed files: {total_files}")
    print(f"Fixed strings : {total_fixed}")

if __name__ == "__main__":
    main()
