import os
import json

# ===============================
# CONFIG
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, "big_siempre_tour_tours_tr")
TOURS_FILE = "tours.json"

# ===============================
# EN -> TR MAP (destination çevirisi için)
# ===============================
EN_TO_TR = {
    "Alaska": "Alaska",
    "Albania": "Arnavutluk",
    "Algeria": "Cezayir",
    "Andorra": "Andorra",
    "Angola": "Angola",
    "Antarctica": "Antarktika",
    "Arctic Cruises": "Arktik Kruvaziyer",
    "Argentina": "Arjantin",
    "Armenia": "Ermenistan",
    "Australia": "Avustralya",
    "Austria": "Avusturya",
    "Azerbaijan": "Azerbaycan",
    "Azores": "Azor Adaları",
    "Bahamas": "Bahamalar",
    "Bali": "Bali",
    "Bangladesh": "Bangladeş",
    "Belize": "Belize",
    "Benin": "Benin",
    "Bhutan": "Butan",
    "Bolivia": "Bolivya",
    "Bora Bora": "Bora Bora",
    "Borneo": "Borneo",
    "Bosnia Herzegovina": "Bosna Hersek",
    "Botswana": "Botsvana",
    "Brazil": "Brezilya",
    "Bulgaria": "Bulgaristan",
    "Burkina Faso": "Burkina Faso",
    "Burma": "Myanmar",
    "Burundi": "Burundi",
    "Cambodia": "Kamboçya",
    "Cameroon": "Kamerun",
    "Canada": "Kanada",
    "Canary Islands": "Kanarya Adaları",
    "Cape Verde Islands": "Yeşil Burun Adaları",
    "Chad": "Çad",
    "Channel Islands": "Manş Adaları",
    "Chile": "Şili",
    "China": "Çin",
    "Colombia": "Kolombiya",
    "Comoros": "Komorlar",
    "Congo": "Kongo",
    "Costa Rica": "Kosta Rika",
    "Croatia": "Hırvatistan",
    "Cuba": "Küba",
    "Cyprus": "Kıbrıs",
    "Czech Republic": "Çek Cumhuriyeti",
    "Denmark": "Danimarka",
    "Djibouti": "Cibuti",
    "Dominica": "Dominika",
    "Dominican Republic": "Dominik Cumhuriyeti",
    "East Timor": "Doğu Timor",
    "Ecuador & Galapagos": "Ekvador ve Galapagos",
    "Egypt": "Mısır",
    "El Salvador": "El Salvador",
    "England": "İngiltere",
    "Equatorial Guinea": "Ekvator Ginesi",
    "Eritrea": "Eritre",
    "Estonia": "Estonya",
    "Ethiopia": "Etiyopya",
    "Faroe Islands": "Faroe Adaları",
    "Fiji": "Fiji",
    "Finland": "Finlandiya",
    "France": "Fransa",
    "French Guiana": "Fransız Guyanası",
    "French Polynesia": "Fransız Polinezyası",
    "Gabon": "Gabon",
    "Gambia": "Gambiya",
    "Georgia": "Gürcistan",
    "Germany": "Almanya",
    "Ghana": "Gana",
    "Greece": "Yunanistan",
    "Greenland": "Grönland",
    "Guatemala": "Guatemala",
    "Guinea": "Gine",
    "Guyana": "Guyana",
    "Hungary": "Macaristan",
    "Iceland": "İzlanda",
    "India": "Hindistan",
    "Indonesia": "Endonezya",
    "Iran": "İran",
    "Iraq": "Irak",
    "Ireland": "İrlanda",
    "Israel": "İsrail",
    "Italy": "İtalya",
    "Ivory Coast": "Fildişi Sahili",
    "Jamaica": "Jamaika",
    "Japan": "Japonya",
    "Jordan": "Ürdün",
    "Kazakhstan": "Kazakistan",
    "Kenya": "Kenya",
    "Kosovo": "Kosova",
    "Kyrgyzstan": "Kırgızistan",
    "Laos": "Laos",
    "Lapland": "Laponya",
    "Latvia": "Letonya",
    "Lebanon": "Lübnan",
    "Liberia": "Liberya",
    "Libya": "Libya",
    "Lithuania": "Litvanya",
    "Madagascar": "Madagaskar",
    "Malawi": "Malavi",
    "Malaysia": "Malezya",
    "Maldives": "Maldivler",
    "Mali": "Mali",
    "Malta": "Malta",
    "Mauritania": "Moritanya",
    "Mauritius": "Mauritius",
    "Mexico": "Meksika",
    "Moldova": "Moldova",
    "Mongolia": "Moğolistan",
    "Montenegro": "Karadağ",
    "Morocco": "Fas",
    "Mozambique": "Mozambik",
    "Namibia": "Namibya",
    "Nepal": "Nepal",
    "New Zealand": "Yeni Zelanda",
    "Nicaragua": "Nikaragua",
    "Nigeria": "Nijerya",
    "Norway": "Norveç",
    "Oman": "Umman",
    "Pakistan": "Pakistan",
    "Panama": "Panama",
    "Papua New Guinea": "Papua Yeni Gine",
    "Paraguay": "Paraguay",
    "Patagonia": "Patagonya",
    "Peru": "Peru",
    "Philippines": "Filipinler",
    "Poland": "Polonya",
    "Portugal": "Portekiz",
    "Romania": "Romanya",
    "Rwanda": "Ruanda",
    "Saint Lucia": "Saint Lucia",
    "Sao Tome And Principe": "Sao Tome ve Principe",
    "Saudi Arabia": "Suudi Arabistan",
    "Scotland": "İskoçya",
    "Senegal": "Senegal",
    "Serbia": "Sırbistan",
    "Seychelles": "Seyşeller",
    "Sierra Leone": "Sierra Leone",
    "Slovakia": "Slovakya",
    "Slovenia": "Slovenya",
    "Solomon Islands": "Solomon Adaları",
    "South Africa": "Güney Afrika",
    "South Korea": "Güney Kore",
    "South Sudan": "Güney Sudan",
    "Spain": "İspanya",
    "Spitsbergen": "Spitsbergen",
    "Sri Lanka": "Sri Lanka",
    "St Helena": "Saint Helena",
    "Swaziland": "Svaziland",
    "Sweden": "İsveç",
    "Switzerland": "İsviçre",
    "Syria": "Suriye",
    "Tahiti": "Tahiti",
    "Taiwan": "Tayvan",
    "Tajikistan": "Tacikistan",
    "Tanzania": "Tanzanya",
    "Thailand": "Tayland",
    "Tibet": "Tibet",
    "Tonga": "Tonga",
    "Trinidad And Tobago": "Trinidad ve Tobago",
    "Tunisia": "Tunus",
    "Turkey": "Türkiye",
    "Turkmenistan": "Türkmenistan",
    "Uganda": "Uganda",
    "Uk": "Birleşik Krallık",
    "United Arab Emirates": "Birleşik Arap Emirlikleri",
    "Uruguay": "Uruguay",
    "Usa": "Amerika Birleşik Devletleri",
    "Uzbekistan": "Özbekistan",
    "Venezuela": "Venezuela",
    "Vietnam": "Vietnam",
    "Western Sahara": "Batı Sahra",
    "Yemen": "Yemen",
    "Zambia": "Zambiya",
    "Zimbabwe": "Zimbabve",
}

# quick reverse set: already TR?
TR_VALUES = set(EN_TO_TR.values())

# ===============================
# HELPERS
# ===============================
def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(path: str, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

def normalize_key(s: str) -> str:
    return (s or "").strip()

# ===============================
# MAIN
# ===============================
def main():
    if not os.path.isdir(ROOT_DIR):
        raise FileNotFoundError(f"ROOT_DIR not found: {ROOT_DIR}")

    files_updated = 0
    tours_updated = 0
    tours_skipped = 0

    for country_folder in sorted(os.listdir(ROOT_DIR)):
        tours_path = os.path.join(ROOT_DIR, country_folder, TOURS_FILE)
        if not os.path.exists(tours_path):
            continue

        data = load_json(tours_path)
        if not isinstance(data, list):
            continue

        changed = False

        for tour in data:
            if not isinstance(tour, dict):
                continue

            dest = tour.get("destination")
            if not isinstance(dest, str) or not dest.strip():
                tours_skipped += 1
                continue

            dest = normalize_key(dest)

            # already Turkish -> skip
            if dest in TR_VALUES:
                continue

            # translate if mapped
            if dest in EN_TO_TR:
                tour["destination"] = EN_TO_TR[dest]
                changed = True
                tours_updated += 1

        if changed:
            save_json(tours_path, data)
            files_updated += 1
            print(f"✅ Updated destination in: {country_folder}")

    print("\n==============================")
    print(f"Files updated: {files_updated}")
    print(f"Tours updated: {tours_updated}")
    print(f"Tours skipped (no destination): {tours_skipped}")
    print("==============================\n")

if __name__ == "__main__":
    main()