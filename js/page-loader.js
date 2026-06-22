/*
 * Siempre Tour — branded page loader
 * ----------------------------------
 * Shows a full-screen overlay with the Siempre logo while the page loads,
 * so visitors never see a half-rendered / "broken looking" page.
 *
 * Self-contained: injects its own styles + markup, so a page only needs
 *   <script src="js/page-loader.js"></script>
 * placed as early as possible in <head>.
 *
 * Safety:
 *  - Uses a unique id (#siempre-loader) so the theme's `#preloader{display:none}`
 *    rule cannot affect it.
 *  - Hard MAX_WAIT timeout force-hides the loader even if `window.load` never
 *    fires (a hung image/CDN), so it can never trap the page.
 *  - MIN_SHOW avoids an ugly flash on fast loads.
 *  - Respects prefers-reduced-motion.
 */
(function () {
  if (window.__siempreLoaderInit) return;
  window.__siempreLoaderInit = true;

  // In an iframe / embedded admin context we don't want the overlay.
  try {
    if (window.top !== window.self) return;
  } catch (e) {
    /* cross-origin frame — ignore */
  }

  var MIN_SHOW = 450;   // ms — minimum time the loader stays visible
  var MAX_WAIT = 8000;  // ms — absolute cap; force-hide after this no matter what
  var FADE_MS = 450;    // ms — fade-out duration (keep in sync with CSS transition)

  var LOGO_SRC = 'images/logolv.svg';
  var start = Date.now();
  var hidden = false;

  var css =
    '#siempre-loader{position:fixed;inset:0;z-index:2147483600;display:flex;' +
    'flex-direction:column;align-items:center;justify-content:center;' +
    'background:#ffffff;opacity:1;transition:opacity ' + FADE_MS + 'ms ease;}' +
    '#siempre-loader.is-hiding{opacity:0;}' +
    '#siempre-loader .sl-logo{width:160px;max-width:48vw;height:auto;display:block;' +
    'animation:slPulse 1.5s ease-in-out infinite;}' +
    '#siempre-loader .sl-bar{position:relative;margin-top:26px;width:180px;max-width:60vw;' +
    'height:4px;border-radius:4px;background:rgba(33,80,147,0.15);overflow:hidden;}' +
    '#siempre-loader .sl-bar::before{content:"";position:absolute;left:-40%;top:0;height:100%;' +
    'width:40%;border-radius:4px;background:#96c43f;animation:slSlide 1.15s ease-in-out infinite;}' +
    '@keyframes slPulse{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.06);opacity:0.82;}}' +
    '@keyframes slSlide{0%{left:-40%;}50%{left:60%;}100%{left:120%;}}' +
    '@media (prefers-reduced-motion: reduce){' +
    '#siempre-loader .sl-logo{animation:none;}' +
    '#siempre-loader .sl-bar::before{animation:slSlide 1.6s linear infinite;}}';

  var style = document.createElement('style');
  style.id = 'siempre-loader-style';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var overlay = document.createElement('div');
  overlay.id = 'siempre-loader';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute('aria-label', 'Sayfa yükleniyor');
  overlay.innerHTML =
    '<img class="sl-logo" src="' + LOGO_SRC + '" alt="Siempre Tour" ' +
    'onerror="this.style.display=\'none\'">' +
    '<div class="sl-bar" aria-hidden="true"></div>';

  function mount() {
    if (overlay.parentNode) return;
    (document.body || document.documentElement).appendChild(overlay);
  }
  // documentElement always exists at head-parse time; re-home to body once ready.
  mount();
  document.addEventListener('DOMContentLoaded', mount);

  function hide() {
    if (hidden) return;
    hidden = true;
    var wait = Math.max(0, MIN_SHOW - (Date.now() - start));
    setTimeout(function () {
      overlay.classList.add('is-hiding');
      setTimeout(function () {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, FADE_MS + 50);
    }, wait);
  }

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
  }
  // Hard safety net: never trap the page behind the loader.
  setTimeout(hide, MAX_WAIT);
})();
