// cruise-grid.js — Cruise tours with ship name + cruise company filtering (client-side)

(function () {
  var debounceTimer = null;
  var allCruises = [];
  var loaded = false;
  var PAGE_SIZE = 30;

  function getLang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function makeDetailUrl(tour) {
    if (!tour.slug || !tour.destination) return '#';
    return 'template_tour_page.html?id=' + encodeURIComponent(tour.slug) +
      '&country=' + encodeURIComponent(tour.destination);
  }

  function normalize(str) {
    return (str == null ? '' : String(str)).toLowerCase();
  }

  function renderCards(tours) {
    var container = document.getElementById('cruiseCards');
    var countEl = document.getElementById('cruiseCount');
    if (!container) return;

    if (!tours || tours.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p>Aradığınız kriterlere uygun gemi turu bulunamadı.</p></div>';
      if (countEl) countEl.textContent = loaded ? '0 sonuç' : '';
      return;
    }

    if (countEl) countEl.textContent = tours.length + ' gemi turu bulundu';

    container.innerHTML = '';
    tours.forEach(function (tour) {
      var image = tour.image1 || tour.mainPhoto || '';
      var alt = tour.imagealt || tour.tourName || tour.name || 'Tour image';
      var days = tour.durationDays || tour.duration || '';
      var title = tour.tourName || tour.name || '';
      var places = tour.placesVisited || '';
      var shipName = tour.shipName || '';
      var shipCompany = tour.shipCompany || '';
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
        (shipCompany ? '<p class="text-muted mb-1"><i class="fa fa-anchor"></i> ' + shipCompany + '</p>' : '') +
        '<p class="border-b pb-2 mb-2">' + places + '</p>' +
        '</div></div></div>';

      container.insertAdjacentHTML('beforeend', card);
    });
  }

  function shipHaystack(tour) {
    return normalize(
      (tour.shipName || '') + ' ' +
      (tour.tourName || tour.name || '')
    );
  }

  function companyHaystack(tour) {
    return normalize(
      (tour.shipCompany || '') + ' ' +
      (tour.tourName || tour.name || '') + ' ' +
      (tour.generalInfo || '')
    );
  }

  function applyFilters() {
    if (!loaded) return;
    var shipEl = document.getElementById('shipSearch');
    var companyEl = document.getElementById('companySearch');
    var shipQ = normalize(shipEl ? shipEl.value.trim() : '');
    var companyQ = normalize(companyEl ? companyEl.value.trim() : '');

    if (!shipQ && !companyQ) {
      renderCards(allCruises);
      return;
    }

    var filtered = allCruises.filter(function (t) {
      if (shipQ && shipHaystack(t).indexOf(shipQ) === -1) return false;
      if (companyQ && companyHaystack(t).indexOf(companyQ) === -1) return false;
      return true;
    });
    renderCards(filtered);
  }

  function fetchPage(filter, page) {
    return ApiService.filterTours(filter, page, PAGE_SIZE).then(function (resp) {
      if (Array.isArray(resp)) return { content: resp, totalPages: 1 };
      return resp || { content: [], totalPages: 1 };
    });
  }

  function fetchAllCruises() {
    var lang = getLang();
    var filter = { category: 'CRUISE', language: lang };
    return fetchPage(filter, 0).then(function (firstPage) {
      var tours = (firstPage.content || []).slice();
      var totalPages = firstPage.totalPages || 1;
      if (totalPages <= 1) return tours;
      var promises = [];
      for (var p = 1; p < totalPages; p++) promises.push(fetchPage(filter, p));
      return Promise.all(promises).then(function (pages) {
        pages.forEach(function (pg) { tours = tours.concat(pg.content || []); });
        return tours;
      });
    });
  }

  function showLoading() {
    var container = document.getElementById('cruiseCards');
    if (!container) return;
    container.innerHTML = '<div class="col-12 text-center py-5">' +
      '<div class="spinner-border text-primary" role="status">' +
      '<span class="visually-hidden">Yükleniyor...</span></div>' +
      '<p class="mt-2">Gemi turları yükleniyor...</p></div>';
  }

  function showError() {
    var container = document.getElementById('cruiseCards');
    if (!container) return;
    container.innerHTML = '<div class="col-12 text-center py-5">' +
      '<p>Gemi turları şu anda yüklenemiyor.</p></div>';
  }

  function debouncedApply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 250);
  }

  function init() {
    showLoading();

    fetchAllCruises()
      .then(function (tours) {
        allCruises = tours || [];
        loaded = true;
        renderCards(allCruises);
      })
      .catch(function (err) {
        console.error('Gemi turları yüklenirken hata:', err);
        showError();
      });

    var ship = document.getElementById('shipSearch');
    var company = document.getElementById('companySearch');
    var clearBtn = document.getElementById('clearCruiseFilters');

    if (ship) ship.addEventListener('input', debouncedApply);
    if (company) company.addEventListener('input', debouncedApply);
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (ship) ship.value = '';
        if (company) company.value = '';
        applyFilters();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
