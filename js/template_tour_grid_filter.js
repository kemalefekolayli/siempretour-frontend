// ===============================
// SIEMPRE TOUR FILTER - SIDEBAR VERSION
// ===============================

document.addEventListener('DOMContentLoaded', function () {

  const params = new URLSearchParams(window.location.search);
  const countryParam = params.get('country');
  const categoryParam = params.get('category');
  const isEn = (typeof getActiveLang === 'function' ? getActiveLang() : (params.get('lang') || 'tr')) === 'en';

  const cardsContainer = document.getElementById('tourCards');
  if (!cardsContainer) return;
  const centeredSidebar = document.querySelector('.sidebar-sticky-center');
  const sidebarColumn = centeredSidebar ? centeredSidebar.parentElement : null;
  const DESKTOP_LEFT_SHIFT = -16;

  const filterCheckboxes = document.querySelectorAll('.sidebar-category1 input[type="checkbox"]');
  const eventSelect = document.getElementById('eventFilterSelect');
  const dateFilterStart = document.getElementById('dateFilterStart');
  const dateFilterEnd = document.getElementById('dateFilterEnd');
  const dateFilterClear = document.getElementById('dateFilterClear');

  let allTours = [];
  let selectedEventType = '';
  let selectedShips = [];

  const normalize = (s) => (s ?? '').toString().trim();
  const isShipCategory = (category) => category === 'Ship/Cruise' || category === 'CRUISE' || category === 'Ship';
  const categoriesMatch = (actual, expected) => {
    if (isShipCategory(actual) && isShipCategory(expected)) return true;
    return normalize(actual) === normalize(expected);
  };

  // Belirli bir kategori URL'sindeyken (Ship/Cruise hariç) kategori bölümünü gizle
  if (categoryParam && !isShipCategory(categoryParam)) {
    const categorySidebarItem = document.querySelector('.sidebar-category1') &&
      document.querySelector('.sidebar-category1').closest('.sidebar-item');
    if (categorySidebarItem) categorySidebarItem.style.display = 'none';
  }

  // ===============================
  // SIDEBAR POSITION
  // ===============================

  function resetCenteredSidebarStyles() {
    if (!centeredSidebar) return;
    centeredSidebar.style.position = '';
    centeredSidebar.style.top = '';
    centeredSidebar.style.left = '';
    centeredSidebar.style.width = '';
    centeredSidebar.style.transform = '';
  }

  function applyDesktopLeftShiftInFlow() {
    if (!centeredSidebar) return;
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      centeredSidebar.style.transform = '';
      return;
    }
    centeredSidebar.style.transform = `translateX(${DESKTOP_LEFT_SHIFT}px)`;
  }

  function updateCenteredSidebarPosition() {
    if (!centeredSidebar || !sidebarColumn) return;
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      resetCenteredSidebarStyles();
      return;
    }
    sidebarColumn.style.position = 'relative';
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const sidebarHeight = centeredSidebar.offsetHeight;
    const fixedTop = Math.round((viewportHeight - sidebarHeight) / 2);
    const columnRect = sidebarColumn.getBoundingClientRect();
    const columnStyles = window.getComputedStyle(sidebarColumn);
    const padLeft = parseFloat(columnStyles.paddingLeft) || 0;
    const padRight = parseFloat(columnStyles.paddingRight) || 0;
    const contentLeft = columnRect.left + padLeft;
    const contentWidth = Math.max(0, columnRect.width - padLeft - padRight);
    const columnTop = window.scrollY + columnRect.top;
    const startScrollY = columnTop - fixedTop;
    const endScrollY = columnTop + sidebarColumn.offsetHeight - sidebarHeight - fixedTop;
    if (endScrollY <= startScrollY) {
      resetCenteredSidebarStyles();
      return;
    }
    if (window.scrollY <= startScrollY) {
      resetCenteredSidebarStyles();
      applyDesktopLeftShiftInFlow();
      return;
    }
    if (window.scrollY >= endScrollY) {
      centeredSidebar.style.position = 'absolute';
      centeredSidebar.style.top = `${Math.max(0, sidebarColumn.offsetHeight - sidebarHeight)}px`;
      centeredSidebar.style.left = `${Math.round(padLeft + DESKTOP_LEFT_SHIFT)}px`;
      centeredSidebar.style.width = `${Math.round(contentWidth)}px`;
      centeredSidebar.style.transform = '';
      return;
    }
    centeredSidebar.style.position = 'fixed';
    centeredSidebar.style.top = `${fixedTop}px`;
    centeredSidebar.style.left = `${Math.round(contentLeft + DESKTOP_LEFT_SHIFT)}px`;
    centeredSidebar.style.width = `${Math.round(contentWidth)}px`;
    centeredSidebar.style.transform = '';
  }

  // ===============================
  // FETCH TOURS
  // ===============================

  async function fetchTours() {
    if (!countryParam) return;
    const country = decodeURIComponent(countryParam);
    const lang = typeof getActiveLang === 'function' ? getActiveLang() : (new URLSearchParams(window.location.search).get('lang') || 'tr');
    try {
      const tours = await ApiService.getToursByDestination(country, lang);
      let all = Array.isArray(tours) ? tours : [];
      if (categoryParam) {
        all = all.filter(t => categoriesMatch(t.category, categoryParam));
      }
      allTours = all;
      if (!categoryParam) updateCategoryCounts();
      requestSidebarPositionUpdate();
    } catch (err) {
      console.error("Filter fetch error:", err);
    }
  }

  // ===============================
  // CATEGORY COUNT
  // ===============================

  function updateCategoryCounts() {
    const categoryCounts = {};
    allTours.forEach(tour => {
      const cat = normalize(tour.category);
      if (!cat) return;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    let visibleCategoryCount = 0;

    filterCheckboxes.forEach(cb => {
      const value = normalize(cb.value);
      const countSpan = cb.parentElement.querySelector('.count');
      const listItem = cb.closest('li');
      const count = categoryCounts[value] || 0;

      if (countSpan) countSpan.textContent = count;

      if (listItem) {
        const hasTours = count > 0;
        listItem.classList.toggle('is-category-empty', !hasTours);
        listItem.hidden = !hasTours;
        listItem.setAttribute('aria-hidden', String(!hasTours));
        listItem.style.setProperty('display', hasTours ? 'flex' : 'none', 'important');
        cb.disabled = !hasTours;
        if (!hasTours) cb.checked = false;
        if (hasTours) visibleCategoryCount += 1;
      }
    });

    const categorySidebarItem = document.querySelector('.sidebar-category1')?.closest('.sidebar-item');
    if (categorySidebarItem) {
      categorySidebarItem.hidden = visibleCategoryCount === 0;
      categorySidebarItem.style.setProperty('display', visibleCategoryCount > 0 ? 'block' : 'none', 'important');
    }
  }

  // ===============================
  // FILTER LOGIC
  // ===============================

  function tourMatchesFilters(tour) {
    // Gemi filtresi (Ship/Cruise modu)
    if (isShipCategory(categoryParam)) {
      const shipOk = selectedShips.length === 0 || selectedShips.includes((tour.shipName || '').trim());
      if (!shipOk) return false;
    } else if (!categoryParam) {
      // Genel mod: kategori checkbox'ları
      const selectedCategories = Array.from(filterCheckboxes).filter(c => c.checked).map(c => normalize(c.value));
      if (selectedCategories.length > 0 && !selectedCategories.includes(normalize(tour.category))) return false;
    }
    // Kategori URL modunda (Safari vb.) allTours zaten filtrelenmiş, ek kontrol yok

    // Etkinlik filtresi
    if (selectedEventType && normalize(tour.eventType) !== selectedEventType) return false;

    // Tarih filtresi
    const filterFrom = dateFilterStart && dateFilterStart.value ? new Date(dateFilterStart.value) : null;
    const filterTo = dateFilterEnd && dateFilterEnd.value ? new Date(dateFilterEnd.value) : null;
    if (filterFrom || filterTo) {
      const tourStart = tour.startDate ? new Date(tour.startDate.substring(0, 10)) : null;
      const tourEnd = tour.endDate ? new Date(tour.endDate.substring(0, 10)) : null;
      if (!tourStart && !tourEnd) return false;
      const effectiveStart = tourStart || tourEnd;
      const effectiveEnd = tourEnd || tourStart;
      if (filterFrom && effectiveEnd < filterFrom) return false;
      if (filterTo && effectiveStart > filterTo) return false;
    }

    return true;
  }

  function applyFilters() {
    const cards = cardsContainer.querySelectorAll('.tour-card');
    cards.forEach((card, index) => {
      const tour = allTours[index];
      if (!tour) return;
      card.style.display = tourMatchesFilters(tour) ? '' : 'none';
    });
  }

  // ===============================
  // EVENT LISTENERS
  // ===============================

  filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  if (eventSelect) {
    eventSelect.addEventListener('change', function () {
      selectedEventType = this.value;
      applyFilters();
    });
  }

  if (dateFilterStart) dateFilterStart.addEventListener('change', applyFilters);
  if (dateFilterEnd) dateFilterEnd.addEventListener('change', applyFilters);
  if (dateFilterClear) dateFilterClear.addEventListener('click', function () {
    if (dateFilterStart) dateFilterStart.value = '';
    if (dateFilterEnd) dateFilterEnd.value = '';
    applyFilters();
  });

  // ===============================
  // INIT
  // ===============================

  let sidebarRafId = 0;
  function requestSidebarPositionUpdate() {
    if (sidebarRafId) return;
    sidebarRafId = window.requestAnimationFrame(() => {
      sidebarRafId = 0;
      updateCenteredSidebarPosition();
    });
  }

  requestSidebarPositionUpdate();
  window.addEventListener('scroll', requestSidebarPositionUpdate, { passive: true });
  window.addEventListener('resize', requestSidebarPositionUpdate);
  window.addEventListener('load', requestSidebarPositionUpdate);

  if (isShipCategory(categoryParam)) {
    initShipFilter();
  } else {
    fetchTours();
  }

  // ===============================
  // GEMİ FİLTRESİ (Ship/Cruise modu)
  // ===============================

  async function initShipFilter() {
    const sidebarEl = document.querySelector('.sidebar-sticky');
    const sidebarItem = sidebarEl ? sidebarEl.querySelector('.sidebar-item') : null;
    if (!sidebarItem) return;

    const h3 = sidebarItem.querySelector('h3');
    if (h3) h3.textContent = isEn ? 'Our Ships' : 'Gemilerimiz';

    const ul = sidebarItem.querySelector('ul.sidebar-category1');
    if (ul) ul.innerHTML = `<li class="text-muted small">${isEn ? 'Loading...' : 'Yükleniyor...'}</li>`;

    const country = decodeURIComponent(countryParam || '');
    const lang = typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
    const backendCategory = lang === 'en' ? 'Ship' : 'Ship/Cruise';
    let tours = [];
    try {
      const all = await ApiService.getToursByDestination(country, lang, backendCategory);
      tours = (Array.isArray(all) ? all : []).filter(t => isShipCategory(t.category));
    } catch (e) {
      if (ul) ul.innerHTML = '';
      return;
    }

    allTours = tours;

    const shipMap = {};
    tours.forEach(t => {
      const name = (t.shipName || '').trim();
      if (name) shipMap[name] = (shipMap[name] || 0) + 1;
    });

    const ships = Object.keys(shipMap).sort();

    if (!ships.length) {
      if (ul) ul.innerHTML = `<li class="text-muted small">${isEn ? 'No ship information found.' : 'Gemi bilgisi bulunamadı.'}</li>`;
      requestSidebarPositionUpdate();
      return;
    }

    ul.innerHTML = ships.map(ship =>
      `<li>
        <input type="checkbox" class="ship-filter-cb" value="${ship}">
        ${ship} <span class="float-end count">${shipMap[ship]}</span>
      </li>`
    ).join('');

    ul.querySelectorAll('.ship-filter-cb').forEach(cb => {
      cb.addEventListener('change', function () {
        selectedShips = Array.from(ul.querySelectorAll('.ship-filter-cb:checked')).map(c => c.value);
        applyFilters();
      });
    });

    requestSidebarPositionUpdate();
  }

});
