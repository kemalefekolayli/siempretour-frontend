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
 * Google Translate: keep the language selector visible and normalized.
 * Google can replace its select after page load, so this must be repeatable.
 */
(function fixGoogleTranslate() {
  var fallbackId = 'languageFallbackSelect';
  var supportedLanguages = [
    { value: 'tr', label: 'T\u00FCrk\u00E7e' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Fran\u00E7ais' },
    { value: 'es', label: 'Espa\u00F1ol' },
    { value: 'it', label: 'Italiano' },
    { value: 'ru', label: 'Russian' },
    { value: 'ar', label: 'Arabic' }
  ];

  function removeBanner() {
    var iframe = document.querySelector('iframe.goog-te-banner-frame');
    if (!iframe) return;
    iframe.remove();
    document.documentElement.style.top = '0px';
    if (document.body) {
      document.body.style.top = '0px';
      document.body.style.position = '';
    }
    document.documentElement.style.position = '';
  }

  function getGoogleTranslateLang() {
    var match = document.cookie.match(/googtrans=\/[^/]*\/([a-z-]+)/i);
    return match ? match[1].toLowerCase() : 'tr';
  }

  function setGoogleTranslateCookie(lang) {
    var value = '/tr/' + lang;
    document.cookie = 'googtrans=' + value + '; path=/';
    document.cookie = 'googtrans=' + value + '; path=/; domain=' + window.location.hostname;
  }

  function fixSelect() {
    var sel = document.querySelector('select.goog-te-combo');
    if (!sel) return;

    if (sel.options[0] && sel.options[0].value === '') {
      sel.options[0].text = 'Dil Se\u00E7in';
    }

    var hasTr = false;
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === 'tr') {
        hasTr = true;
        break;
      }
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

    var lang = getGoogleTranslateLang();
    if (lang && sel.value !== lang) {
      for (var j = 0; j < sel.options.length; j++) {
        if (sel.options[j].value === lang) {
          sel.value = lang;
          break;
        }
      }
    }

    sel.setAttribute('aria-label', 'Dil secimi');
    sel.style.display = 'inline-block';
    sel.style.visibility = 'visible';
    sel.style.opacity = '1';
  }

  function createFallbackSelect(container) {
    var fallback = document.createElement('select');
    fallback.id = fallbackId;
    fallback.className = 'language-fallback-select';
    fallback.setAttribute('aria-label', 'Dil secimi');

    for (var i = 0; i < supportedLanguages.length; i++) {
      var option = document.createElement('option');
      option.value = supportedLanguages[i].value;
      option.text = supportedLanguages[i].label;
      fallback.appendChild(option);
    }

    fallback.addEventListener('change', function () {
      setGoogleTranslateCookie(fallback.value);
      window.location.reload();
    });

    container.appendChild(fallback);
    return fallback;
  }

  function ensureFallback() {
    var container = document.getElementById('google_translate_element');
    if (!container) return;

    // Use our custom select as the only visible language UI. Google Translate
    // still loads (it performs the translation via the googtrans cookie set by
    // the fallback), but its own UI (combo + simple gadget link) is hidden so
    // the navbar doesn't render two language controls side-by-side
    // (previously: fallback "Türkçe" + Google's "Dili Seçin").
    var fallback = document.getElementById(fallbackId);
    if (!fallback) fallback = createFallbackSelect(container);
    fallback.value = getGoogleTranslateLang();
    fallback.style.display = 'inline-block';

    var googleSelect = container.querySelector('select.goog-te-combo');
    if (googleSelect) googleSelect.style.display = 'none';

    var googleGadget = container.querySelector('.goog-te-gadget');
    if (googleGadget) googleGadget.style.display = 'none';
  }

  function runOnce() {
    removeBanner();
    fixSelect();
    ensureFallback();
  }

  function init() {
    runOnce();
    // Google Translate injects its widget asynchronously after its script loads.
    // A few delayed polls catch the injection without the runaway feedback loop
    // that a MutationObserver + 1s setInterval used to create against GT's own
    // DOM rewrites.
    [500, 1500, 4000, 10000].forEach(function (ms) {
      setTimeout(runOnce, ms);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
