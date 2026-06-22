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

  document.getElementById('placesVisited').textContent = tour.placesVisited || "";
  document.getElementById('generalInfo').innerHTML = tour.generalInfo || "";
  document.getElementById('whatExpect').innerHTML = tour.whatExpect || "";

  /* ✅ IMG FIX (innerHTML YOK) */
  const durationEl = document.getElementById('durationDays');
  if (durationEl) {
    durationEl.innerHTML =
    `<i class="fa fa-clock-o pink mr-1"></i>${tour.durationDays ?? ""} ${trEn('gün', 'days')}`;
  }

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
