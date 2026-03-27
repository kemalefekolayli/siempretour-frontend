// cruise-grid.js — Dynamic cruise tour loading with ship name search

(function () {
  var debounceTimer = null;

  function getLang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function makeDetailUrl(tour) {
    if (!tour.slug || !tour.destination) return '#';
    return 'template_tour_page.html?id=' + encodeURIComponent(tour.slug) +
      '&country=' + encodeURIComponent(tour.destination);
  }

  function renderCards(tours) {
    var container = document.getElementById('cruiseCards');
    var countEl = document.getElementById('cruiseCount');
    if (!container) return;

    if (!tours || tours.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p>Gemi turu bulunamadı.</p></div>';
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) countEl.textContent = tours.length + ' gemi turu bulundu';

    container.innerHTML = '';
    tours.forEach(function (tour) {
      var image = tour.image1 || tour.mainPhoto || '';
      var alt = tour.imagealt || tour.tourName || 'Tour image';
      var days = tour.durationDays || tour.duration || '';
      var title = tour.tourName || tour.name || '';
      var places = tour.placesVisited || '';
      var shipName = tour.shipName || '';
      var destination = tour.destination || '';
      var destTr = typeof countryNameTr === 'function' ? countryNameTr(destination) : destination;
      var detailUrl = makeDetailUrl(tour);

      var card = '<div class="tour-card col-lg-4 col-md-6 mb-4">' +
        '<div class="pb-4 mb-0">' +
        '<div class="ratio ratio-16x9 overflow-hidden">' +
        (image ? '<img class="hover-zoom" src="' + image + '" alt="' + alt + '">' : '') +
        '<div class="color-overlay"></div>' +
        '</div>' +
        '<div class="trend-content p-0 pt-2 position-relative">' +
        '<div class="entry-meta d-flex justify-content-between align-items-center mb-0">' +
        '<div class="entry-author">' +
        '<p class="mb-0">' + (days ? days + ' günlük tur' : '') + '</p>' +
        '</div>' +
        '<div class="entry-destination text-end">' +
        '<p class="mb-0"><i class="icon-location-pin"></i> ' + destTr + '</p>' +
        '</div>' +
        '</div>' +
        '<h5 class="mb-1"><a href="' + detailUrl + '">' + title + '</a></h5>' +
        (shipName ? '<p class="text-muted mb-1"><i class="fa fa-ship"></i> ' + shipName + '</p>' : '') +
        '<p class="border-b pb-2 mb-2">' + places + '</p>' +
        '</div></div></div>';

      container.insertAdjacentHTML('beforeend', card);
    });
  }

  function loadCruiseTours(shipNameQuery) {
    var container = document.getElementById('cruiseCards');
    if (!container) return;

    container.innerHTML = '<div class="col-12 text-center py-5">' +
      '<div class="spinner-border text-primary" role="status">' +
      '<span class="visually-hidden">Yükleniyor...</span></div>' +
      '<p class="mt-2">Gemi turları yükleniyor...</p></div>';

    var lang = getLang();
    var filter = {
      category: 'CRUISE',
      language: lang
    };

    if (shipNameQuery && shipNameQuery.trim()) {
      filter.shipName = shipNameQuery.trim();
    }

    ApiService.filterTours(filter)
      .then(function (response) {
        // Backend returns PagedResponse with 'content' array
        var tours = Array.isArray(response) ? response : (response.content || []);
        renderCards(tours);
      })
      .catch(function (err) {
        console.error('Gemi turları yüklenirken hata:', err);
        container.innerHTML = '<div class="col-12 text-center py-5">' +
          '<p>Gemi turları şu anda yüklenemiyor.</p></div>';
      });
  }

  function init() {
    loadCruiseTours('');

    var searchInput = document.getElementById('shipSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var val = searchInput.value;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          loadCruiseTours(val);
        }, 400);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
