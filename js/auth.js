document.addEventListener('DOMContentLoaded', () => {
    const isEn = () => (typeof getActiveLang === 'function' ? getActiveLang() : 'tr') === 'en';
    const text = (tr, en) => isEn() ? en : tr;

    // === Helper: Attach login handler to a form ===
    function attachLoginHandler(form) {
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Find email/password inputs within THIS form
            const emailInput = form.querySelector('input[name="email"], input[type="email"], input[id="fname"], input[id="login_email"]');
            const passwordInput = form.querySelector('input[type="password"]');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                alert(text('Lütfen tüm alanları doldurun.', 'Please fill in all fields.'));
                return;
            }

            try {
                const response = await ApiService.login(email, password);
                if (response && response.token) {
                    localStorage.setItem('jwt_token', response.token);
                    localStorage.setItem('user_info', JSON.stringify(response));
                    alert(text('Giriş başarılı!', 'Login successful!'));
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert(text('Giriş başarısız: ', 'Login failed: ') + error.message);
            }
        });
    }

    // === Helper: Attach register handler to a form ===
    function attachRegisterHandler(form) {
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Find inputs within THIS form by name or type
            const firstNameInput = form.querySelector('input[name="first_name"]');
            const lastNameInput = form.querySelector('input[name="last_name"]');
            const phoneInput = form.querySelector('input[name="phone_number"]');
            const emailInput = form.querySelector('input[name="email"]');
            const passwordInputs = form.querySelectorAll('input[type="password"]');
            const termsBox = form.querySelector('input[type="checkbox"]');

            const firstName = firstNameInput ? firstNameInput.value.trim() : '';
            const lastName = lastNameInput ? lastNameInput.value.trim() : '';
            const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInputs[0] ? passwordInputs[0].value : '';
            const confirmPassword = passwordInputs[1] ? passwordInputs[1].value : '';

            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                alert(text('Lütfen tüm zorunlu alanları doldurun.', 'Please fill in all required fields.'));
                return;
            }

            if (password !== confirmPassword) {
                alert(text('Şifreler eşleşmiyor.', 'Passwords do not match.'));
                return;
            }

            if (termsBox && !termsBox.checked) {
                alert(text('Şartlar ve Gizlilik Politikasını kabul etmelisiniz.', 'You must accept the Terms and Privacy Policy.'));
                return;
            }

            const registerData = {
                firstName,
                lastName,
                phoneNumber,
                email,
                password
            };

            try {
                const response = await ApiService.register(registerData);
                if (response && response.token) {
                    localStorage.setItem('jwt_token', response.token);
                    localStorage.setItem('user_info', JSON.stringify(response));
                    alert(text('Kayıt başarılı!', 'Registration successful!'));
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert(text('Kayıt başarısız: ', 'Registration failed: ') + error.message);
            }
        });
    }

    // === Attach to ALL login forms (inline + modal) ===
    const loginForms = document.querySelectorAll('#loginForm, #contactform');
    loginForms.forEach(attachLoginHandler);

    // === Attach to ALL register forms (inline + modal) ===
    const registerForms = document.querySelectorAll('#registerFormInline, #contactform1');
    registerForms.forEach(attachRegisterHandler);

    // Navbar logged-in state (profile button, logout) is handled by js/navbar-user.js
    // across all pages — kept centralized to avoid duplicate, inconsistent UI.
});
