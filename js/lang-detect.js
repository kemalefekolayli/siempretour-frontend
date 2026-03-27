/**
 * Detect active language from Google Translate cookie.
 * Returns the backend-compatible lang code:
 *   - 'tr' if Turkish (default / no translation)
 *   - 'en' if English OR any other language
 *     (backend only has tr/en; Google Translate handles the rest from English)
 */
function getActiveLang() {
  var urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang) return urlLang === 'tr' ? 'tr' : 'en';

  var match = document.cookie.match(/googtrans=\/[^/]*\/([a-z-]+)/i);
  if (match) {
    var gtLang = match[1].toLowerCase();
    return gtLang === 'tr' ? 'tr' : 'en';
  }

  return 'tr';
}

/**
 * Google Translate: banner gizle + "Dili Seçir" -> "Dil Secin" + Turkce secenegi ekle
 */
(function fixGoogleTranslate() {
  var selectFixed = false;

  function removeBanner() {
    var iframe = document.querySelector('iframe.goog-te-banner-frame');
    if (iframe) iframe.remove();
    document.documentElement.style.top = '0px';
    if (document.body) {
      document.body.style.top = '0px';
      document.body.style.position = '';
    }
    document.documentElement.style.position = '';
  }

  function fixSelect() {
    if (selectFixed) return;
    var sel = document.querySelector('select.goog-te-combo');
    if (!sel) return;

    if (sel.options[0] && sel.options[0].value === '') {
      sel.options[0].text = 'Dil Se\u00E7in';
    }

    var hasTr = false;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === 'tr') { hasTr = true; break; }
    }
    if (!hasTr) {
      var opt = document.createElement('option');
      opt.value = 'tr';
      opt.text = 'T\u00FCrk\u00E7e';
      if (sel.options.length > 1) {
        sel.insertBefore(opt, sel.options[1]);
      } else {
        sel.appendChild(opt);
      }
    }
    selectFixed = true;
  }

  function init() {
    removeBanner();
    fixSelect();

    var obs = new MutationObserver(function () {
      removeBanner();
      if (!selectFixed) fixSelect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(removeBanner, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
