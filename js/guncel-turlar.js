// guncel-turlar.js — Admin panelinden girilen güncel turlar; filtre yok, 3'lü büyük kartlar.
// Gidilecek yerler kart altında değil, fotoğrafın üzerine gelince kararan katmanda gösterilir.

(function () {
  var allTours = [];
  var loaded = false;
  var PAGE_SIZE = 30;
  var FALLBACK_IMAGE = 'images/cruise/cruise-banner.jpg';
  var durationSortMode = null; // null | 'asc' | 'desc'

  // Gemi turları ("Ship/Cruise" ve "Ship" kategorileri) ayrı grup olarak en sonda gelir.
  function isCruiseTour(tour) {
    var c = String((tour && tour.category) || '').toUpperCase();
    return c === 'SHIP/CRUISE' || c === 'CRUISE' || c === 'SHIP';
  }

  // Önce gemi dışı turlar, sonra gemi turları. Her grubun içinde sıralama aynı:
  // varsayılan en yakın kalkış tarihi önde, Artan/Azalan aktifse gün sayısına göre.
  function compareTours(a, b) {
    var aCruise = isCruiseTour(a);
    var bCruise = isCruiseTour(b);
    if (aCruise !== bCruise) return aCruise ? 1 : -1;

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

  // Dates on one line: the first MAX_VISIBLE_DATES as badges, the rest as "+N"
  // (all dates listed in its tooltip).
  var MAX_VISIBLE_DATES = 2;
  function compactDatesHtml(tour) {
    var fmt = window.TourCardFormat;
    if (!fmt) return '';
    var list = fmt.departures(tour).map(function (d) { return fmt.fmtDate(d.departureDate); });
    if (!list.length && tour.startDate) list = [fmt.fmtDate(tour.startDate)];
    if (!list.length) return '';
    var shown = list.slice(0, MAX_VISIBLE_DATES).map(function (d) {
      return '<span class="tour-date-badge">' + escapeHtml(d) + '</span>';
    }).join('');
    var rest = list.length - MAX_VISIBLE_DATES;
    if (rest > 0) {
      shown += '<span class="tour-date-badge ct-card__more" title="' + escapeHtml(list.join(', ')) + '">+' + rest + '</span>';
    }
    return '<span class="ct-card__dates">' + shown + '</span>';
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
      var datesHtml = compactDatesHtml(tour);

      // Below the photo only two lines: (1) days + countries, (2) price + dates.
      // Tour name and places visited live in the hover overlay on the photo.
      html +=
        '<div class="tour-card ct-card col-lg-4 col-md-6 mb-4">' +
          '<a class="ct-card__media ratio ratio-4x3" href="' + detailUrl + '" aria-label="' + title + '">' +
            '<img src="' + (image || FALLBACK_IMAGE) + '" alt="' + alt + '" loading="lazy" ' +
              'onerror="this.onerror=null;this.src=\'' + FALLBACK_IMAGE + '\'">' +
            '<div class="ct-card__overlay">' +
              '<h5 class="ct-card__title">' + title + '</h5>' +
              (shipName ? '<div class="ct-card__ship"><i class="fa fa-ship"></i> ' + shipName + '</div>' : '') +
              (places ? '<p class="ct-card__places">' + places + '</p>' : '') +
            '</div>' +
          '</a>' +
          '<div class="ct-card__info">' +
            '<div class="ct-card__row">' +
              '<span class="ct-card__days">' + (days ? (isEn() ? days + '-day tour' : days + ' günlük tur') : '') + '</span>' +
              (destTr ? '<span class="ct-card__dest"><i class="icon-location-pin"></i> ' + destTr + '</span>' : '') +
            '</div>' +
            '<div class="ct-card__row">' + priceHtml + datesHtml + '</div>' +
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
