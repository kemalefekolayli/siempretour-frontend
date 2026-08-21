function bookingLang() {
  return typeof getActiveLang === 'function' ? getActiveLang() : (getQueryParam('lang') || 'tr');
}

function isBookingEnglish() {
  return bookingLang() === 'en';
}

function bookingText(tr, en) {
  return isBookingEnglish() ? en : tr;
}

function resolveAssetUrl(url) {
  return window.AssetCdn && typeof window.AssetCdn.resolve === 'function'
    ? window.AssetCdn.resolve(url)
    : url;
}

document.addEventListener("DOMContentLoaded", function () {

  // Phone formatting logic
  const phoneInput = document.querySelector('input[type="tel"]');

  if (phoneInput) {
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");

      if (value.startsWith("0")) {
        value = value.substring(1);
      }

      if (value.length > 10) {
        value = value.substring(0, 10);
      }

      let formatted = "";

      if (value.length > 0) formatted = "0" + value.substring(0, 3);
      if (value.length >= 4) formatted += " " + value.substring(3, 6);
      if (value.length >= 7) formatted += " " + value.substring(6, 8);
      if (value.length >= 9) formatted += " " + value.substring(8, 10);

      e.target.value = formatted;
    });
  }

  // Initialize Person Counter
  initPersonCounter();

  // Load Tour Data
  loadTourFromJson();

  // Prefill e-mail with the logged-in user's account e-mail (if available)
  (async () => {
    const emailInput = document.getElementById('booking-email');
    if (!emailInput || !localStorage.getItem('jwt_token')) return;
    try {
      const me = await ApiService.getMe();
      if (me?.email && !emailInput.value) emailInput.value = me.email;
    } catch (_) { /* not logged in / offline — leave empty */ }
  })();

  // Handle Booking Submission (triggered by form submit or bookingBtn click)
  const bookingForm = document.getElementById('booking-form');
  const bookingBtn = document.getElementById('bookingBtn');

  async function submitBooking() {
    const bookingName = document.getElementById('booking-name')?.value?.trim();
    const bookingSurname = document.getElementById('booking-surname')?.value?.trim();
    const bookingPhone = document.getElementById('booking-phone')?.value?.trim();
    const bookingEmail = document.getElementById('booking-email')?.value?.trim();
    const personCount = parseInt(document.getElementById('person-count')?.value, 10) || 1;

    // Tour slug from URL — id param is already a slug (e.g. "family-adventure-holiday-in-morzine-france")
    const tourSlug = getQueryParam('id');

    if (!bookingName || !bookingSurname || !bookingPhone || !bookingEmail) {
      alert(bookingText('Lütfen tüm alanları doldurunuz.', 'Please fill in all fields.'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail)) {
      alert(bookingText('Lütfen geçerli bir e-posta adresi giriniz.', 'Please enter a valid e-mail address.'));
      return;
    }

    if (!tourSlug) {
      alert(bookingText('Tur bilgisi bulunamadı. Lütfen tur sayfasından tekrar deneyin.', 'Tour information was not found. Please try again from the tour page.'));
      return;
    }

    // Kalkış tarihi seçimi (çoklu tarih varsa zorunlu)
    const departureWrap = document.getElementById('booking-departure-wrap');
    const departureSel = document.getElementById('booking-departure');
    let departureId = null;
    if (departureWrap && departureWrap.style.display !== 'none' && departureSel) {
      if (!departureSel.value) {
        alert(bookingText('Lütfen bir kalkış tarihi seçiniz.', 'Please select a departure date.'));
        return;
      }
      departureId = Number(departureSel.value);
    }

    // Check if user is logged in
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert(bookingText('Rezervasyon yapabilmek için giriş yapmalısınız.', 'Please log in to make a reservation.'));
      window.location.href = 'login.html';
      return;
    }

    // Extract tour details for auto-creation
    const tourNameRaw = document.getElementById('tour-name')?.innerText?.trim();
    const tourDestinationRaw = document.getElementById('tour-destination')?.innerText?.trim();
    const tourDurationRaw = document.getElementById('tour-duration')?.innerText
      ?.replace(/\s*(Gün|Gun|Days?)\s*$/i, '')
      ?.trim();

    const bookingData = {
      tourSlug: tourSlug,
      tourId: null,
      departureId: departureId,
      tourName: tourNameRaw,
      tourDestination: tourDestinationRaw,
      tourDuration: tourDurationRaw ? parseInt(tourDurationRaw, 10) : 1,

      numberOfPeople: personCount,
      userName: `${bookingName} ${bookingSurname}`,
      userPhone: bookingPhone,
      userEmail: bookingEmail,
      userMessage: ''
    };

    try {
      bookingBtn && (bookingBtn.disabled = true);
      bookingBtn && (bookingBtn.textContent = bookingText('Gönderiliyor...', 'Sending...'));
      const response = await ApiService.createBooking(bookingData);
      if (response) {
        window.location.href = 'thank_you.html';
      }
    } catch (error) {
      console.error(error);
      alert(bookingText('Rezervasyon oluşturulurken bir hata oluştu: ', 'There was an error creating the reservation: ') + error.message);
    } finally {
      if (bookingBtn) {
        bookingBtn.disabled = false;
        bookingBtn.innerHTML = `<i class="fa fa-lock me-2"></i> ${bookingText('Yerini Ayırt', 'Reserve Your Spot')}`;
      }
    }
  }

  // Attach to form submit
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitBooking();
    });
  }

  // Attach to booking button (outside the form)
  if (bookingBtn) {
    bookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitBooking();
    });
  }

});


// Seçili kalkışın (yoksa turun) kişi başı geçerli fiyatı. Özet tablosunda
// "Kişi Sayısı × Fiyat = Toplam" göstermek için kullanılır.
let bookingUnitPrice = null;
// Tur admin panelinden eklendiyse (adminCreated) gerçek fiyat gösterilir; değilse
// toplu içe aktarılan tur olduğundan "Fiyat Belirlenecek" gösterilir.
let bookingTourAdminCreated = false;

// İndirimli varsa o, yoksa normal fiyat (TourCardFormat ile aynı mantık).
function bookingEffPrice(o) {
  if (window.TourCardFormat && typeof window.TourCardFormat.effPrice === 'function') {
    return window.TourCardFormat.effPrice(o);
  }
  if (!o) return null;
  var d = o.discountedPrice;
  if (d != null && d !== '' && Number(d) > 0) return Number(d);
  var p = o.price;
  if (p != null && p !== '' && Number(p) > 0) return Number(p);
  return null;
}

function fmtTL(n) {
  return Number(n).toLocaleString('tr-TR') + ' €';
}

// Özet tablosundaki kişi başı fiyat + toplam satırlarını günceller.
function updateBookingTotal() {
  var count = parseInt((document.getElementById('person-count') || {}).value, 10) || 1;
  var unitRow = document.getElementById('booking-unit-price-row');
  var totalRow = document.getElementById('booking-total-row');
  var unitEl = document.getElementById('booking-unit-price');
  var totalEl = document.getElementById('booking-total');
  if (!unitRow || !totalRow || !unitEl || !totalEl) return;

  // Admin tarafından eklenmeyen turlarda fiyat gerçek değil → "Fiyat Belirlenecek".
  if (!bookingTourAdminCreated) {
    unitEl.textContent = isBookingEnglish() ? 'Price to be determined' : 'Fiyat Belirlenecek';
    unitRow.style.display = '';
    totalRow.style.display = 'none';
    return;
  }

  if (bookingUnitPrice == null || !(Number(bookingUnitPrice) > 0)) {
    // Fiyat bilgisi yoksa fiyat satırlarını gizle (yalnızca kişi sayısı görünür).
    unitRow.style.display = 'none';
    totalRow.style.display = 'none';
    return;
  }

  var total = count * Number(bookingUnitPrice);
  unitEl.textContent = fmtTL(bookingUnitPrice);
  totalEl.innerHTML = '<strong>' + count + ' × ' + fmtTL(bookingUnitPrice) + ' = ' + fmtTL(total) + '</strong>';
  unitRow.style.display = '';
  totalRow.style.display = '';
}

function initPersonCounter() {
  const input = document.getElementById('person-count');
  const input2 = document.getElementById('person-count-2');
  const decreaseBtn = document.getElementById('decreaseBtn');
  const increaseBtn = document.getElementById('increaseBtn');
  if (!input || !decreaseBtn || !increaseBtn) return;

  const syncInputs = () => {
    if (input2) {
      input2.textContent = input.value;
    }
    updateBookingTotal();
  };

  const normalizeValue = () => {
    const current = parseInt(input.value, 10);
    if (Number.isNaN(current) || current < 1) {
      input.value = '1';
    } else {
      input.value = String(current);
    }
    syncInputs();
    return parseInt(input.value, 10);
  };

  decreaseBtn.addEventListener('click', () => {
    const current = normalizeValue();
    input.value = String(Math.max(1, current - 1));
    syncInputs();
  });

  increaseBtn.addEventListener('click', () => {
    const current = normalizeValue();
    input.value = String(current + 1);
    syncInputs();
  });

  input.addEventListener('input', normalizeValue);
  normalizeValue();
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderTour(tour) {
  bookingTourAdminCreated = tour && tour.adminCreated === true;
  let tourUrl = `template_tour_page.html?id=${encodeURIComponent(tour.slug)}&country=${encodeURIComponent(tour.destination)}`;
  const lang = typeof getSelectedLang === 'function' ? getSelectedLang() : bookingLang();
  if (lang !== 'tr') tourUrl += `&lang=${encodeURIComponent(lang)}`;
  const mainPhoto = resolveAssetUrl(tour.mainPhoto || '');
  document.getElementById('tour-main-photo').innerHTML = `<a href="${tourUrl}" style="background-image: url(${mainPhoto})"></a>
                        <div class="color-overlay"></div>`;
  document.getElementById('tour-name').innerHTML = `<a href="${tourUrl}">${tour.tourName || tour.name}</a>`;
  const destTr = typeof countryNameTr === 'function' ? countryNameTr(tour.destination) : tour.destination;
  document.getElementById('tour-destination').innerHTML = `<i class="icon-location-pin"></i>${destTr}`;
  document.getElementById('tour-duration').innerHTML = `${tour.durationDays} ${bookingText('Gün', 'Days')}`;
  populateDepartures(tour);
}

function fmtBookingDate(value) {
  if (!value) return '';
  const p = String(value).substring(0, 10).split('-');
  if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
  return String(value);
}

function populateDepartures(tour) {
  const wrap = document.getElementById('booking-departure-wrap');
  const sel = document.getElementById('booking-departure');
  if (!wrap || !sel) return;
  const deps = Array.isArray(tour.departures)
    ? tour.departures.filter(d => d && d.departureDate)
    : [];
  if (!deps.length) {
    wrap.style.display = 'none';
    sel.innerHTML = '';
    // Kalkış yoksa fiyat tur seviyesinden alınır.
    bookingUnitPrice = bookingEffPrice(tour);
    updateBookingTotal();
    return;
  }
  sel.innerHTML = deps.map(d => {
    let label = fmtBookingDate(d.departureDate);
    if (d.returnDate) label += ` → ${fmtBookingDate(d.returnDate)}`;
    const eff = (d.discountedPrice != null && d.discountedPrice !== '') ? d.discountedPrice : d.price;
    if (eff != null && eff !== '') label += `  ·  ${Number(eff).toLocaleString('tr-TR')} €`;
    const full = (d.availableSeats != null && d.availableSeats <= 0);
    if (full) label += `  (${bookingText('DOLU', 'FULL')})`;
    return `<option value="${d.id}"${full ? ' disabled' : ''}>${label}</option>`;
  }).join('');
  wrap.style.display = '';

  // Seçili kalkışın fiyatını özet tablosuna yansıt; seçim değişince güncelle.
  const syncDeparturePrice = () => {
    const chosen = deps.find(d => String(d.id) === String(sel.value)) || deps[0];
    bookingUnitPrice = bookingEffPrice(chosen);
    updateBookingTotal();
  };
  sel.addEventListener('change', syncDeparturePrice);
  syncDeparturePrice();
}

async function loadTourFromJson() {
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
