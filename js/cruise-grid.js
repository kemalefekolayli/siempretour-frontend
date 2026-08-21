// cruise-grid.js — Cruise tours with sidebar filters (country, ship name, season, date)
// Layout mirrors the normal tours grid page. No company filter (per product spec).

(function () {
  var debounceTimer = null;
  var allCruises = [];
  var loaded = false;
  var PAGE_SIZE = 30;
  var FALLBACK_IMAGE = 'images/cruise/cruise-banner.jpg';

  function getLang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function isEn() {
    return getLang() === 'en';
  }

  function resolveAssetUrl(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
      ? window.AssetCdn.resolve(url)
      : url;
  }

  function trName(country) {
    return typeof countryNameTr === 'function' ? countryNameTr(country) : country;
  }

  function cruiseCategoryForLang(lang) {
    return lang === 'en' ? 'Ship' : 'CRUISE';
  }

  function makeDetailUrl(tour) {
    if (!tour.slug || !tour.destination) return '#';
    var url = 'template_tour_page.html?id=' + encodeURIComponent(tour.slug) +
      '&country=' + encodeURIComponent(tour.destination);
    var selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : '';
    var detailLang = selectedLang && selectedLang !== 'tr' ? selectedLang : (tour.language || getLang());
    if (detailLang !== 'tr') url += '&lang=' + encodeURIComponent(detailLang);
    return url;
  }

  function normalize(str) {
    return (str == null ? '' : String(str)).toLowerCase().trim();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function renderCards(tours) {
    var container = document.getElementById('cruiseCards');
    var countEl = document.getElementById('cruiseCount');
    if (!container) return;

    if (!tours || tours.length === 0) {
      container.innerHTML = '<div class="col-12 text-center py-5"><p>' +
        (isEn() ? 'No cruise tours match your criteria.' : 'Aradığınız kriterlere uygun gemi turu bulunamadı.') +
        '</p></div>';
      if (countEl) countEl.textContent = loaded ? (isEn() ? '0 results' : '0 sonuç') : '';
      return;
    }

    if (countEl) {
      countEl.textContent = isEn()
        ? tours.length + ' cruise tours found'
        : tours.length + ' gemi turu bulundu';
    }

    var html = '';
    tours.forEach(function (tour) {
      var image = resolveAssetUrl(tour.image1 || tour.mainPhoto || '');
      var alt = escapeHtml(tour.imagealt || tour.tourName || tour.name || 'Tour image');
      var days = tour.durationDays || tour.duration || '';
      var title = escapeHtml(tour.tourName || tour.name || '');
      var places = escapeHtml(tour.placesVisited || '');
      var shipName = escapeHtml(tour.shipName || '');
      var destTr = escapeHtml(trName(tour.destination || ''));
      var detailUrl = makeDetailUrl(tour);
      var priceHtml = window.TourCardFormat ? window.TourCardFormat.priceHtml(tour, isEn()) : '';
      var datesHtml = window.TourCardFormat ? window.TourCardFormat.datesHtml(tour, isEn()) : '';

      html +=
        '<div class="tour-card col-lg-6 col-md-6 mb-4">' +
          '<div class="pb-4 mb-0">' +
            '<div class="ratio ratio-16x9 overflow-hidden">' +
              '<img class="hover-zoom" src="' + (image || FALLBACK_IMAGE) + '" alt="' + alt + '" loading="lazy" ' +
                'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'">' +
              '<div class="color-overlay"></div>' +
            '</div>' +
            '<div class="trend-content p-0 pt-2 position-relative">' +
              '<div class="entry-meta d-flex justify-content-between align-items-center mb-0">' +
                '<div class="entry-author"><p class="mb-0">' +
                  (days ? (isEn() ? days + '-day tour' : days + ' günlük tur') : '') +
                '</p></div>' +
                (destTr ? '<div class="entry-destination text-end"><p class="mb-0"><i class="icon-location-pin"></i> ' + destTr + '</p></div>' : '') +
              '</div>' +
              '<h5 class="mb-1"><a href="' + detailUrl + '">' + title + '</a></h5>' +
              (shipName ? '<p class="text-muted mb-1"><i class="fa fa-ship"></i> ' + shipName + '</p>' : '') +
              priceHtml +
              '<p class="border-b pb-2 mb-2">' + places + '</p>' +
              datesHtml +
            '</div>' +
          '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // Combobox option lists (datalists built from loaded cruise data)
  // ---------------------------------------------------------------------------
  function fillDatalist(id, values) {
    var dl = document.getElementById(id);
    if (!dl) return;
    dl.innerHTML = values
      .sort(function (a, b) { return a.localeCompare(b, 'tr'); })
      .map(function (v) { return '<option value="' + escapeHtml(v) + '"></option>'; })
      .join('');
  }

  function buildFilterOptions() {
    var countrySet = {};
    var shipSet = {};
    allCruises.forEach(function (t) {
      var d = (t.destination || '').trim();
      if (d) countrySet[trName(d)] = true;
      var s = (t.shipName || '').trim();
      if (s) shipSet[s] = true;
    });
    fillDatalist('countryOptions', Object.keys(countrySet));
    fillDatalist('shipOptions', Object.keys(shipSet));
    populateDurationOptions();
  }

  function populateDurationOptions() {
    var sel = document.getElementById('durationFilterSelect');
    if (!sel) return;
    var seen = {};
    var days = [];
    allCruises.forEach(function (t) {
      var n = parseInt(t.durationDays, 10);
      if (n > 0 && !seen[n]) { seen[n] = true; days.push(n); }
    });
    days.sort(function (a, b) { return a - b; });
    var prev = sel.value;
    var html = '<option value="">' + (isEn() ? 'All' : 'Tümü') + '</option>';
    html += days.map(function (n) {
      return '<option value="' + n + '">' + n + ' ' +
        (isEn() ? (n === 1 ? 'day' : 'days') : 'gün') + '</option>';
    }).join('');
    sel.innerHTML = html;
    if (prev && seen[parseInt(prev, 10)]) sel.value = prev;
  }

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------
  function countryQuery() {
    var el = document.getElementById('countrySearch');
    return normalize(el ? el.value : '');
  }

  function countryMatches(tour, q) {
    if (!q) return true;
    return normalize(trName(tour.destination)).indexOf(q) !== -1 ||
      normalize(tour.destination).indexOf(q) !== -1;
  }

  function shipHaystack(tour) {
    return normalize((tour.shipName || '') + ' ' + (tour.tourName || tour.name || ''));
  }

  function matchesDate(tour, filterFrom, filterTo) {
    if (!filterFrom && !filterTo) return true;
    var tourStart = tour.startDate ? new Date(tour.startDate.substring(0, 10)) : null;
    var tourEnd = tour.endDate ? new Date(tour.endDate.substring(0, 10)) : null;
    if (!tourStart && !tourEnd) return false;
    var effStart = tourStart || tourEnd;
    var effEnd = tourEnd || tourStart;
    if (filterFrom && effEnd < filterFrom) return false;
    if (filterTo && effStart > filterTo) return false;
    return true;
  }

  function applyFilters() {
    if (!loaded) return;

    var shipEl = document.getElementById('shipSearch');
    var eventEl = document.getElementById('eventFilterSelect');
    var durationEl = document.getElementById('durationFilterSelect');
    var startEl = document.getElementById('dateFilterStart');
    var endEl = document.getElementById('dateFilterEnd');

    var shipQ = normalize(shipEl ? shipEl.value : '');
    var eventQ = normalize(eventEl ? eventEl.value : '');
    var durationQ = durationEl && durationEl.value ? parseInt(durationEl.value, 10) : null;
    var countryQ = countryQuery();
    var filterFrom = startEl && startEl.value ? new Date(startEl.value) : null;
    var filterTo = endEl && endEl.value ? new Date(endEl.value) : null;

    var filtered = allCruises.filter(function (t) {
      if (!countryMatches(t, countryQ)) return false;
      if (shipQ && shipHaystack(t).indexOf(shipQ) === -1) return false;
      if (eventQ && normalize(t.eventType) !== eventQ) return false;
      if (durationQ && parseInt(t.durationDays, 10) !== durationQ) return false;
      if (!matchesDate(t, filterFrom, filterTo)) return false;
      return true;
    });

    renderCards(filtered);
  }

  function debouncedApply() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyFilters, 250);
  }

  // ---------------------------------------------------------------------------
  // Data fetch (all cruise tours across destinations)
  // ---------------------------------------------------------------------------
  function fetchPage(filter, page) {
    return ApiService.filterTours(filter, page, PAGE_SIZE).then(function (resp) {
      if (Array.isArray(resp)) return { content: resp, totalPages: 1 };
      return resp || { content: [], totalPages: 1 };
    });
  }

  function fetchAllCruises() {
    var lang = getLang();
    return fetchAllCruisesForLang(lang).then(function (tours) {
      if (tours.length || lang === 'tr') return tours;
      return fetchAllCruisesForLang('tr');
    });
  }

  function fetchAllCruisesForLang(lang) {
    var filter = { category: cruiseCategoryForLang(lang), language: lang };
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
      '<span class="visually-hidden">' + (isEn() ? 'Loading...' : 'Yükleniyor...') + '</span></div>' +
      '<p class="mt-2">' + (isEn() ? 'Loading cruise tours...' : 'Gemi turları yükleniyor...') + '</p></div>';
  }

  function showError() {
    var container = document.getElementById('cruiseCards');
    if (!container) return;
    container.innerHTML = '<div class="col-12 text-center py-5">' +
      '<p>' + (isEn() ? 'Cruise tours are not available right now.' : 'Gemi turları şu anda yüklenemiyor.') + '</p></div>';
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init() {
    showLoading();

    fetchAllCruises()
      .then(function (tours) {
        allCruises = tours || [];
        loaded = true;
        buildFilterOptions();
        renderCards(allCruises);
      })
      .catch(function (err) {
        console.error('Gemi turları yüklenirken hata:', err);
        showError();
      });

    var country = document.getElementById('countrySearch');
    var ship = document.getElementById('shipSearch');
    var eventSel = document.getElementById('eventFilterSelect');
    var durationSel = document.getElementById('durationFilterSelect');
    var startEl = document.getElementById('dateFilterStart');
    var endEl = document.getElementById('dateFilterEnd');
    var dateClear = document.getElementById('dateFilterClear');
    var clearAll = document.getElementById('clearCruiseFilters');

    if (country) country.addEventListener('input', debouncedApply);
    if (ship) ship.addEventListener('input', debouncedApply);
    if (eventSel) eventSel.addEventListener('change', applyFilters);
    if (durationSel) durationSel.addEventListener('change', applyFilters);
    if (startEl) startEl.addEventListener('change', applyFilters);
    if (endEl) endEl.addEventListener('change', applyFilters);
    if (dateClear) {
      dateClear.addEventListener('click', function () {
        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
        applyFilters();
      });
    }
    if (clearAll) {
      clearAll.addEventListener('click', function () {
        if (country) country.value = '';
        if (ship) ship.value = '';
        if (eventSel) eventSel.value = '';
        if (durationSel) durationSel.value = '';
        if (startEl) startEl.value = '';
        if (endEl) endEl.value = '';
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
