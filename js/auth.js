document.addEventListener('DOMContentLoaded', () => {

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
                alert('Lütfen tüm alanları doldurun.');
                return;
            }

            try {
                const response = await ApiService.login(email, password);
                if (response && response.token) {
                    localStorage.setItem('jwt_token', response.token);
                    localStorage.setItem('user_info', JSON.stringify(response));
                    alert('Giriş başarılı!');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Giriş başarısız: ' + error.message);
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
                alert('Lütfen tüm zorunlu alanları doldurun.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor.');
                return;
            }

            if (termsBox && !termsBox.checked) {
                alert('Şartlar ve Gizlilik Politikasını kabul etmelisiniz.');
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
                    alert('Kayıt başarılı!');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Kayıt başarısız: ' + error.message);
            }
        });
    }

    // === Attach to ALL login forms (inline + modal) ===
    const loginForms = document.querySelectorAll('#loginForm, #contactform');
    loginForms.forEach(attachLoginHandler);

    // === Attach to ALL register forms (inline + modal) ===
    const registerForms = document.querySelectorAll('#registerFormInline, #contactform1');
    registerForms.forEach(attachRegisterHandler);

    // === Check if user is logged in (Simple UI update) ===
    const token = localStorage.getItem('jwt_token');
    if (token) {
        console.log("User is logged in");

        // Update login buttons to show logged-in state
        const loginButtons = document.querySelectorAll('.trip-button a, .log-reg-button-mobile a');
        loginButtons.forEach(btn => {
            if (btn.textContent.includes('Giriş') || btn.textContent.includes('Login') || btn.textContent.includes('Kayıt')) {
                btn.textContent = 'Hesabım';
                btn.href = '#';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Çıkış yapmak istiyor musunuz?')) {
                        localStorage.removeItem('jwt_token');
                        localStorage.removeItem('user_info');
                        window.location.reload();
                    }
                });
            }
        });
    }
});
