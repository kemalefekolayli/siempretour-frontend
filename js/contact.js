document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const statusMsg = document.getElementById('contactStatus');
    const isEn = () => (typeof getActiveLang === 'function' ? getActiveLang() : 'tr') === 'en';
    const text = (tr, en) => isEn() ? en : tr;

    // ---- Konu = "Turlar" seçilince açılan, hem yazarak hem listeden
    // seçilebilen tur arama alanı ----
    const subjectSelect = document.getElementById('contactSubject');
    const tourPickerWrap = document.getElementById('contactTourPickerWrap');
    const tourSearchInput = document.getElementById('contactTourSearch');
    const tourList = document.getElementById('contactTourList');
    let selectedTour = null; // { id, name, destination }
    let tourSearchTimer = null;
    let tourSearchSeq = 0;

    function closeTourList() {
        tourList.hidden = true;
        tourList.innerHTML = '';
    }

    function renderTourResults(tours) {
        if (!tours.length) {
            tourList.innerHTML = '<div class="tour-picker-empty">' + text('Sonuç bulunamadı.', 'No results found.') + '</div>';
            tourList.hidden = false;
            return;
        }
        tourList.innerHTML = tours.map(function (t) {
            const dest = (typeof countryNameTr === 'function' && t.destination) ? countryNameTr(t.destination) : (t.destination || '');
            return '<div class="tour-picker-item" data-id="' + t.id + '" data-name="' + escapeHtml(t.tourName || t.name || '') + '">' +
                escapeHtml(t.tourName || t.name || '') +
                (dest ? '<small>' + escapeHtml(dest) + '</small>' : '') +
                '</div>';
        }).join('');
        tourList.hidden = false;
        tourList.querySelectorAll('.tour-picker-item').forEach(function (el) {
            el.addEventListener('mousedown', function (e) {
                e.preventDefault();
                selectedTour = { id: el.dataset.id, name: el.dataset.name };
                tourSearchInput.value = el.dataset.name;
                closeTourList();
            });
        });
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function searchTours(query) {
        if (typeof ApiService === 'undefined') return;
        const seq = ++tourSearchSeq;
        const lang = typeof getActiveLang === 'function' ? getActiveLang() : 'tr';
        const filter = { isActive: true, language: lang };
        if (query) filter.name = query;
        ApiService.filterTours(filter, 0, 20, 'createdAt', 'desc').then(function (res) {
            if (seq !== tourSearchSeq) return; // eskimiş yanıt, yok say
            renderTourResults((res && res.content) || []);
        }).catch(function () {
            if (seq !== tourSearchSeq) return;
            tourList.innerHTML = '<div class="tour-picker-empty">' + text('Turlar yüklenemedi.', 'Could not load tours.') + '</div>';
            tourList.hidden = false;
        });
    }

    if (subjectSelect) {
        subjectSelect.addEventListener('change', function () {
            const isTours = subjectSelect.value === 'Turlar';
            tourPickerWrap.classList.toggle('d-none', !isTours);
            if (!isTours) {
                selectedTour = null;
                tourSearchInput.value = '';
                closeTourList();
            }
        });
    }

    if (tourSearchInput) {
        tourSearchInput.addEventListener('input', function () {
            selectedTour = null;
            clearTimeout(tourSearchTimer);
            const q = tourSearchInput.value.trim();
            tourSearchTimer = setTimeout(function () { searchTours(q); }, 300);
        });
        tourSearchInput.addEventListener('focus', function () {
            if (tourList.hidden) searchTours(tourSearchInput.value.trim());
        });
        tourSearchInput.addEventListener('blur', function () {
            setTimeout(closeTourList, 150);
        });
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        let subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        // Validation
        if (!name || !email || !subject || !message) {
            showStatus(text('Lütfen tüm alanları doldurun.', 'Please fill in all fields.'), 'danger');
            return;
        }

        if (subject === 'Turlar') {
            if (!selectedTour) {
                showStatus(text('Lütfen listeden bir tur seçin.', 'Please select a tour from the list.'), 'danger');
                return;
            }
            subject = 'Turlar: ' + selectedTour.name;
        }

        if (!isValidEmail(email)) {
            showStatus(text('Lütfen geçerli bir e-posta adresi girin.', 'Please enter a valid email address.'), 'danger');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = text('Gönderiliyor...', 'Sending...');

        try {
            const response = await fetch(API_BASE_URL + '/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                })
            });

            if (response.ok) {
                showStatus(text('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'Your message has been sent successfully. We will get back to you as soon as possible.'), 'success');
                form.reset();
                selectedTour = null;
                tourPickerWrap.classList.add('d-none');
                closeTourList();
            } else {
                const err = await response.text();
                showStatus(text('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.', 'The message could not be sent. Please try again later.'), 'danger');
                console.error('Contact form error:', err);
            }
        } catch (err) {
            // Backend unavailable — fallback to mailto
            console.warn('Backend unavailable, falling back to mailto:', err.message);
            const mailtoLink = `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                text('Ad: ', 'Name: ') + name + '\n' + text('E-posta: ', 'Email: ') + email + '\n\n' + message
            )}`;
            window.location.href = mailtoLink;
            showStatus(text('Mail uygulamanız açılıyor...', 'Opening your mail app...'), 'warning');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = text('Mesaj Gönder', 'Send Message');
        }
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showStatus(msg, type) {
        statusMsg.className = 'alert alert-' + type + ' mt-3';
        statusMsg.textContent = msg;
        statusMsg.style.display = 'block';
        if (type === 'success') {
            setTimeout(function () {
                statusMsg.style.display = 'none';
            }, 5000);
        }
    }
});
