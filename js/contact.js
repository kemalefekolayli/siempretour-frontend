document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const statusMsg = document.getElementById('contactStatus');
    const isEn = () => (typeof getActiveLang === 'function' ? getActiveLang() : 'tr') === 'en';
    const text = (tr, en) => isEn() ? en : tr;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        // Validation
        if (!name || !email || !subject || !message) {
            showStatus(text('Lütfen tüm alanları doldurun.', 'Please fill in all fields.'), 'danger');
            return;
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
