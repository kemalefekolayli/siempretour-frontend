function resolveAssetUrl(url) {
  return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
    ? window.AssetCdn.resolve(url)
    : url;
}

async function loadTours() {
  const container = document.getElementById('tourCards');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const countryParam = params.get('country');
  const categoryParam = params.get('category');

  if (!countryParam) {
    container.innerHTML = isEnglishLang()
      ? '<p>Please select a country from the Tours page.</p>'
      : '<p>Ulke secilmedi. Lutfen Turlar sayfasindan bir ulke sec.</p>';
    return;
  }

  const country = decodeURIComponent(countryParam);
  const countryTr = typeof countryNameTr === 'function' ? countryNameTr(country) : country;
  const lang = typeof getActiveLang === 'function' ? getActiveLang() : (params.get('lang') || 'tr');
  const isEn = lang === 'en';
  const fallbackImage = resolveAssetUrl(categoryParam === 'Ship/Cruise'
    ? 'images/cruise/cruise-banner.jpg'
    : 'images/trending/trending-large.jpg');

  // Set headers immediately with Turkish name
  const dest1 = document.getElementById('tour-tab');
  if (dest1) dest1.innerHTML = isEn ? `${countryTr} Overview` : `${countryTr} Genel Bakış`;
  const dest2 = document.getElementById('overview-tab');
  if (dest2) dest2.innerHTML = isEn ? `${countryTr} Tours` : `${countryTr} Turları`;
  const dest3 = document.getElementById('theHeaderOne');
  if (dest3) dest3.innerHTML = countryTr;
  const dest4 = document.getElementById('theHeaderTwo');
  if (dest4) dest4.innerHTML = countryTr;

  // "Gemilerimiz" tabını sadece gemi turları kategorisinde göster
  if (categoryParam === 'Ship/Cruise') {
    const shipsTabItem = document.getElementById('ships-tab-item');
    if (shipsTabItem) shipsTabItem.classList.remove('d-none');
    renderShipCompanies();
  }

  // Backend has legacy TR cruise tours as Ship/Cruise and EN cruise tours as Ship.
  const backendCategory = isShipCategory(categoryParam)
    ? (isEn ? 'Ship' : 'Ship/Cruise')
    : (categoryParam || null);

  console.log("COUNTRY:", country);
  console.log("CATEGORY:", categoryParam || "ALL");

  try {
    const tours = await ApiService.getToursByDestination(country, lang, backendCategory);

    if (!Array.isArray(tours) || tours.length === 0) {
      container.innerHTML =
        isEn ? `<p>No tours are currently available for ${country}.</p>` : `<p>${country} icin su anda tur bulunamadi.</p>`;
      return;
    }

    container.innerHTML = '';

    tours.forEach(tour => {
      const image = resolveAssetUrl(tour.image1 || tour.mainPhoto || '');
      const alt = tour.imagealt || tour.tourName || 'Tour image';
      const days = tour.durationDays || '';
      const title = tour.tourName || '';
      const places = tour.placesVisited || '';
      const shipName = tour.shipName || '';

      const detailUrl = generateDetailUrl(tour.slug, tour.language || lang);
      const priceHtml = window.TourCardFormat ? window.TourCardFormat.priceHtml(tour, isEn) : '';
      const datesHtml = window.TourCardFormat ? window.TourCardFormat.datesHtml(tour, isEn) : '';

      const cardHtml = `
        <div class="tour-card col-lg-6 col-md-6 mb-4">
          <div class="pb-4 mb-0">
            <div class="ratio ratio-16x9 overflow-hidden">
              <img class="hover-zoom" src="${image || fallbackImage}" alt="${alt}" loading="lazy"
                onerror="this.onerror=null;this.src='${fallbackImage}'">
              <div class="color-overlay"></div>
            </div>

            <div class="trend-content p-0 pt-2 position-relative">
              <div class="entry-meta d-flex justify-content-between align-items-center mb-0">
                <div class="entry-author">
                  <p class="mb-0">${days ? (isEn ? `${days}-day tour` : `${days} gunluk tur`) : ''}</p>
                </div>
                <div class="entry-price text-end">
                  ${priceHtml}
                </div>
              </div>

              <h5 class="mb-1">
                <a href="${detailUrl}">${title}</a>
              </h5>
              ${shipName ? `<p class="text-muted mb-1"><i class="fa fa-ship"></i> ${shipName}</p>` : ''}

              <p class="border-b pb-2 mb-2">
                ${places}
              </p>
              ${datesHtml}
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', cardHtml);
    });

  } catch (err) {
    console.error('Turlar yüklenirken hata:', err);
    container.innerHTML =
      isEn ? `<p>${country} tours are not available right now.</p>` : `<p>Su anda ${country} turlari yuklenemiyor.</p>`;
  }
}

function isEnglishLang() {
  return typeof getActiveLang === 'function' && getActiveLang() === 'en';
}

function isShipCategory(category) {
  return category === 'Ship/Cruise' || category === 'CRUISE' || category === 'Ship';
}

const SHIP_DATA = {
  costa: {
    name: 'Costa Cruises',
    ships: [
      { name: 'Costa Magica',       image: 'images/cruise/ships/costa/costa-magica.jpg' },
      { name: 'Costa Favolosa',     image: 'images/cruise/ships/costa/costa-favolosa.jpg' },
      { name: 'Costa Fascinosa',    image: 'images/cruise/ships/costa/costa-fascinosa.jpg' },
      { name: 'Costa Fortuna',      image: 'images/cruise/ships/costa/costa-fortuna.jpg' },
      { name: 'Costa Pacifica',     image: 'images/cruise/ships/costa/costa-pacifica.jpg' },
      { name: 'Costa Mediterranea', image: 'images/cruise/ships/costa/costa-mediterranea.jpg' },
      { name: 'Costa Smeralda',     image: 'images/cruise/ships/costa/costa-smeralda.jpg' },
      { name: 'Costa Victoria',     image: 'images/cruise/ships/costa/costa-victoria.jpg' }
    ]
  },
  msc: {
    name: 'MSC Cruises',
    ships: [
      { name: 'MSC Bellissima', image: 'images/cruise/companies/msc.jpg' },
      { name: 'MSC Divina',     image: 'images/cruise/companies/msc.jpg' },
      { name: 'MSC Lirica',     image: 'images/cruise/companies/msc.jpg' },
      { name: 'MSC Meraviglia', image: 'images/cruise/ships/msc/msc-meraviglia.jpg' },
      { name: 'MSC Poesia',     image: 'images/cruise/ships/msc/msc-poesia.jpg' },
      { name: 'MSC Seaside',    image: 'images/cruise/companies/msc.jpg' },
      { name: 'MSC Seaview',    image: 'images/cruise/companies/msc.jpg' },
      { name: 'MSC Preziosa',   image: 'images/cruise/ships/msc/msc-preziosa.jpg' },
      { name: 'MSC Splendida',  image: 'images/cruise/ships/msc/msc-splendida.jpg' },
      { name: 'MSC Fantasia',   image: 'images/cruise/ships/msc/msc-fantasia.jpg' },
      { name: 'MSC Armonia',    image: 'images/cruise/ships/msc/msc-armonia.jpg' },
      { name: 'MSC Magnifica',  image: 'images/cruise/ships/msc/msc-magnifica.jpg' },
      { name: 'MSC Orchestra',  image: 'images/cruise/ships/msc/msc-orchestra.jpg' },
      { name: 'MSC Opera',      image: 'images/cruise/ships/msc/msc-opera.jpg' },
      { name: 'MSC Musica',     image: 'images/cruise/ships/msc/msc-musica.jpg' },
      { name: 'MSC Sinfonia',   image: 'images/cruise/ships/msc/msc-sinfonia.jpg' }
    ]
  },
  'royal-caribbean': {
    name: 'Royal Caribbean',
    ships: [
      { name: 'Allure Of The Seas',    image: 'images/cruise/ships/royal-caribbean/allure-of-the-seas.jpg' },
      { name: 'Jewel Of The Seas',     image: 'images/cruise/ships/royal-caribbean/jewel-of-the-seas.jpg' },
      { name: 'Oasis Of The Seas',     image: 'images/cruise/ships/royal-caribbean/oasis-of-the-seas.jpg' },
      { name: 'Ovation Of The Seas',   image: 'images/cruise/ships/royal-caribbean/ovation-of-the-seas.jpg' },
      { name: 'Harmony Of The Seas',   image: 'images/cruise/companies/royal-caribbean.jpg' },
      { name: 'Quantum Of The Seas',   image: 'images/cruise/ships/royal-caribbean/quantum-of-the-seas.jpg' },
      { name: 'Symphony Of The Seas',  image: 'images/cruise/ships/royal-caribbean/symphony-of-the-seas.jpg' },
      { name: 'Voyager Of The Seas',   image: 'images/cruise/ships/royal-caribbean/voyager-of-the-seas.jpg' },
      { name: 'Brilliance Of The Seas',image: 'images/cruise/ships/royal-caribbean/brilliance-of-the-seas.jpg' },
      { name: 'Explorer Of The Seas',  image: 'images/cruise/ships/royal-caribbean/explorer-of-the-seas.jpg' },
      { name: 'Rhapsody Of The Seas',  image: 'images/cruise/ships/royal-caribbean/rhapsody-of-the-seas.jpg' },
      { name: 'Radiance Of The Seas',  image: 'images/cruise/ships/royal-caribbean/radiance-of-the-seas.jpg' }
    ]
  },
  celebrity: {
    name: 'Celebrity Cruises',
    ships: [
      { name: 'Celebrity Reflection', image: 'images/cruise/ships/celebrity/celebrity-reflection.jpg' },
      { name: 'Celebrity Apex',       image: 'images/cruise/ships/celebrity/celebrity-apex.jpg' },
      { name: 'Celebrity Infinity',   image: 'images/cruise/ships/celebrity/celebrity-infinity.jpg' },
      { name: 'Celebrity Millenium',  image: 'images/cruise/ships/celebrity/celebrity-millenium.jpg' },
      { name: 'Celebrity Solstice',   image: 'images/cruise/ships/celebrity/celebrity-solstice.jpg' }
    ]
  },
  hurtigruten: {
    name: 'Hurtigruten Norway Cruises',
    ships: [
      { name: 'MS Nordlys', image: 'images/cruise/ships/hurtigruten/ms-nordlys.jpg' }
    ]
  }
};

const COMPANIES = [
  { name: 'Costa Cruises',              image: 'images/cruise/companies/costa.jpg',           key: 'costa' },
  { name: 'MSC Cruises',               image: 'images/cruise/companies/msc.jpg',             key: 'msc' },
  { name: 'Royal Caribbean',           image: 'images/cruise/companies/royal-caribbean.jpg', key: 'royal-caribbean' },
  { name: 'Celebrity Cruises',         image: 'images/cruise/companies/celebrity.jpg',       key: 'celebrity' },
  { name: 'Hurtigruten Norway Cruises',image: 'images/cruise/companies/hurtigruten.jpg',     key: 'hurtigruten' }
];

function renderShipCompanies() {
  const container = document.getElementById('ships-container');
  if (!container) return;
  const fallbackImage = resolveAssetUrl('images/cruise/cruise-banner.jpg');

  const cards = COMPANIES.map(c => `
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="ship-company-card" data-company-key="${c.key}" style="cursor:pointer;">
        <div class="ratio ratio-16x9 overflow-hidden">
          <img loading="lazy" class="hover-zoom" src="${resolveAssetUrl(c.image)}" alt="${c.name}"
            onerror="this.src='${fallbackImage}'">
        </div>
        <div class="ship-company-info pt-2 pb-1">
          <h6 class="mb-0">${c.name}</h6>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `<div class="row mt-4">${cards}</div>`;

  container.querySelectorAll('.ship-company-card').forEach(card => {
    card.addEventListener('click', () => renderShipList(card.dataset.companyKey));
  });
}

function renderShipList(key) {
  const container = document.getElementById('ships-container');
  if (!container) return;
  const fallbackImage = resolveAssetUrl('images/cruise/cruise-banner.jpg');

  const company = SHIP_DATA[key];
  if (!company) return;

  const shipCards = company.ships.map(s => {
    const slug = s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const detailUrl = `template_ship_detail_page.html?company=${key}&ship=${slug}`;
    return `
    <div class="col-lg-4 col-md-6 mb-4">
      <a href="${detailUrl}" class="text-decoration-none">
        <div class="ship-company-card">
          <div class="ratio ratio-16x9 overflow-hidden">
            <img loading="lazy" class="hover-zoom" src="${resolveAssetUrl(s.image)}" alt="${s.name}"
              onerror="this.src='${fallbackImage}'">
          </div>
          <div class="ship-company-info pt-2 pb-1">
            <h6 class="mb-0">${s.name}</h6>
          </div>
        </div>
      </a>
    </div>
  `;
  }).join('');

  container.innerHTML = `
    <div class="d-flex align-items-center gap-3 mt-4 mb-4">
      <button class="ships-back-btn" id="ships-back-btn">
        <i class="fa fa-arrow-left"></i> ${isEnglishLang() ? 'All Companies' : 'Tum Sirketler'}
      </button>
      <h5 class="mb-0 fw-semibold">${company.name}</h5>
    </div>
    <div class="row">${shipCards}</div>
  `;

  document.getElementById('ships-back-btn').addEventListener('click', renderShipCompanies);
}

document.addEventListener('DOMContentLoaded', loadTours);
