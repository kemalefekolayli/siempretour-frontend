(function () {
  // images/tour-photos/ and images/gemi/ are hosted on R2 (cdn.siempretour.com)
  // because the combined site + full tour photo catalog exceeds Cloudflare
  // Pages' 20,000-file-per-deployment limit. avrupa-turlari/, uploads/tours/
  // (proxied to Railway, see functions/uploads/[[path]].js) and the rest of
  // images/ (site UI assets) stay as regular Pages static assets, so they are
  // intentionally not in this list.
  var DEFAULT_ASSET_CDN_BASE = "https://cdn.siempretour.com";
  var CDN_PATH_PREFIXES = [
    "images/tour-photos/",
    "images/gemi/"
  ];

  function stripTrailingSlash(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function getMetaBase() {
    if (typeof document === "undefined") return "";
    var meta = document.querySelector('meta[name="asset-cdn-base"]');
    return meta ? meta.getAttribute("content") : "";
  }

  function getBase() {
    return stripTrailingSlash(window.SIEMPRE_ASSET_CDN_BASE || getMetaBase() || DEFAULT_ASSET_CDN_BASE);
  }

  function isAbsoluteUrl(url) {
    return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url) ||
      /^(?:data|blob|mailto|tel):/i.test(url) ||
      url.charAt(0) === "#";
  }

  function cleanPath(url) {
    return String(url || "").trim().replace(/^\.?\//, "");
  }

  function shouldRewrite(url) {
    var path = cleanPath(url);
    return CDN_PATH_PREFIXES.some(function (prefix) {
      return path.indexOf(prefix) === 0;
    });
  }

  function resolve(url) {
    if (typeof url !== "string") return url;
    var value = url.trim();
    if (!value || isAbsoluteUrl(value)) return value;

    var base = getBase();
    if (!base || !shouldRewrite(value)) return value;

    return base + "/" + cleanPath(value);
  }

  function setBase(base) {
    window.SIEMPRE_ASSET_CDN_BASE = stripTrailingSlash(base);
  }

  window.AssetCdn = {
    getBase: getBase,
    resolve: resolve,
    setBase: setBase
  };

  // Some pages (e.g. index.html's trending-destinations carousel, or the
  // placeholder background-image on booking.html's #tour-main-photo before
  // JS fills in the real tour) hardcode CDN-prefixed paths directly in the
  // HTML instead of rendering them through JS + AssetCdn.resolve(). Sweep the
  // DOM once on load and rewrite both <img src> and inline
  // background-image: url(...) so they still resolve correctly wherever
  // DEFAULT_ASSET_CDN_BASE points. loading="lazy" images haven't started
  // fetching yet at this point, so this runs before the browser requests them.
  var BG_URL_RE = /url\((['"]?)([^'")]+)\1\)/;

  function rewriteStaticImgTags() {
    if (!getBase()) return;

    var imgs = document.querySelectorAll("img[src]");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var src = img.getAttribute("src");
      if (shouldRewrite(src)) {
        img.setAttribute("src", resolve(src));
      }
    }

    var bgEls = document.querySelectorAll('[style*="background-image"]');
    for (var j = 0; j < bgEls.length; j++) {
      var el = bgEls[j];
      var style = el.getAttribute("style") || "";
      var match = BG_URL_RE.exec(style);
      if (match && shouldRewrite(match[2])) {
        var resolved = resolve(match[2]);
        el.setAttribute("style", style.replace(BG_URL_RE, "url(" + resolved + ")"));
      }
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", rewriteStaticImgTags);
    } else {
      rewriteStaticImgTags();
    }
  }

  // Safety net: several pages re-render sections after the initial load
  // (homepage-sections.js replaces the homepage carousels with API data,
  // admin-panel.js re-renders previews, etc.) and any of those - present or
  // future - could insert a raw, unresolved images/tour-photos|gemi/... path
  // the same way the static-HTML case above did. Rather than relying on every
  // such script remembering to call AssetCdn.resolve() itself, watch the DOM
  // for new/changed <img> and background-image elements and fix them on
  // sight. Debounced so bursts of unrelated DOM churn only sweep once.
  if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
    var sweepPending = false;
    function scheduleSweep() {
      if (sweepPending) return;
      sweepPending = true;
      var run = function () {
        sweepPending = false;
        rewriteStaticImgTags();
      };
      if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
      else setTimeout(run, 50);
    }

    var startObserver = function () {
      if (!document.body) return;
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === "childList" && m.addedNodes.length) {
            scheduleSweep();
            return;
          }
          if (m.type === "attributes") {
            scheduleSweep();
            return;
          }
        }
      }).observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src", "style"]
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", startObserver);
    } else {
      startObserver();
    }
  }
})();
