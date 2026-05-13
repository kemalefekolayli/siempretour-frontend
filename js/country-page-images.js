(function () {
  const cache = new Map();
  const avrupaCache = new Map();
  const imageFields = ["image1", "image2", "image3", "image4", "image5", "image6", "mainPhoto"];
  const avrupaFolders = {
    "albania": "Albania",
    "andorra": "Andorra",
    "austria": "Austria",
    "bosnia herzegovina": "Bosnia-Herzegovina",
    "bosnia-herzegovina": "Bosnia-Herzegovina",
    "bulgaria": "Bulgaria",
    "channel islands": "Channel-Islands",
    "channel-islands": "Channel-Islands",
    "croatia": "Croatia",
    "czech republic": "Czech-republic",
    "czech-republic": "Czech-republic",
    "denmark": "Denmark",
    "england": "England",
    "estonia": "Estonia",
    "faroe islands": "Faroe-islands",
    "faroe-islands": "Faroe-islands",
    "finland": "Finland",
    "france": "France",
    "germany": "Germany",
    "greece": "Greece",
    "hungary": "Hungary",
    "iceland": "Iceland",
    "ireland": "Ireland",
    "italy": "Italy",
    "kosovo": "Kosovo",
    "lapland": "Lapland",
    "latvia": "Latvia",
    "lithuania": "Lithuania",
    "malta": "Malta",
    "moldova": "Moldova",
    "montenegro": "Montenegro",
    "norway": "Norway",
    "poland": "Poland",
    "portugal": "Portugal",
    "romania": "Romania",
    "scotland": "Scotland",
    "serbia": "Serbia",
    "slovakia": "Slovakia",
    "slovenia": "Slovenia",
    "spain": "Spain",
    "sweden": "Sweden",
    "switzerland": "Switzerland",
    "turkey": "Turkiye",
    "turkiye": "Turkiye",
    "uk": "United-Kingdom",
    "united kingdom": "United-Kingdom",
    "united-kingdom": "United-Kingdom",
  };
  const avrupaSemanticFallbacks = {
    "cyprus": ["Greece", "Turkiye"],
    "europe": ["France", "Italy", "Germany", "Spain"],
    "georgia": ["Turkiye"],
    "macedonia": ["Bulgaria", "Greece", "Serbia"],
    "netherlands": ["Germany"],
    "northern ireland": ["Ireland", "United-Kingdom"],
    "northern-ireland": ["Ireland", "United-Kingdom"],
    "wales": ["United-Kingdom"],
  };
  const avrupaRootFiles = {
    "Czech-republic": ["premium_photo-1661963996750-24c93354eecc.webp"],
    "Finland": [
      "august-twilight-at-the-olavinlinna-fortress-savo-2026-01-09-13-02-03-utc.webp",
      "helsinki-cityscape-paints-a-vibrant-picture-under-2026-01-11-11-07-23-utc.webp",
      "tervasaari-island-and-helsinki-cityscape-01-2026-01-07-22-56-45-utc.webp",
    ],
    "Germany": [
      "beautiful-view-of-the-cologne-cathedral-in-germany-2026-01-08-00-30-22-utc.webp",
      "cityscape-of-frankfurt-downtown-germany-2026-01-08-02-14-07-utc.webp",
      "woman-traveling-in-berlin-2026-01-08-08-24-04-utc.webp",
      "woman-traveling-in-berlin-2026-01-09-00-26-25-utc.webp",
    ],
    "Hungary": ["mid-adult-woman-taking-self-portrait-using-smartph-2026-01-09-09-36-58-utc.jpg"],
  };

  function getCountryFromUrl() {
    return new URLSearchParams(window.location.search).get("country") || "";
  }

  function isLocalTourPhoto(url) {
    return typeof url === "string" && url.trim().startsWith("images/tour-photos/");
  }

  function isAvrupaPhoto(url) {
    return typeof url === "string" && url.trim().startsWith("avrupa-turlari/avrupa-turlari/");
  }

  function normalizeCountry(country) {
    return String(country || "").trim().toLowerCase().replace(/[-_]+/g, " ");
  }

  function addUnique(list, seen, url) {
    const clean = String(url || "").trim();
    if ((!isLocalTourPhoto(clean) && !isAvrupaPhoto(clean)) || seen.has(clean)) return;
    seen.add(clean);
    list.push(clean);
  }

  function scoreImage(url) {
    const value = String(url || "").toLowerCase();
    let score = 0;

    if (/\/(01|02|03|04|05|06)\//.test(value)) score += 8;
    if (/\/\d\d-[a-z-]+\//.test(value)) score += 4;
    if (/map|\.svg|logo|icon|avatar/.test(value)) score -= 100;
    if (/09-african-safari/.test(value)) score -= 8;
    if (/\/(01|02)\//.test(value)) score += 2;

    return score;
  }

  function imageLoads(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  function avrupaCandidates(country) {
    const key = normalizeCountry(country);
    const folders = avrupaFolders[key] ? [avrupaFolders[key]] : (avrupaSemanticFallbacks[key] || []);
    if (!folders.length) return [];

    const candidates = [];
    folders.forEach((folder) => {
      const manifestImages = window.AvrupaPhotoManifest?.[folder];
      if (Array.isArray(manifestImages) && manifestImages.length) {
        candidates.push(...manifestImages);
        return;
      }

      const base = `avrupa-turlari/avrupa-turlari/${folder}`;
      (avrupaRootFiles[folder] || []).forEach((file) => candidates.push(`${base}/${file}`));
      for (let set = 1; set <= 8; set++) {
        const group = String(set).padStart(2, "0");
        for (let image = 1; image <= 6; image++) {
          candidates.push(`${base}/${group}/${String(image).padStart(2, "0")}.webp`);
        }
      }
    });
    return candidates;
  }

  async function buildAvrupaPool(country = getCountryFromUrl()) {
    const key = normalizeCountry(country);
    if (!key || (!avrupaFolders[key] && !avrupaSemanticFallbacks[key])) return [];
    if (avrupaCache.has(key)) return avrupaCache.get(key);

    const promise = (async () => {
      const candidates = avrupaCandidates(country);
      const checks = await Promise.all(candidates.map(async (url) => ({ url, ok: await imageLoads(url) })));
      return checks.filter((item) => item.ok).map((item) => item.url);
    })();

    avrupaCache.set(key, promise);
    return promise;
  }

  async function fetchTours(country) {
    if (!country || !window.ApiService || typeof ApiService.getToursByDestination !== "function") return [];

    const lang = typeof getActiveLang === "function" ? getActiveLang() : "tr";
    try {
      const tours = await ApiService.getToursByDestination(country, lang);
      return Array.isArray(tours) ? tours : [];
    } catch (error) {
      console.warn("Country image pool could not load tours:", error);
      return [];
    }
  }

  async function buildPool(country = getCountryFromUrl()) {
    const key = country || "__missing_country__";
    if (cache.has(key)) return cache.get(key);

    const promise = (async () => {
      const tours = await fetchTours(country);
      const seen = new Set();
      const weighted = [];

      tours.forEach((tour, tourIndex) => {
        imageFields.forEach((field, fieldIndex) => {
          const url = tour[field];
          if (!isLocalTourPhoto(url) || seen.has(url)) return;
          seen.add(url);
          weighted.push({
            url,
            score: scoreImage(url) + Math.max(0, 12 - tourIndex) - fieldIndex,
          });
        });
      });

      weighted.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url, undefined, { numeric: true }));
      return weighted.map((item) => item.url);
    })();

    cache.set(key, promise);
    return promise;
  }

  async function pick(country, preferred, index = 0) {
    const avrupaPool = await buildAvrupaPool(country);
    if (avrupaPool.length) return avrupaPool[index % avrupaPool.length];
    if (isAvrupaPhoto(preferred)) return preferred.trim();
    if (isLocalTourPhoto(preferred)) return preferred.trim();
    const pool = await buildPool(country);
    return pool.length ? pool[index % pool.length] : "";
  }

  async function pickMany(country, preferredList, count) {
    const avrupaPool = await buildAvrupaPool(country);
    const seen = new Set();
    const result = [];
    const isAvrupaOnly = Boolean(avrupaFolders[normalizeCountry(country)] || avrupaSemanticFallbacks[normalizeCountry(country)]);

    avrupaPool.forEach((url) => {
      if (result.length < count) addUnique(result, seen, url);
    });
    if (isAvrupaOnly) return result.slice(0, count);

    const pool = await buildPool(country);
    (preferredList || []).forEach((url) => addUnique(result, seen, url));
    pool.forEach((url) => {
      if (result.length < count) addUnique(result, seen, url);
    });

    return result.slice(0, count);
  }

  window.CountryPageImages = {
    buildPool,
    buildAvrupaPool,
    pick,
    pickMany,
  };
})();
