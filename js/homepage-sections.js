// Hydrates the two admin-editable homepage sections from GET /api/homepage:
//   - Section 1: ".popular-locations-carousel" (country cards, full content)
//   - Section 2: ".cascading-carousel__track" (admin-selected tour cards)
// The static HTML in index.html stays as a fallback: it is only replaced when
// the API returns data for that section, so the page never ends up empty.
(function () {
  function activeLang() {
    if (typeof getActiveLang === "function") return getActiveLang() || "tr";
    if (typeof getSelectedLang === "function") return getSelectedLang() || "tr";
    return "tr";
  }

  function resolveAssetUrl(url) {
    return window.AssetCdn && typeof window.AssetCdn.resolve === "function"
      ? window.AssetCdn.resolve(url)
      : url;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function countryUrl(country, lang) {
    var url = "template_tours_grid_page.html?country=" + encodeURIComponent(country || "");
    if (lang && lang !== "tr") url += "&lang=" + encodeURIComponent(lang);
    return url;
  }

  function detailUrl(slug, destination, lang) {
    var url = "template_tour_page.html?id=" + encodeURIComponent(slug || "");
    if (destination) url += "&country=" + encodeURIComponent(destination);
    if (lang && lang !== "tr") url += "&lang=" + encodeURIComponent(lang);
    return url;
  }

  function section1CardHtml(card, lang) {
    var title = esc(card.title);
    return (
      '<div class="col-lg-2 p-1">' +
      '<div class="trend-item1-carousel w-100 mb-3 mb-lg-0">' +
      '<div class="trend-image position-relative">' +
      '<img loading="lazy" src="' + esc(resolveAssetUrl(card.imageUrl)) + '" alt="' + title + '" />' +
      '<div class="overlay-text">' +
      '<div class="trend-content align-self-center">' +
      '<div class="trend-content-title text-center">' +
      '<h3 class="white text-uppercase p-0">' + title + "</h3>" +
      '<p class="white p-3 text-center mb-2">' + esc(card.description) + "</p>" +
      '<div class="explore-tour-btn align-self-center"> <a href="' +
      esc(countryUrl(card.country, lang)) +
      '" data-country="' + esc(card.country) + '">' + title + "</a></div>" +
      "</div></div></div>" +
      '<div class="color-overlay"></div>' +
      "</div></div></div>"
    );
  }

  function section2CardHtml(tour, lang) {
    return (
      '<div class="cascading-carousel__item">' +
      '<a class="cascading-carousel__link" href="' +
      esc(detailUrl(tour.slug, tour.destination, lang)) + '">' +
      '<div class="trend-item1-carousel w-100 mb-3 mb-lg-0 align-content-center position-relative">' +
      '<div class="trend-image position-relative">' +
      '<img loading="lazy" src="' + esc(resolveAssetUrl(tour.mainPhoto)) + '" alt="' + esc(tour.name) + '" />' +
      '<div class="overlay-text">' +
      '<div class="trend-content d-flex align-items-end justify-content-between position-absolute bottom-0 p-3 w-100 z-index">' +
      '<div class="trend-content-title">' +
      '<h5 class="mb-0"><span class="white">' + esc(tour.destination) + "</span></h5>" +
      '<h3 class="mb-0 white">' + esc(tour.name) + "</h3>" +
      "</div>" +
      '<span class="white p-1 px-2"></span>' +
      "</div></div>" +
      '<div class="color-overlay"></div>' +
      "</div></div></a></div>"
    );
  }

  function renderSection1(cards, lang) {
    if (!Array.isArray(cards) || !cards.length) return;
    var container = document.querySelector(".popular-locations-carousel");
    if (!container) return;
    container.innerHTML = cards.map(function (c) {
      return section1CardHtml(c, lang);
    }).join("");
  }

  function renderSection2(tours, lang) {
    if (!Array.isArray(tours) || !tours.length) return;
    var track = document.querySelector(".cascading-carousel__track");
    if (!track) return;
    track.innerHTML = tours.map(function (t) {
      return section2CardHtml(t, lang);
    }).join("");
    if (window.SiempreCascading && typeof window.SiempreCascading.init === "function") {
      window.SiempreCascading.init();
    }
  }

  async function hydrate() {
    if (typeof ApiService === "undefined") return;
    var lang = activeLang();
    try {
      var data = await ApiService.getHomepage(lang);
      if (!data) return;
      renderSection1(data.section1, lang);
      renderSection2(data.section2, lang);
    } catch (err) {
      // Backend unavailable — keep the static fallback content.
      console.warn("Homepage sections: falling back to static content:", err && err.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
})();
