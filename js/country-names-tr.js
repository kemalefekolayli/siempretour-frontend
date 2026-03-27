/**
 * İngilizce ülke adı → Türkçe çeviri
 * Navbar mega menüdeki data-country değerlerinden türetilmiştir.
 */
const COUNTRY_NAME_TR = {
  "Albania": "Arnavutluk", "Andorra": "Andorra", "Austria": "Avusturya",
  "Bosnia Herzegovina": "Bosna Hersek", "Bulgaria": "Bulgaristan", "Croatia": "Hırvatistan",
  "Czech Republic": "Çek Cumhuriyeti", "Denmark": "Danimarka", "England": "İngiltere",
  "Estonia": "Estonya", "Finland": "Finlandiya", "France": "Fransa",
  "Germany": "Almanya", "Greece": "Yunanistan", "Hungary": "Macaristan",
  "Iceland": "İzlanda", "Ireland": "İrlanda", "Italy": "İtalya",
  "Kosovo": "Kosova", "Latvia": "Letonya", "Lithuania": "Litvanya",
  "Malta": "Malta", "Montenegro": "Karadağ", "Norway": "Norveç",
  "Poland": "Polonya", "Portugal": "Portekiz", "Romania": "Romanya",
  "Scotland": "İskoçya", "Serbia": "Sırbistan", "Slovakia": "Slovakya",
  "Slovenia": "Slovenya", "Spain": "İspanya", "Sweden": "İsveç",
  "Switzerland": "İsviçre", "Turkey": "Türkiye", "Uk": "Birleşik Krallık",
  "Faroe Islands": "Faroe Adaları", "Lapland": "Lapland", "Moldova": "Moldova",
  "Channel Islands": "Channel Adaları",
  "Algeria": "Cezayir", "Angola": "Angola", "Benin": "Benin",
  "Botswana": "Botsvana", "Burkina Faso": "Burkina Faso", "Cameroon": "Kamerun",
  "Chad": "Çad", "Congo": "Kongo", "Djibouti": "Cibuti",
  "Egypt": "Mısır", "Ethiopia": "Etiyopya", "Gabon": "Gabon",
  "Gambia": "Gambiya", "Ghana": "Gana", "Kenya": "Kenya",
  "Madagascar": "Madagaskar", "Malawi": "Malavi", "Mauritius": "Mauritius",
  "Morocco": "Fas", "Namibia": "Namibya", "Rwanda": "Ruanda",
  "Senegal": "Senegal", "South Africa": "Güney Afrika", "Tanzania": "Tanzanya",
  "Tunisia": "Tunus", "Uganda": "Uganda", "Zambia": "Zambiya",
  "Zimbabwe": "Zimbabve", "Burundi": "Burundi", "Comoros": "Komorlar",
  "Guinea": "Gine", "Ivory Coast": "Fildişi Sahili", "Liberia": "Liberya",
  "Libya": "Libya", "Sierra Leone": "Sierra Leone", "South Sudan": "Güney Sudan",
  "Swaziland": "Esvatini", "Western Sahara": "Batı Sahra",
  "Argentina": "Arjantin", "Belize": "Belize", "Bolivia": "Bolivya",
  "Brazil": "Brezilya", "Chile": "Şili", "Colombia": "Kolombiya",
  "Costa Rica": "Kosta Rika", "Cuba": "Küba", "Dominican Republic": "Dominik Cumhuriyeti",
  "Ecuador & Galapagos": "Ekvador & Galapagos", "Guatemala": "Guatemala",
  "Jamaica": "Jamaika", "Mexico": "Meksika", "Nicaragua": "Nikaragua",
  "Panama": "Panama", "Paraguay": "Paraguay", "Peru": "Peru",
  "Uruguay": "Uruguay", "Venezuela": "Venezuela", "Bahamas": "Bahamalar",
  "Guyana": "Guyana", "Suriname": "Surinam", "Trinidad And Tobago": "Trinidad ve Tobago",
  "Australia": "Avustralya", "Bora Bora": "Bora Bora", "Fiji": "Fiji",
  "French Polynesia": "Fransız Polinezyası", "New Zealand": "Yeni Zelanda",
  "Solomon Islands": "Solomon Adaları", "Tahiti": "Tahiti", "Tonga": "Tonga",
  "Bali": "Bali", "Papua New Guinea": "Papua Yeni Gine",
  "Armenia": "Ermenistan", "Azerbaijan": "Azerbaycan", "Bangladesh": "Bangladeş",
  "Bhutan": "Bhutan", "Cambodia": "Kamboçya", "China": "Çin",
  "India": "Hindistan", "Indonesia": "Endonezya", "Japan": "Japonya",
  "Jordan": "Ürdün", "Kazakhstan": "Kazakistan", "Kyrgyzstan": "Kırgızistan",
  "Laos": "Laos", "Malaysia": "Malezya", "Maldives": "Maldivler",
  "Mongolia": "Moğolistan", "Nepal": "Nepal", "Pakistan": "Pakistan",
  "Philippines": "Filipinler", "Sri Lanka": "Sri Lanka", "Thailand": "Tayland",
  "Vietnam": "Vietnam", "Burma": "Myanmar", "Brunei": "Brunei", "Singapore": "Singapur",
  "Iran": "İran", "Iraq": "Irak", "Israel": "İsrail",
  "Lebanon": "Lübnan", "Oman": "Umman", "Saudi Arabia": "Suudi Arabistan",
  "Syria": "Suriye", "United Arab Emirates": "Birleşik Arap Emirlikleri", "Yemen": "Yemen",
  "Antarctica": "Antarktika", "Arctic Cruises": "Arktik Turları",
  "Greenland": "Grönland", "Spitsbergen": "Spitsbergen", "St Helena": "Saint Helena",
  "Alaska": "Alaska", "Canada": "Kanada", "Canary Islands": "Kanarya Adaları",
  "Cape Verde Islands": "Yeşil Burun Adaları", "Seychelles": "Seyşeller",
  "Saint Lucia": "Saint Lucia", "Borneo": "Borneo", "Mozambique": "Mozambik"
};

/**
 * Returns the localized country name based on active language.
 * Turkish → use COUNTRY_NAME_TR mapping
 * English or other → return English name as-is (Google Translate handles the rest)
 */
function countryNameTr(enName) {
  const lang = typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  if (lang === 'tr') {
    return COUNTRY_NAME_TR[enName] || enName;
  }
  return enName;
}
