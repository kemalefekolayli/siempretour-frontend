console.log("tour page photos js loaded");

function resolveAssetUrl(url) {
  return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
    ? window.AssetCdn.resolve(url)
    : url;
}

const TOUR_PAGE_DEFAULT_IMAGES = [
  "images/cruise/cruise-banner.jpg",
  "images/cruise/ships/costa/costa-favolosa.jpg",
  "images/cruise/ships/costa/costa-fortuna.jpg",
  "images/cruise/ships/royal-caribbean/oasis-of-the-seas.jpg",
  "images/cruise/ships/msc/msc-meraviglia.jpg",
  "images/cruise/ships/celebrity/celebrity-apex.jpg",
];

function tourPageCategory() {
  return new URLSearchParams(window.location.search).get("category") || "";
}

function uniqueImageList(list) {
  const seen = new Set();
  return (list || []).filter((url) => {
    const clean = String(url || "").trim();
    if (!clean || seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

function imageLoads(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = resolveAssetUrl(url);
    window.setTimeout(() => done(false), 2500);
  });
}

async function resolveUsableImages(candidates, count) {
  const queue = uniqueImageList([...candidates, ...TOUR_PAGE_DEFAULT_IMAGES]);
  const usable = [];

  for (const url of queue) {
    if (usable.length >= count) break;
    if (await imageLoads(url)) usable.push(url);
  }

  while (usable.length < count) {
    usable.push(TOUR_PAGE_DEFAULT_IMAGES[usable.length % TOUR_PAGE_DEFAULT_IMAGES.length]);
  }

  return usable.slice(0, count);
}

async function renderTourPagePhotos() {
  if (typeof _countrySlug === "undefined" || !_countrySlug) return;

  const photos = [
    document.getElementById("tour_page_photo1"),
    document.getElementById("tour_page_photo2"),
    document.getElementById("tour_page_photo3"),
    document.getElementById("tour_page_photo4"),
  ];

  if (photos.some((p) => !p)) return;

  const usedImages = [];
  const category = tourPageCategory();

  try {
    const lang = typeof getActiveLang === "function" ? getActiveLang() : "tr";
    const dataRoot = lang === "en"
      ? "data/siempre_tour_country_datas"
      : "data/siempre_tour_country_datas_tr";
    const res = await fetch(
      `${dataRoot}/${_countrySlug}/datas.json`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const datas = await res.json();
      const overview = datas.find((d) => d.type === "overview");
      const bestTime = datas.find((d) => d.type === "best-time-to");

      if (overview?.image1) usedImages.push(overview.image1);
      if (overview?.image2) usedImages.push(overview.image2);
      if (bestTime?.image1) usedImages.push(bestTime.image1);
      if (bestTime?.image2) usedImages.push(bestTime.image2);
    }
  } catch (e) {
    console.warn("Country datas could not be loaded, using fallbacks.", e);
  }

  if (window.CountryPageImages?.pickMany) {
    try {
      const picked = await window.CountryPageImages.pickMany(_countrySlug, usedImages, 4);
      usedImages.unshift(...picked);
    } catch (e) {
      console.warn("Country image picker could not be loaded.", e);
    }
  }

  if (usedImages.length < 4 && window.ApiService?.getToursByDestination) {
    try {
      const lang = typeof getActiveLang === "function" ? getActiveLang() : "tr";
      const tours = await ApiService.getToursByDestination(_countrySlug, lang, category || null);
      if (Array.isArray(tours)) {
        tours.forEach((tour) => {
          ["image1", "image2", "image3", "image4", "mainPhoto"].forEach((key) => {
            if (tour[key]) usedImages.push(tour[key]);
          });
        });
      }
    } catch (e) {
      console.error("Tour image fallback could not be loaded.", e);
    }
  }

  const bannerCandidates = category === "Ship/Cruise"
    ? [...TOUR_PAGE_DEFAULT_IMAGES, ...usedImages]
    : usedImages;
  const safeImages = await resolveUsableImages(bannerCandidates, photos.length);

  photos.forEach((el, i) => {
    const image = resolveAssetUrl(safeImages[i]);
    const img = el.querySelector("img");

    el.style.backgroundImage = `url("${image}")`;
    el.classList.add("has-image");

    if (img) {
      img.src = image;
      img.alt = `${_countrySlug} tour image`;
      img.onerror = function () {
        this.onerror = null;
        this.src = TOUR_PAGE_DEFAULT_IMAGES[0];
        el.style.backgroundImage = `url("${TOUR_PAGE_DEFAULT_IMAGES[0]}")`;
      };
    }
  });
}

document.addEventListener("DOMContentLoaded", renderTourPagePhotos);
