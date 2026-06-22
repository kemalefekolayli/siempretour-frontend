// ===============================================================
// SIEMPRE TOUR - Tur Arama Sonuçları
// tur-sonuclari.html için: kategori + özel gün + (opsiyonel) lokasyon
// filtreleriyle /api/tours/filter endpoint'inden tur listeler.
// Backend sayfa boyutunu max 30 ile sınırlar -> "Daha fazla göster" ile sayfalama.
// ===============================================================
document.addEventListener('DOMContentLoaded', function () {
  var grid = document.getElementById('searchResults');
  if (!grid) return;

  var locInput = document.getElementById('filterLocation');
  var catSelect = document.getElementById('filterCategory');
  var eventSelect = document.getElementById('filterEvent');
  var searchBtn = document.getElementById('searchBtn');
  var heading = document.getElementById('resultsHeading');
  var emptyBox = document.getElementById('resultsEmpty');
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  var loadMoreBtn = document.getElementById('loadMoreBtn');

  var PAGE_SIZE = 30;

  var params = new URLSearchParams(window.location.search);
  var state = {
    destination: params.get('destination') || '',
    category: params.get('category') || '',
    event: params.get('event') || ''
  };

  // Sorgu durumu
  var page = 0;
  var totalElements = 0;
  var totalPages = 0;
  var busy = false;

  function lang() {
    return typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
  }

  function isEn() {
    return lang() === 'en';
  }

  function uiText(tr, en) {
    return isEn() ? en : tr;
  }

  function resolveAssetUrl(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
      ? window.AssetCdn.resolve(url)
      : url;
  }

  function isShipCategory(category) {
    return category === 'Ship/Cruise' || category === 'CRUISE' || category === 'Ship';
  }

  function backendCategory(category) {
    if (!category) return '';
    return isShipCategory(category) && isEn() ? 'Ship' : category;
  }

  // --- Kontrolleri URL'den doldur ---
  if (catSelect) catSelect.value = state.category;
  if (eventSelect) eventSelect.value = state.event;
  if (locInput && state.destination) {
    locInput.value = (typeof countryTrName === 'function') ? countryTrName(state.destination) : state.destination;
    locInput.dataset.countryKey = state.destination;
  }

  // --- Lokasyon autocomplete ---
  if (locInput && typeof initLocationAutocomplete === 'function') {
    initLocationAutocomplete(locInput, function (key) {
      state.destination = key || '';
      runSearch();
    });
    locInput.addEventListener('input', function () {
      if (!locInput.value.trim()) { state.destination = ''; }
    });
  }

  if (catSelect) catSelect.addEventListener('change', function () { state.category = this.value; runSearch(); });
  if (eventSelect) eventSelect.addEventListener('change', function () { state.event = this.value; runSearch(); });
  if (searchBtn) searchBtn.addEventListener('click', function (e) { e.preventDefault(); commitLocationText(); runSearch(); });
  if (locInput) locInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); commitLocationText(); runSearch(); }
  });
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', function (e) { e.preventDefault(); loadMore(); });

  function commitLocationText() {
    if (!locInput) return;
    var typed = locInput.value.trim();
    if (!typed) { state.destination = ''; return; }
    if (locInput.dataset.countryKey) { state.destination = locInput.dataset.countryKey; return; }
    var key = (typeof resolveCountryKey === 'function') ? resolveCountryKey(typed) : null;
    state.destination = key || '';
  }

  function syncUrl() {
    var p = new URLSearchParams();
    if (state.destination) p.set('destination', state.destination);
    if (state.category) p.set('category', state.category);
    if (state.event) p.set('event', state.event);
    var selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : lang();
    if (selectedLang !== 'tr') p.set('lang', selectedLang);
    var qs = p.toString();
    history.replaceState(null, '', qs ? ('?' + qs) : window.location.pathname);
  }

  function detailUrl(tour) {
    if (!tour.slug || !tour.destination) return '#';
    var url = 'template_tour_page.html?id=' + encodeURIComponent(tour.slug) +
      '&country=' + encodeURIComponent(tour.destination);
    var selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : '';
    var detailLang = selectedLang && selectedLang !== 'tr' ? selectedLang : (tour.language || lang());
    if (detailLang !== 'tr') url += '&lang=' + encodeURIComponent(detailLang);
    return url;
  }

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function cardHtml(tour) {
    var image = resolveAssetUrl(tour.image1 || tour.mainPhoto || '');
    var alt = tour.imagealt || tour.tourName || 'Tour image';
    var days = tour.durationDays || '';
    var title = tour.tourName || '';
    var places = tour.placesVisited || '';
    var shipName = tour.shipName || '';
    var destTr = (typeof countryTrName === 'function' && tour.destination) ? countryTrName(tour.destination) : (tour.destination || '');
    var url = detailUrl(tour);
    return '' +
      '<div class="tour-card col-lg-4 col-md-6 mb-4">' +
        '<div class="pb-4 mb-0">' +
          '<div class="ratio ratio-16x9 overflow-hidden">' +
            (image ? '<img class="hover-zoom" src="' + esc(image) + '" alt="' + esc(alt) + '">' : '') +
            '<div class="color-overlay"></div>' +
          '</div>' +
          '<div class="trend-content p-0 pt-2 position-relative">' +
            '<div class="entry-meta d-flex justify-content-between align-items-center mb-0">' +
              '<div class="entry-author"><p class="mb-0">' + (days ? (isEn() ? esc(days) + '-day tour' : esc(days) + ' günlük tur') : '') + '</p></div>' +
              (destTr ? '<div class="entry-price text-end"><p class="mb-0"><i class="fa fa-map-marker-alt"></i> ' + esc(destTr) + '</p></div>' : '') +
            '</div>' +
            '<h5 class="mb-1"><a href="' + url + '">' + esc(title) + '</a></h5>' +
            (shipName ? '<p class="text-muted mb-1"><i class="fa fa-ship"></i> ' + esc(shipName) + '</p>' : '') +
            '<p class="border-b pb-2 mb-2">' + esc(places) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function setHeading() {
    if (!heading) return;
    var parts = [];
    if (state.category && catSelect) {
      var co = catSelect.options[catSelect.selectedIndex];
      if (co && co.value) parts.push(co.textContent.trim());
    }
    if (state.event && eventSelect) {
      var eo = eventSelect.options[eventSelect.selectedIndex];
      if (eo && eo.value) parts.push(eo.textContent.trim());
    }
    if (state.destination && typeof countryTrName === 'function') parts.push(countryTrName(state.destination));
    var label = parts.length ? (parts.join(' · ') + ' - ') : '';
    heading.textContent = label + totalElements + uiText(' tur bulundu', ' tours found');
  }

  function buildDto() {
    var dto = { language: lang(), isActive: true };
    if (state.category) dto.category = backendCategory(state.category);   // backend display adı veya enum adını kabul eder
    if (state.event) dto.eventType = state.event;        // enum adı (örn. YILBASI)
    if (state.destination) dto.destination = state.destination;
    return dto;
  }

  function updateLoadMore() {
    if (!loadMoreWrap) return;
    var hasMore = (page + 1) < totalPages;
    loadMoreWrap.style.display = hasMore ? 'block' : 'none';
  }

  async function fetchPage(targetPage, append) {
    if (busy) return;
    busy = true;
    if (loadMoreBtn) loadMoreBtn.disabled = true;

    if (!append) {
      grid.innerHTML = '<div class="col-12 text-center py-5"><p>' + uiText('Turlar yükleniyor...', 'Loading tours...') + '</p></div>';
      if (emptyBox) emptyBox.style.display = 'none';
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    }

    try {
      var res = await ApiService.filterTours(buildDto(), targetPage, PAGE_SIZE);
      var tours = (res && Array.isArray(res.content)) ? res.content : [];
      totalElements = (res && typeof res.totalElements === 'number') ? res.totalElements : tours.length;
      totalPages = (res && typeof res.totalPages === 'number') ? res.totalPages : 1;
      page = targetPage;

      if (!append) grid.innerHTML = '';

      if (!tours.length && !append) {
        setHeading();
        if (emptyBox) emptyBox.style.display = 'block';
        return;
      }

      grid.insertAdjacentHTML('beforeend', tours.map(cardHtml).join(''));
      setHeading();
      updateLoadMore();
    } catch (err) {
      console.error('Arama hatası:', err);
      if (!append) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p>' + uiText('Sonuçlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.', 'There was an error loading results. Please try again.') + '</p></div>';
        if (heading) heading.textContent = '';
      }
    } finally {
      busy = false;
      if (loadMoreBtn) loadMoreBtn.disabled = false;
    }
  }

  function runSearch() {
    syncUrl();
    fetchPage(0, false);
  }

  function loadMore() {
    fetchPage(page + 1, true);
  }

  runSearch();
});
