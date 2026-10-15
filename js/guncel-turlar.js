// guncel-turlar.js — Admin panelinden girilen güncel turlar; filtre yok, 3'lü büyük kartlar.
// Gidilecek yerler kart altında değil, fotoğrafın üzerine gelince kararan katmanda gösterilir.

(function () {
  var allTours = [];
  var loaded = false;
  var PAGE_SIZE = 30;
  var FALLBACK_IMAGE = 'images/cruise/cruise-banner.jpg';
  var durationSortMode = null; // null | 'asc' | 'desc'

  // Varsayılan: en yakın kalkış tarihi önde. Artan/Azalan aktifse gün sayısına göre.
  function compareTours(a, b) {
    var da = parseInt(a && a.durationDays, 10) || 0;
    var db = parseInt(b && b.durationDays, 10) || 0;
    if (durationSortMode === 'asc') return da - db;
    if (durationSortMode === 'desc') return db - da;

    var fmt = window.TourCardFormat;
    var ea = fmt ? fmt.earliestUpcomingDeparture(a) : null;
    var eb = fmt ? fmt.earliestUpcomingDeparture(b) : null;
    if (!ea && !eb) return 0;
    if (!ea) return 1;
    if (!eb) return -1;
    return ea - eb;
  }

  function sortTours(list) {
    return (list || []).slice().sort(compareTours);
  }

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

  function makeDetailUrl(tour) {
    if (!tour.slug || !tour.destination) return '#';
    var url = 'template_tour_page.html?id=' + encodeURIComponent(tour.slug) +
      '&country=' + encodeURIComponent(tour.destination);
    var selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : '';
    var detailLang = selectedLang && selectedLang !== 'tr' ? selectedLang : (tour.language || getLang());
    if (detailLang !== 'tr') url += '&lang=' + encodeURIComponent(detailLang);
    return url;
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
        (isEn() ? 'No current tours right now.' : 'Şu anda güncel tur bulunmuyor.') +
        '</p></div>';
      if (countEl) countEl.textContent = loaded ? (isEn() ? '0 tours' : '0 tur') : '';
      return;
    }

    if (countEl) {
      countEl.textContent = isEn() ? tours.length + ' tours found' : tours.length + ' tur bulundu';
    }

    var html = '';
    tours.forEach(function (tour) {
      var image = resolveAssetUrl(tour.image1 || tour.mainPhoto || '');
      var alt = escapeHtml(tour.imagealt || tour.tourName || tour.name || 'Tour image');
      var days = tour.durationDays || tour.duration || '';
      var title = escapeHtml(tour.tourName || tour.name || '');
      var places = escapeHtml(tour.placesVisited || '');
      var shipName = escapeHtml(tour.shipName || '');
      var destTr = escapeHtml(window.TourCardFormat ? window.TourCardFormat.destinationLabel(tour) : (tour.destination || ''));
      var detailUrl = makeDetailUrl(tour);
      var priceHtml = window.TourCardFormat ? window.TourCardFormat.priceHtml(tour, isEn()) : '';
      var datesHtml = window.TourCardFormat ? window.TourCardFormat.datesHtml(tour, isEn()) : '';

      html +=
        '<div class="tour-card ct-card col-lg-4 col-md-6 mb-4">' +
          '<div class="pb-4 mb-0">' +
            '<a class="ct-card__media ratio ratio-4x3" href="' + detailUrl + '" aria-label="' + title + '">' +
              '<img src="' + (image || FALLBACK_IMAGE) + '" alt="' + alt + '" loading="lazy" ' +
                'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'">' +
              (places ? '<div class="ct-card__overlay"><span>' + places + '</span></div>' : '') +
            '</a>' +
            '<div class="trend-content p-0 pt-3 position-relative">' +
              '<div class="entry-meta d-flex justify-content-between align-items-center mb-1">' +
                '<div class="entry-author"><p class="mb-0">' +
                  (days ? (isEn() ? days + '-day tour' : days + ' günlük tur') : '') +
                '</p></div>' +
                (destTr ? '<div class="entry-destination text-end"><p class="mb-0"><i class="icon-location-pin"></i> ' + destTr + '</p></div>' : '') +
              '</div>' +
              '<h5 class="mb-2"><a href="' + detailUrl + '">' + title + '</a></h5>' +
              (shipName ? '<p class="text-muted mb-1"><i class="fa fa-ship"></i> ' + shipName + '</p>' : '') +
              priceHtml +
              datesHtml +
            '</div>' +
          '</div>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  function rerender() {
    if (loaded) renderCards(sortTours(allTours));
  }

  // ---------------------------------------------------------------------------
  // Data fetch (all admin-entered tours)
  // ---------------------------------------------------------------------------
  function fetchPage(filter, page) {
    return ApiService.filterTours(filter, page, PAGE_SIZE).then(function (resp) {
      if (Array.isArray(resp)) return { content: resp, totalPages: 1 };
      return resp || { content: [], totalPages: 1 };
    });
  }

  function fetchAllTours() {
    var lang = getLang();
    return fetchAllToursForLang(lang).then(function (tours) {
      if (tours.length || lang === 'tr') return tours;
      return fetchAllToursForLang('tr');
    });
  }

  function fetchAllToursForLang(lang) {
    var filter = { adminOnly: true, language: lang };
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

  function showError() {
    var container = document.getElementById('cruiseCards');
    if (!container) return;
    container.innerHTML = '<div class="col-12 text-center py-5">' +
      '<p>' + (isEn() ? 'Tours are not available right now.' : 'Turlar şu anda yüklenemiyor.') + '</p></div>';
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------
  function init() {
    fetchAllTours()
      .then(function (tours) {
        allTours = tours || [];
        loaded = true;
        rerender();
      })
      .catch(function (err) {
        console.error('Güncel turlar yüklenirken hata:', err);
        showError();
      });

    var sortAscBtn = document.getElementById('durationSortAsc');
    var sortDescBtn = document.getElementById('durationSortDesc');
    function setMode(mode) {
      durationSortMode = durationSortMode === mode ? null : mode;
      if (sortAscBtn) sortAscBtn.classList.toggle('active', durationSortMode === 'asc');
      if (sortDescBtn) sortDescBtn.classList.toggle('active', durationSortMode === 'desc');
      rerender();
    }
    if (sortAscBtn) sortAscBtn.addEventListener('click', function () { setMode('asc'); });
    if (sortDescBtn) sortDescBtn.addEventListener('click', function () { setMode('desc'); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
