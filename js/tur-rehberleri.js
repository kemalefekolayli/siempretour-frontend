// tur-rehberleri.js — "Tur Rehberleri" list page: region sections with country cards.
// Data: data/tur-rehberleri/index.json (built by tools/build_tur_rehberleri.js).

(function () {
  var DATA_URL = 'data/tur-rehberleri/index.json?v=20261021a';

  function isEn() {
    return (typeof getActiveLang === 'function' ? getActiveLang() : 'tr') === 'en';
  }

  function resolve(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === 'function' ? window.AssetCdn.resolve(url) : url;
  }

  function norm(s) {
    return String(s || '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function cardNode(country, region) {
    var a = el('a', 'guide-card');
    a.href = 'tur-rehberi.html?ulke=' + encodeURIComponent(country.slug);
    a.setAttribute('data-search', norm(country.nameTr + ' ' + country.nameEn));
    if (country.photo) {
      var img = el('img');
      img.loading = 'lazy';
      img.alt = country.nameTr;
      img.src = resolve(country.photo);
      a.appendChild(img);
    } else {
      a.classList.add('guide-card--plain');
      a.style.background = 'linear-gradient(160deg, ' + region.color + ', #1d2b3a)';
    }
    a.appendChild(el('span', 'guide-card__name', country.nameTr));
    return a;
  }

  function render(data) {
    var root = document.getElementById('guideRegions');
    var chips = document.getElementById('guideRegionChips');
    if (!root) return;
    root.innerHTML = '';
    if (chips) chips.innerHTML = '';

    data.regions.forEach(function (region) {
      var section = el('section', 'guide-region');
      section.id = 'bolge-' + region.id;
      section.appendChild(el('h2', 'guide-region__title', isEn() ? region.en : region.tr));
      var grid = el('div', 'guide-grid');
      region.countries.forEach(function (c) { grid.appendChild(cardNode(c, region)); });
      section.appendChild(grid);
      root.appendChild(section);

      if (chips) {
        var chip = el('a', 'guide-chip', isEn() ? region.en : region.tr);
        chip.href = '#bolge-' + region.id;
        chips.appendChild(chip);
      }
    });

    var count = document.getElementById('guideCount');
    var total = data.regions.reduce(function (n, r) { return n + r.countries.length; }, 0);
    if (count) count.textContent = isEn() ? total + ' destination guides' : total + ' destinasyon rehberi';
  }

  function applySearch(q) {
    var query = norm(q).trim();
    var any = false;
    document.querySelectorAll('.guide-region').forEach(function (section) {
      var visible = 0;
      section.querySelectorAll('.guide-card').forEach(function (card) {
        var show = !query || card.getAttribute('data-search').indexOf(query) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      section.style.display = visible ? '' : 'none';
      if (visible) any = true;
    });
    var empty = document.getElementById('guideEmpty');
    if (empty) empty.style.display = any ? 'none' : '';
  }

  function init() {
    var input = document.getElementById('guideSearch');
    if (input) input.addEventListener('input', function () { applySearch(input.value); });

    fetch(DATA_URL)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        render(data);
        if (input && input.value) applySearch(input.value);
      })
      .catch(function (err) {
        console.error('Tur rehberleri yüklenemedi:', err);
        var root = document.getElementById('guideRegions');
        if (root) root.innerHTML = '<p class="text-center py-5">' + (isEn() ? 'Guides could not be loaded.' : 'Rehberler şu anda yüklenemiyor.') + '</p>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
