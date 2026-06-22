/**
 * Site language state.
 *
 * TR/EN are native site languages. Other languages use the Google Translate
 * widget at runtime while backend/content requests stay on the selected native
 * base language.
 */
(function () {
  var STORAGE_KEY = 'siempre_lang';
  var NATIVE_STORAGE_KEY = 'siempre_native_lang';
  var GOOGLE_SCRIPT_ID = 'siempre-google-translate-script';
  var GOOGLE_WIDGET_ID = 'siempre_google_translate_widget';

  var nativeLanguages = [
    { value: 'tr', label: 'T\u00fcrk\u00e7e' },
    { value: 'en', label: 'English' }
  ];

  var googleLanguages = [
    { value: 'fr', label: 'Fran\u00e7ais' },
    { value: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Espa\u00f1ol' },
    { value: 'it', label: 'Italiano' },
    { value: 'ru', label: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
    { value: 'pt', label: 'Portugu\u00eas' },
    { value: 'nl', label: 'Nederlands' }
  ];

  var supportedLanguages = nativeLanguages.concat(googleLanguages);
  var nativeValues = nativeLanguages.map(function (language) { return language.value; });
  var googleValues = googleLanguages.map(function (language) { return language.value; });
  var pendingGoogleConfig = null;

  function normalizeSelectedLang(lang) {
    lang = String(lang || '').trim().toLowerCase().replace('_', '-');
    if (lang === 'zh-cn' || lang === 'zh') return 'zh-CN';
    if (lang === 'zh-tw') return 'zh-TW';
    var found = supportedLanguages.some(function (language) { return language.value.toLowerCase() === lang.toLowerCase(); });
    return found ? supportedLanguages.find(function (language) { return language.value.toLowerCase() === lang.toLowerCase(); }).value : 'tr';
  }

  function normalizeNativeLang(lang) {
    lang = String(lang || '').trim().toLowerCase();
    return lang === 'en' ? 'en' : 'tr';
  }

  function isNativeLang(lang) {
    return nativeValues.indexOf(String(lang || '').toLowerCase()) !== -1;
  }

  function isGoogleLang(lang) {
    return googleValues.indexOf(String(lang || '').toLowerCase()) !== -1;
  }

  function readUrlLang() {
    try {
      return new URLSearchParams(window.location.search).get('lang');
    } catch (error) {
      return null;
    }
  }

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // localStorage can be unavailable in private/file contexts.
    }
  }

  function expireCookie(name, domain) {
    var suffix = '; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = name + '=;' + suffix;
    if (domain) document.cookie = name + '=;' + suffix + '; domain=' + domain;
  }

  function writeGoogleCookie(sourceLang, targetLang) {
    var value = '/' + sourceLang + '/' + targetLang;
    document.cookie = 'googtrans=' + value + '; path=/';
    if (window.location.hostname && window.location.hostname.indexOf('.') !== -1) {
      document.cookie = 'googtrans=' + value + '; path=/; domain=' + window.location.hostname;
      document.cookie = 'googtrans=' + value + '; path=/; domain=.' + window.location.hostname;
    }
  }

  function clearGoogleTranslateResidue() {
    expireCookie('googtrans');
    if (window.location.hostname) {
      expireCookie('googtrans', window.location.hostname);
      expireCookie('googtrans', '.' + window.location.hostname);
    }

    document.querySelectorAll('iframe.goog-te-banner-frame, .goog-te-banner-frame').forEach(function (node) {
      node.remove();
    });

    var widgetHost = document.getElementById(GOOGLE_WIDGET_ID);
    if (widgetHost) widgetHost.remove();

    document.documentElement.style.top = '0px';
    document.documentElement.style.position = '';
    if (document.body) {
      document.body.style.top = '0px';
      document.body.style.position = '';
      document.body.classList.remove('translated-ltr', 'translated-rtl', 'siempre-google-mode', 'siempre-google-rtl');
    }
  }

  function getSelectedLang() {
    return normalizeSelectedLang(readUrlLang() || readStorage(STORAGE_KEY) || 'tr');
  }

  function getContentLangForSelected(selectedLang) {
    if (isNativeLang(selectedLang)) return normalizeNativeLang(selectedLang);
    return normalizeNativeLang(readStorage(NATIVE_STORAGE_KEY) || 'tr');
  }

  function getActiveLang() {
    return getContentLangForSelected(getSelectedLang());
  }

  function getLanguageMeta(lang) {
    return supportedLanguages.find(function (language) { return language.value === lang; }) || supportedLanguages[0];
  }

  function updateDocumentLanguage(selectedLang, contentLang) {
    var isRtl = selectedLang === 'ar';
    document.documentElement.lang = selectedLang || contentLang || 'tr';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    window.currentLang = contentLang;
    window.currentSelectedLang = selectedLang;
    window.currentContentLang = contentLang;

    if (document.body) {
      document.body.classList.toggle('siempre-google-mode', isGoogleLang(selectedLang));
      document.body.classList.toggle('siempre-google-rtl', isRtl);
    }
  }

  function updateUrlLang(url, selectedLang) {
    if (selectedLang === 'tr') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', selectedLang);
    }
  }

  function setActiveLang(lang, options) {
    var selected = normalizeSelectedLang(lang);
    var content = getContentLangForSelected(selected);

    writeStorage(STORAGE_KEY, selected);
    if (isNativeLang(selected)) {
      content = selected;
      writeStorage(NATIVE_STORAGE_KEY, selected);
      clearGoogleTranslateResidue();
    } else {
      writeGoogleCookie(content, selected);
    }

    updateDocumentLanguage(selected, content);

    if (options && options.reload) {
      var url = new URL(window.location.href);
      updateUrlLang(url, selected);
      window.location.href = url.toString();
      return;
    }

    window.dispatchEvent(new CustomEvent('siempre:languagechange', {
      detail: {
        lang: content,
        contentLang: content,
        selectedLang: selected,
        googleTranslated: isGoogleLang(selected)
      }
    }));
  }

  function appendOptions(select, label, languages) {
    var group = document.createElement('optgroup');
    group.label = label;
    languages.forEach(function (language) {
      var option = document.createElement('option');
      option.value = language.value;
      option.textContent = language.label;
      group.appendChild(option);
    });
    select.appendChild(group);
  }

  function buildLanguageSelect(container) {
    var existing = container.querySelector('select.language-fallback-select');
    if (existing) return existing;

    container.innerHTML = '';

    var select = document.createElement('select');
    select.id = 'languageFallbackSelect';
    select.className = 'language-fallback-select skiptranslate';
    select.setAttribute('aria-label', 'Language selection');
    select.setAttribute('translate', 'no');

    appendOptions(select, 'Native', nativeLanguages);
    appendOptions(select, 'Google Translate', googleLanguages);

    select.addEventListener('change', function () {
      setActiveLang(select.value, { reload: true });
    });

    container.appendChild(select);

    var switchEl = container.closest('.lang-switch');
    if (switchEl) {
      switchEl.classList.add('skiptranslate');
      switchEl.setAttribute('translate', 'no');
      switchEl.setAttribute('aria-label', 'Language selection');
    }

    return select;
  }

  function preserveLangInInternalLinks(selectedLang) {
    if (selectedLang === 'tr') return;
    var basePath = window.location.pathname.replace(/[^/]*$/, '');

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || /^(#|javascript:|mailto:|tel:)/i.test(href)) return;

      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (error) {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (!/\.html$/i.test(url.pathname)) return;

      updateUrlLang(url, selectedLang);
      var pathname = url.pathname;
      var relativePath = pathname.indexOf(basePath) === 0 ? pathname.slice(basePath.length) : pathname;
      link.setAttribute('href', relativePath + url.search + url.hash);
    });
  }

  function ensureGoogleWidgetHost() {
    var host = document.getElementById(GOOGLE_WIDGET_ID);
    if (host) return host;

    host = document.createElement('div');
    host.id = GOOGLE_WIDGET_ID;
    host.className = 'siempre-google-widget-host skiptranslate';
    host.setAttribute('translate', 'no');
    document.body.appendChild(host);
    return host;
  }

  function applyGoogleSelection(attempt) {
    attempt = attempt || 0;
    if (!pendingGoogleConfig) return;

    writeGoogleCookie(pendingGoogleConfig.contentLang, pendingGoogleConfig.selectedLang);

    var combo = document.querySelector('#' + GOOGLE_WIDGET_ID + ' select.goog-te-combo');
    if (combo) {
      combo.value = pendingGoogleConfig.selectedLang;
      combo.dispatchEvent(new Event('change'));
      return;
    }

    if (attempt < 40) {
      setTimeout(function () { applyGoogleSelection(attempt + 1); }, 250);
    }
  }

  function loadGoogleTranslateScript() {
    if (document.getElementById(GOOGLE_SCRIPT_ID)) {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        window.googleTranslateElementInit();
      }
      return;
    }

    var script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }

  function activateGoogleTranslate(selectedLang, contentLang) {
    if (!document.body) return;
    pendingGoogleConfig = { selectedLang: selectedLang, contentLang: contentLang };
    writeGoogleCookie(contentLang, selectedLang);
    ensureGoogleWidgetHost();

    window.googleTranslateElementInit = function () {
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) return;

      var host = ensureGoogleWidgetHost();
      if (!host.hasChildNodes()) {
        new window.google.translate.TranslateElement({
          pageLanguage: contentLang,
          includedLanguages: googleValues.join(','),
          autoDisplay: true,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        }, GOOGLE_WIDGET_ID);
      }

      applyGoogleSelection();
    };

    loadGoogleTranslateScript();
    applyGoogleSelection();
  }

  function initLanguageControls() {
    var selectedLang = getSelectedLang();
    var contentLang = getContentLangForSelected(selectedLang);

    writeStorage(STORAGE_KEY, selectedLang);
    if (isNativeLang(selectedLang)) writeStorage(NATIVE_STORAGE_KEY, selectedLang);

    updateDocumentLanguage(selectedLang, contentLang);

    document.querySelectorAll('#google_translate_element').forEach(function (container) {
      var select = buildLanguageSelect(container);
      select.value = getLanguageMeta(selectedLang).value;
    });

    if (isGoogleLang(selectedLang)) {
      activateGoogleTranslate(selectedLang, contentLang);
    } else {
      clearGoogleTranslateResidue();
      updateDocumentLanguage(selectedLang, contentLang);
    }

    preserveLangInInternalLinks(selectedLang);
  }

  window.getActiveLang = getActiveLang;
  window.getContentLang = getActiveLang;
  window.getSelectedLang = getSelectedLang;
  window.setActiveLang = setActiveLang;
  window.isGoogleTranslatedLang = function () { return isGoogleLang(getSelectedLang()); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageControls);
  } else {
    initLanguageControls();
  }
})();
