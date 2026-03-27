document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const statusMsg = document.getElementById('contactStatus');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        // Validation
        if (!name || !email || !subject || !message) {
            showStatus('Lütfen tüm alanları doldurun.', 'danger');
            return;
        }

        if (!isValidEmail(email)) {
            showStatus('Lütfen geçerli bir e-posta adresi girin.', 'danger');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor...';

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
                showStatus('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
                form.reset();
            } else {
                const err = await response.text();
                showStatus('Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.', 'danger');
                console.error('Contact form error:', err);
            }
        } catch (err) {
            // Backend unavailable — fallback to mailto
            console.warn('Backend unavailable, falling back to mailto:', err.message);
            const mailtoLink = `mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                'Ad: ' + name + '\nE-posta: ' + email + '\n\n' + message
            )}`;
            window.location.href = mailtoLink;
            showStatus('Mail uygulamanız açılıyor...', 'warning');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mesaj Gönder';
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
