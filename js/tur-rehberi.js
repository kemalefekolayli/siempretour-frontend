// tur-rehberi.js — single destination guide: section menu on the left, content on the right.
// URL: tur-rehberi.html?ulke=<slug>[&bolum=<section-id>]
// Data: data/tur-rehberleri/<slug>.json (built by tools/build_tur_rehberleri.js); the section
// HTML is generated at build time from the archive's Markdown with raw HTML escaped.

(function () {
  var DATA_VERSION = '20261021b';
  var guide = null;

  function isEn() {
    return (typeof getActiveLang === 'function' ? getActiveLang() : 'tr') === 'en';
  }

  function resolve(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === 'function' ? window.AssetCdn.resolve(url) : url;
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function setText(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function showSection(id, push) {
    if (!guide || !guide.sections.length) return;
    var section = guide.sections.find(function (s) { return s.id === id; }) || guide.sections[0];

    setText('guideSectionTitle', section.title);
    var body = document.getElementById('guideSectionBody');
    if (body) body.innerHTML = section.html;

    document.querySelectorAll('#guideMenu .guide-menu__item').forEach(function (btn) {
      var active = btn.getAttribute('data-id') === section.id;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-current', active ? 'true' : 'false');
    });
    var select = document.getElementById('guideMenuSelect');
    if (select) select.value = section.id;

    if (push) {
      var url = new URL(window.location.href);
      url.searchParams.set('bolum', section.id);
      history.pushState({ bolum: section.id }, '', url);
      var content = document.getElementById('guideContent');
      if (content && content.getBoundingClientRect().top < 0) {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function renderMenu() {
    var menu = document.getElementById('guideMenu');
    var select = document.getElementById('guideMenuSelect');
    if (menu) menu.innerHTML = '';
    if (select) select.innerHTML = '';
    guide.sections.forEach(function (s) {
      if (menu) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'guide-menu__item';
        btn.setAttribute('data-id', s.id);
        btn.textContent = s.label;
        btn.addEventListener('click', function () { showSection(s.id, true); });
        menu.appendChild(btn);
      }
      if (select) {
        var opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.label;
        select.appendChild(opt);
      }
    });
    if (select) select.addEventListener('change', function () { showSection(select.value, true); });
  }

  // "Bu ülkedeki turlarımız" button, only if the site actually has tours for this country.
  function showToursLink() {
    var box = document.getElementById('guideToursLink');
    if (!box || !guide.tourKey || typeof ApiService === 'undefined') return;
    var lang = typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
    ApiService.getToursByDestination(guide.tourKey, lang)
      .then(function (tours) {
        if (!Array.isArray(tours) || !tours.length) return;
        var a = box.querySelector('a');
        a.href = 'template_tours_grid_page.html?country=' + encodeURIComponent(guide.tourKey);
        a.textContent = isEn()
          ? 'See our ' + guide.nameEn + ' tours (' + tours.length + ')'
          : guide.nameTr + ' turlarımızı görün (' + tours.length + ')';
        box.style.display = '';
      })
      .catch(function () { /* button stays hidden */ });
  }

  function notFound() {
    setText('guideTitle', isEn() ? 'Guide not found' : 'Rehber bulunamadı');
    var body = document.getElementById('guideSectionBody');
    if (body) body.innerHTML = '<p>' + (isEn() ? 'This guide does not exist. ' : 'Aradığınız rehber bulunamadı. ') +
      '<a href="tur-rehberleri.html">' + (isEn() ? 'All guides' : 'Tüm rehberler') + '</a></p>';
  }

  function init() {
    var slug = param('ulke') || '';
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) { notFound(); return; }

    fetch('data/tur-rehberleri/' + slug + '.json?v=' + DATA_VERSION)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        guide = data;
        var name = isEn() ? data.nameEn : data.nameTr;
        document.title = (isEn() ? name + ' Travel Guide' : name + ' Tur Rehberi') + ' | Siempre Tour';
        setText('guideTitle', isEn() ? name + ' Travel Guide' : name + ' Tur Rehberi');
        setText('guideCrumb', name);
        setText('guideRegion', isEn() ? '' : data.regionTr);
        if (data.photo) {
          var banner = document.getElementById('guideBanner');
          if (banner) banner.style.backgroundImage = 'url("' + resolve(data.photo) + '")';
        }
        renderMenu();
        showSection(param('bolum'), false);
        showToursLink();
      })
      .catch(function (err) {
        console.error('Rehber yüklenemedi:', err);
        notFound();
      });

    window.addEventListener('popstate', function () { showSection(param('bolum'), false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
