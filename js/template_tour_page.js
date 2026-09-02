function activeLang() {
  return typeof getActiveLang === 'function' ? getActiveLang() : (getQueryParam("lang") || "tr");
}

function isEnglishLang() {
  return activeLang() === "en";
}

function trEn(tr, en) {
  return isEnglishLang() ? en : tr;
}

function resolveAssetUrl(url) {
  return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
    ? window.AssetCdn.resolve(url)
    : url;
}

function renderDayInfo(dayInfo) {
  const container = document.getElementById('daysAccordion');
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(dayInfo) || dayInfo.length === 0) return;

  dayInfo.forEach((day, index) => {
    const isActive = index === 0 ? " active" : "";
    const display = index === 0 ? "block" : "none";

    const acc = document.createElement('div');
    acc.className = "accrodion" + isActive;
    const dayLabel = isEnglishLang()
      ? `Day ${day.dayNumber || index + 1}`
      : `${day.dayNumber || index + 1}. Gün`;

    acc.innerHTML = `
      <div class="accrodion-title rounded">
        <h5 class="mb-0">
          <span>${day.dayNumber || index + 1}. Gün</span> - ${day.title || ""}
        </h5>
      </div>
      <div class="accrodion-content" style="display:${display}">
        <div class="inner">
          <p>${day.description || ""}</p>
        </div>
      </div>
    `;
    const titleSpan = acc.querySelector('.accrodion-title span');
    if (titleSpan) titleSpan.textContent = dayLabel;

    container.appendChild(acc);
  });

  initAccordions();
}

function renderTour(tour) {
  if (tour.routeCoordinates) {
    renderRouteMap(tour.routeCoordinates);
}

  const destinationTr = typeof countryNameTr === 'function' ? countryNameTr(tour.destination || '') : (tour.destination || '');
  document.getElementById('currentDestination').textContent = destinationTr;
  document.getElementById('tourTitle').textContent = tour.tourName || "";
  document.getElementById('tourTitle2').textContent = tour.tourName || "";
  const selectedLang = typeof getSelectedLang === 'function' ? getSelectedLang() : activeLang();
  const bookingUrl = `booking.html?id=${encodeURIComponent(tour.slug || "")}&country=${encodeURIComponent(tour.destination || "")}${selectedLang !== "tr" ? `&lang=${encodeURIComponent(selectedLang)}` : ""}`;
  ["bookingBtn", "mobileBookingBtn"].forEach((id) => {
    const button = document.getElementById(id);
    if (button) button.href = bookingUrl;
  });

  // if (tour.mainPhoto) {
  //   document.getElementById('mainPhoto').style =
  //     `background-image:url(${tour.mainPhoto});`;
  // }

  const pdfBtn = document.getElementById('tourGuidePdfBtn');
  if (pdfBtn) {
    if (tour.detailPdfUrl) {
      pdfBtn.href = resolveAssetUrl(tour.detailPdfUrl);
      pdfBtn.classList.remove('d-none');
    } else {
      pdfBtn.classList.add('d-none');
      pdfBtn.removeAttribute('href');
    }
  }

  document.getElementById('placesVisited').textContent = tour.placesVisited || "";
  document.getElementById('generalInfo').innerHTML = tour.generalInfo || "";
  document.getElementById('whatExpect').innerHTML = tour.whatExpect || "";

  /* ✅ IMG FIX (innerHTML YOK) */
  const durationEl = document.getElementById('durationDays');
  if (durationEl) {
    durationEl.innerHTML =
    `<i class="fa fa-clock-o pink mr-1"></i>${tour.durationDays ?? ""} ${trEn('gün', 'days')}`;
  }

  // Min. Yaş / Buluşma Noktası / Kalkış Şehri: admin tur formunda dolduysa göster,
  // boşsa hücreyi tamamen gizle (boş etiketle "Min. Yaş : " gibi yarım görünmesin).
  const setOptionalInfoCell = (id, iconClass, text) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (text) {
      el.innerHTML = `<i class="fa ${iconClass} pink mr-1" aria-hidden="true"></i> ${escapeHtml(text)}`;
      el.classList.remove('d-none');
    } else {
      el.classList.add('d-none');
    }
  };
  setOptionalInfoCell('minimumAge', 'fa-user', tour.minimumAge ? `${trEn('Min. Yaş', 'Min. Age')} : ${tour.minimumAge}` : '');
  setOptionalInfoCell('tourMeetPoint', 'fa-map-marker', tour.meet);
  setOptionalInfoCell('tourDepartureCity', 'fa-plane', tour.departureCity);

  const setImg = (id, url) => {
    const img = document.getElementById(id);
    if (!img) return;
    img.src = resolveAssetUrl(url || "");
    img.alt = tour.imagealt || "";
  };

  ["1","2","3","4","5","6"].forEach(n => {
    setImg(`image${n}`, tour[`image${n}`]);
    setImg(`image${n}${n}`, tour[`image${n}`]);
  });

  renderDayInfo(tour.dayInfo);
  renderDepartures(tour);
  loadTourReviews(tour);

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(initTourSliders);
  } else {
    setTimeout(initTourSliders, 0);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtDepartureDateDetail(value) {
  if (!value) return "";
  const p = String(value).substring(0, 10).split("-");
  if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
  return String(value);
}

function renderDepartures(tour) {
  const section = document.getElementById("tourDeparturesSection");
  const list = document.getElementById("tourDeparturesList");
  if (!section || !list) return;
  const isEn = typeof isEnglishLang === "function" && isEnglishLang();
  const deps = Array.isArray(tour && tour.departures)
    ? tour.departures.filter(d => d && d.departureDate)
    : [];
  if (!deps.length) {
    section.style.display = "none";
    return;
  }
  const titleEl = document.getElementById("tourDeparturesTitle");
  if (titleEl) titleEl.textContent = isEn ? "Departure Dates & Prices" : "Kalkış Tarihleri ve Fiyatlar";

  list.innerHTML = deps.map(d => {
    let dateStr = fmtDepartureDateDetail(d.departureDate);
    if (d.returnDate) dateStr += ` – ${fmtDepartureDateDetail(d.returnDate)}`;
    const eff = (d.discountedPrice != null && d.discountedPrice !== "") ? d.discountedPrice
      : ((d.price != null && d.price !== "") ? d.price : (tour.price != null ? tour.price : null));
    const priceStr = (eff != null && eff !== "")
      ? `${Number(eff).toLocaleString("tr-TR")} €`
      : (isEn ? "Price to be determined" : "Fiyat Belirlenecek");
    const full = (d.availableSeats != null && d.availableSeats <= 0);
    const seatsStr = full
      ? `<span class="tour-departure-full">${isEn ? "Sold out" : "Doldu"}</span>`
      : (d.availableSeats != null ? `<span class="tour-departure-seats">${d.availableSeats} ${isEn ? "seats" : "kişilik"}</span>` : "");
    return `<div class="tour-departure-row">
      <span class="tour-departure-date"><i class="fa fa-calendar-alt"></i> ${escapeHtml(dateStr)}</span>
      ${priceStr ? `<span class="tour-departure-price">${escapeHtml(priceStr)}</span>` : ""}
      ${seatsStr}
    </div>`;
  }).join("");
  section.style.display = "";
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return `${"★".repeat(value)}${"☆".repeat(5 - value)}`;
}

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(isEnglishLang() ? "en-US" : "tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function hideTourReviews() {
  const section = document.getElementById("tour-reviews-section");
  const container = document.getElementById("tour-reviews-container");
  const ratingStars = document.getElementById("tourRatingStars");
  const reviewCount = document.getElementById("tourReviewCount");
  const sidebarTrust = document.getElementById("sidebarReviewTrust");

  if (section) section.classList.add("d-none");
  if (container) container.innerHTML = "";
  if (ratingStars) {
    ratingStars.innerHTML = "";
    ratingStars.classList.add("d-none");
  }
  if (reviewCount) {
    reviewCount.textContent = "";
    reviewCount.classList.add("d-none");
  }
  if (sidebarTrust) {
    sidebarTrust.innerHTML = "";
    sidebarTrust.classList.add("d-none");
  }
}

function renderTourReviews(reviews) {
  const section = document.getElementById("tour-reviews-section");
  const container = document.getElementById("tour-reviews-container");
  const ratingStars = document.getElementById("tourRatingStars");
  const reviewCount = document.getElementById("tourReviewCount");
  const sidebarTrust = document.getElementById("sidebarReviewTrust");
  if (!section || !container) return;

  const total = reviews.length;
  const average = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / total;
  const roundedAverage = Math.round(average);

  const items = reviews.map((review) => {
    const dateText = formatReviewDate(review.travelDate || review.approvedAt || review.createdAt);
    const guestLabel = trEn("Misafir", "Guest");
    const title = escapeHtml(review.title || trEn("Misafir yorumu", "Guest review"));
    const meta = dateText
      ? `${escapeHtml(review.guestName || guestLabel)} &nbsp;&nbsp; ${escapeHtml(dateText)}`
      : escapeHtml(review.guestName || guestLabel);

    return `
      <div class="comment-box">
        <div class="comment-content rounded">
          <h5 class="mb-1">${escapeHtml(review.guestName || guestLabel)}</h5>
          <p class="comment-date">${meta}</p>
          <div class="comment-rate">
            <div class="rating mar-right-15 text-warning" aria-label="${Number(review.rating) || 0} / 5">${renderStars(review.rating)}</div>
            <span class="comment-title">${title}</span>
          </div>
          <p class="comment">${escapeHtml(review.comment)}</p>
        </div>
      </div>
    `;
  }).join("");

  const reviewsTitle = trEn("Misafir Yorumları", "Guest Reviews");
  const verifiedGuestReviews = trEn(
    `${total} doğrulanmış misafir yorumu`,
    `${total} verified guest reviews`
  );
  const showingReviews = trEn(
    `${total} doğrulanmış misafir yorumu gösteriliyor`,
    `Showing ${total} verified guest reviews`
  );

  container.innerHTML = `
    <div class="review-box bg-title text-center py-4 p-2 rounded mb-4">
      <h2 class="mb-1 white"><span>${average.toFixed(1)}</span>/5</h2>
      <h4 class="white mb-1">${reviewsTitle}</h4>
      <p class="mb-0 white font-italic">${verifiedGuestReviews}</p>
    </div>
    <div class="single-comments single-box mb-4">
      <h5 class="border-b pb-2 mb-2">${showingReviews}</h5>
      ${items}
    </div>
  `;
  section.classList.remove("d-none");

  if (ratingStars && reviewCount) {
    ratingStars.innerHTML = renderStars(roundedAverage);
    ratingStars.classList.remove("d-none");
    reviewCount.textContent = trEn(`(${total} doğrulanmış yorum)`, `(${total} verified reviews)`);
    reviewCount.classList.remove("d-none");
  }

  if (sidebarTrust) {
    sidebarTrust.innerHTML = `
      <div class="sidebar-trust-stars">${renderStars(roundedAverage)}</div>
      <p class="sidebar-trust-text">${verifiedGuestReviews}</p>
    `;
    sidebarTrust.classList.remove("d-none");
  }
}

async function loadTourReviews(tour) {
  hideTourReviews();
  if (!tour || !tour.id || typeof ApiService === "undefined" || typeof ApiService.getReviewsByTour !== "function") return;

  const lang = typeof getActiveLang === 'function' ? getActiveLang() : (getQueryParam("lang") || "tr");
  try {
    const reviews = await ApiService.getReviewsByTour(tour.id, lang);
    if (!Array.isArray(reviews) || reviews.length === 0) return;
    renderTourReviews(reviews);
  } catch (err) {
    console.warn("Tur yorumları yüklenemedi:", err);
    hideTourReviews();
  }
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initTourSliders() {
  if (!window.jQuery || !jQuery.fn || !jQuery.fn.slick) return;

  const $store = jQuery('.slider-store');
  const $thumbs = jQuery('.slider-thumbs');

  if (!$store.length || !$thumbs.length) return;
  if (!$store.children().length || !$thumbs.children().length) return;

  if ($store.hasClass('slick-initialized')) $store.slick('unslick');
  if ($thumbs.hasClass('slick-initialized')) $thumbs.slick('unslick');

  $store.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    direction: 'vertical',
    arrows: false,
    dots: false,
    fade: true,
    autoplay: true,
    asNavFor: '.slider-thumbs'
  });

  $thumbs.slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: '.slider-store',
    dots: false,
    arrows: false,
    autoplay: true,
    direction: 'vertical',
    centerMode: true,
    focusOnSelect: true,
    responsive: [{
      breakpoint: 800,
      settings: {
        arrows: false
      }
    }]
  });

  $store.slick('setPosition');
  $thumbs.slick('setPosition');
}

/* 🔥 FINAL LOADER — Backend API */
async function loadTour() {
  const slug = getQueryParam("id"); // "id" param is actually the slug
  const lang = typeof getActiveLang === 'function' ? getActiveLang() : (getQueryParam("lang") || "tr");

  if (!slug) {
    console.error("id (slug) eksik");
    return;
  }

  try {
    const tour = await ApiService.getTourBySlug(slug, lang);
    if (!tour) {
      console.error("Tur bulunamadı:", slug);
      return;
    }
    renderTour(tour);
  } catch (err) {
    console.error("Tur yüklenirken hata:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadTour);

// ---- Yazdır (PDF) + Paylaş butonları ----
function showTourToast(msg) {
  var el = document.createElement("div");
  el.className = "tour-toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add("show"); });
  setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.remove(); }, 300); }, 2200);
}

// Yazdırırken haritayı küçült (tek sayfaya sığsın, noktalar küçülsün), sonra eski haline getir.
function shrinkTourMapForPrint() {
  var el = document.getElementById("mappp");
  if (!el || !window.tourMapInstance) return;
  document.body.classList.add("tour-printing");
  el.style.height = "300px";
  try { window.tourMapInstance.invalidateSize(); } catch (e) {}
  try {
    if (window.tourRouteBounds) window.tourMapInstance.fitBounds(window.tourRouteBounds, { padding: [8, 8] });
  } catch (e) {}
}
function restoreTourMapAfterPrint() {
  var el = document.getElementById("mappp");
  document.body.classList.remove("tour-printing");
  if (el) el.style.height = "";
  if (!window.tourMapInstance) return;
  try { window.tourMapInstance.invalidateSize(); } catch (e) {}
  try {
    if (window.tourRouteBounds) window.tourMapInstance.fitBounds(window.tourRouteBounds, { padding: [60, 60] });
  } catch (e) {}
}
// Ctrl+P için de (senkron, en iyi çaba)
window.addEventListener("beforeprint", shrinkTourMapForPrint);
window.addEventListener("afterprint", restoreTourMapAfterPrint);

document.addEventListener("DOMContentLoaded", function () {
  var printBtn = document.getElementById("tourPrintBtn");
  if (printBtn) printBtn.addEventListener("click", function () {
    // Haritayı küçült, tile'lar yüklensin diye kısa bekle, sonra yazdır.
    shrinkTourMapForPrint();
    setTimeout(function () { window.print(); }, 650);
  });

  var shareBtn = document.getElementById("tourShareBtn");
  if (shareBtn) shareBtn.addEventListener("click", async function () {
    var url = window.location.href;
    var titleEl = document.getElementById("tourTitle2");
    var title = (titleEl && titleEl.textContent.trim()) || document.title || "Siempre Tour";
    if (navigator.share) {
      try { await navigator.share({ title: title, text: title, url: url }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      showTourToast("Tur linki kopyalandı");
    } catch (e) {
      var t = document.createElement("textarea");
      t.value = url; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); showTourToast("Tur linki kopyalandı"); }
      catch (_) { prompt("Tur linki:", url); }
      document.body.removeChild(t);
    }
  });
});
