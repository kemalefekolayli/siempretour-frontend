(function () {
  var DEFAULT_ASSET_CDN_BASE = "";
  var CDN_PATH_PREFIXES = [
    "avrupa-turlari/",
    "images/tour-photos/",
    "uploads/tours/",
    "images/",
    "fonts/"
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
})();
