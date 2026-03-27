async function loadTours() {
  const container = document.getElementById('tourCards');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const countryParam = params.get('country');
  const categoryParam = params.get('category');

  if (!countryParam) {
    container.innerHTML =
      '<p>Ülke seçilmedi. Lütfen Turlar sayfasından bir ülke seç.</p>';
    return;
  }

  const country = decodeURIComponent(countryParam);
  const countryTr = typeof countryNameTr === 'function' ? countryNameTr(country) : country;
  const lang = typeof getActiveLang === 'function' ? getActiveLang() : (params.get('lang') || 'tr');

  // Set headers immediately with Turkish name
  const dest1 = document.getElementById('tour-tab');
  if (dest1) dest1.innerHTML = `${countryTr} Genel Bakış`;
  const dest2 = document.getElementById('overview-tab');
  if (dest2) dest2.innerHTML = `${countryTr} Turları`;
  const dest3 = document.getElementById('theHeaderOne');
  if (dest3) dest3.innerHTML = countryTr;
  const dest4 = document.getElementById('theHeaderTwo');
  if (dest4) dest4.innerHTML = countryTr;

  // Pass category as-is — backend accepts both enum names and display names
  const backendCategory = categoryParam || null;

  console.log("COUNTRY:", country);
  console.log("CATEGORY:", categoryParam || "ALL");

  try {
    const tours = await ApiService.getToursByDestination(country, lang, backendCategory);

    if (!Array.isArray(tours) || tours.length === 0) {
      container.innerHTML =
        `<p>${country} için şu anda tur bulunamadı.</p>`;
      return;
    }

    container.innerHTML = '';

    tours.forEach(tour => {
      const image = tour.image1 || tour.mainPhoto || '';
      const alt = tour.imagealt || tour.tourName || 'Tour image';
      const days = tour.durationDays || '';
      const title = tour.tourName || '';
      const places = tour.placesVisited || '';
      const shipName = tour.shipName || '';

      const detailUrl = generateDetailUrl(tour.slug);

      const cardHtml = `
        <div class="tour-card col-lg-6 col-md-6 mb-4">
          <div class="pb-4 mb-0">
            <div class="ratio ratio-16x9 overflow-hidden">
              ${image ? `<img class="hover-zoom" src="${image}" alt="${alt}">` : ''}
              <div class="color-overlay"></div>
            </div>

            <div class="trend-content p-0 pt-2 position-relative">
              <div class="entry-meta d-flex justify-content-between align-items-center mb-0">
                <div class="entry-author">
                  <p class="mb-0">${days ? `${days} günlük tur` : ''}</p>
                </div>
                <div class="entry-price text-end">
                </div>
              </div>

              <h5 class="mb-1">
                <a href="${detailUrl}">${title}</a>
              </h5>
              ${shipName ? `<p class="text-muted mb-1"><i class="fa fa-ship"></i> ${shipName}</p>` : ''}

              <p class="border-b pb-2 mb-2">
                ${places}
              </p>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', cardHtml);
    });

  } catch (err) {
    console.error('Turlar yüklenirken hata:', err);
    container.innerHTML =
      `<p>Şu anda ${country} turları yüklenemiyor.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadTours);
