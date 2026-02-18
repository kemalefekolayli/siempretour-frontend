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

  // Handle Booking Submission (triggered by form submit or bookingBtn click)
  const bookingForm = document.getElementById('booking-form');
  const bookingBtn = document.getElementById('bookingBtn');

  async function submitBooking() {
    const bookingName = document.getElementById('booking-name')?.value?.trim();
    const bookingSurname = document.getElementById('booking-surname')?.value?.trim();
    const bookingPhone = document.getElementById('booking-phone')?.value?.trim();
    const personCount = parseInt(document.getElementById('person-count')?.value, 10) || 1;

    // Tour slug from URL — id param is already a slug (e.g. "family-adventure-holiday-in-morzine-france")
    const tourSlug = getQueryParam('id');

    if (!bookingName || !bookingSurname || !bookingPhone) {
      alert('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (!tourSlug) {
      alert('Tur bilgisi bulunamadı. Lütfen tur sayfasından tekrar deneyin.');
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('Rezervasyon yapabilmek için giriş yapmalısınız.');
      window.location.href = 'login.html';
      return;
    }

    // Extract tour details for auto-creation
    const tourNameRaw = document.getElementById('tour-name')?.innerText?.trim();
    const tourDestinationRaw = document.getElementById('tour-destination')?.innerText?.trim();
    const tourPriceRaw = document.getElementById('tour-price')?.innerText?.replace('$', '')?.replace(',', '')?.trim();
    const tourDurationRaw = document.getElementById('tour-duration')?.innerText?.replace(' Gün', '')?.trim();

    const bookingData = {
      tourSlug: tourSlug,
      tourId: null,
      // Auto-creation fields
      tourName: tourNameRaw,
      tourDestination: tourDestinationRaw,
      tourPrice: tourPriceRaw ? parseFloat(tourPriceRaw) : 0,
      tourDuration: tourDurationRaw ? parseInt(tourDurationRaw, 10) : 1,

      numberOfPeople: personCount,
      userName: `${bookingName} ${bookingSurname}`,
      userPhone: bookingPhone,
      userMessage: ''
    };

    try {
      bookingBtn && (bookingBtn.disabled = true);
      bookingBtn && (bookingBtn.textContent = 'Gönderiliyor...');
      const response = await ApiService.createBooking(bookingData);
      if (response) {
        window.location.href = 'thank_you.html';
      }
    } catch (error) {
      console.error(error);
      alert('Rezervasyon oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      if (bookingBtn) {
        bookingBtn.disabled = false;
        bookingBtn.innerHTML = '<i class="fa fa-lock me-2"></i> Yerini Ayırt';
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
  const tourUrl = `template_tour_page.html?id=${tour.id}&country=${tour.destination}`;
  document.getElementById('tour-main-photo').innerHTML = `<a href="${tourUrl}" style="background-image: url(${tour.mainPhoto})"></a>
                        <div class="color-overlay"></div>`;
  document.getElementById('tour-name').innerHTML = `<a href="${tourUrl}">${tour.tourName}</a>`;
  document.getElementById('tour-destination').innerHTML = `<i class="icon-location-pin"></i>${tour.destination}`;
  document.getElementById('tour-duration').innerHTML = `${tour.durationDays} Gün`;
  document.getElementById('tour-price').innerHTML = `$${tour.price}`;
  document.getElementById('tour-price-big').innerHTML = `$${tour.price}`;
}

async function loadTourFromJson() {
  const id = getQueryParam("id");
  const country = getQueryParam("country");

  if (!id || !country) {
    console.error("id veya country eksik");
    return;
  }

  const dataRoot = "./data/big_siempre_tour_tours";
  const url = `${dataRoot}/${country}/tours.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Tours.json yüklenemedi");
    }

    const tours = await res.json();
    if (!Array.isArray(tours)) {
      throw new Error("Geçersiz JSON");
    }

    const tour = tours.find(t => String(t.id) === String(id));
    if (!tour) {
      console.error("Tur bulunamadı:", id);
      return;
    }

    renderTour(tour);

  } catch (err) {
    console.error("Tur yüklenirken hata:", err);
  }
}
