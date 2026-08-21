// Backend origin — iki adlandirilmis hedef, anlik degistirilebilir:
//   LOCAL_BACKEND_ORIGIN   -> lokal Spring Boot backend (gelistirme)
//   RAILWAY_BACKEND_ORIGIN -> Railway'de yayindaki backend (production)
// Cozumleme sirasi:
//   1) localStorage('backendEnv') === 'local'|'railway' ise o kazanir
//      (ileride super-admin panelindeki gecis dugmesi bunu kullanacak).
//   2) Aksi halde hostname'e gore otomatik (localhost -> LOCAL, diger -> RAILWAY).
const LOCAL_BACKEND_ORIGIN   = 'http://localhost:8080';
const RAILWAY_BACKEND_ORIGIN = 'https://backend-production-56c81.up.railway.app';

function resolveBackendOrigin() {
    try {
        var ov = (typeof localStorage !== 'undefined') ? localStorage.getItem('backendEnv') : null;
        if (ov === 'local')   return LOCAL_BACKEND_ORIGIN;
        if (ov === 'railway') return RAILWAY_BACKEND_ORIGIN;
    } catch (e) { /* localStorage erisilemez */ }
    var h = (typeof window !== 'undefined' && window.location) ? window.location.hostname : '';
    var isLocal = h === '' || h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
    return isLocal ? LOCAL_BACKEND_ORIGIN : RAILWAY_BACKEND_ORIGIN;
}

const BACKEND_ORIGIN = resolveBackendOrigin();
const API_BASE_URL = BACKEND_ORIGIN + '/api';

// Ileride admin panelinden cagrilacak yardimci:
//   window.SiempreBackend.setEnv('local'|'railway'|'auto')
if (typeof window !== 'undefined') {
    window.SiempreBackend = {
        LOCAL: LOCAL_BACKEND_ORIGIN,
        RAILWAY: RAILWAY_BACKEND_ORIGIN,
        current: BACKEND_ORIGIN,
        getEnv: function () {
            try { return localStorage.getItem('backendEnv') || 'auto'; } catch (e) { return 'auto'; }
        },
        setEnv: function (env) {
            try {
                if (env === 'auto') localStorage.removeItem('backendEnv');
                else localStorage.setItem('backendEnv', env);
            } catch (e) { /* yok say */ }
            if (typeof location !== 'undefined') location.reload();
        }
    };
}

class ApiService {
    static async request(endpoint, method = 'GET', body = null, auth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (auth) {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

            if (!response.ok) {
                // Try to parse error message from JSON, fallback to status text
                let errorMessage = response.statusText;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // ignore json parse error
                }
                throw new Error(errorMessage);
            }

            // For successful empty responses (like 204 No Content), return null
            if (response.status === 204) return null;

            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    static async upload(endpoint, formData, auth = true) {
        const headers = {};

        if (auth) {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            let errorMessage = response.statusText || `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch (e) {
                // ignore json parse error
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }

        return response.status === 204 ? null : response.json();
    }

    static query(params = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });
        const text = query.toString();
        return text ? `?${text}` : '';
    }

    // Auth
    static async login(email, password) {
        return this.request('/auth/login', 'POST', { email, password });
    }

    static async register(registerData) {
        return this.request('/auth/register', 'POST', registerData);
    }

    static async getMe() {
        return this.request('/auth/me', 'GET', null, true);
    }

    // Admin
    static async adminSummary(params = {}) {
        return this.request(`/admin/analytics/summary${this.query(params)}`, 'GET', null, true);
    }

    static async adminRequestsOverTime(params = {}) {
        return this.request(`/admin/analytics/requests-over-time${this.query(params)}`, 'GET', null, true);
    }

    static async adminTopTours(params = {}) {
        return this.request(`/admin/analytics/top-tours${this.query(params)}`, 'GET', null, true);
    }

    static async adminTopCategories(params = {}) {
        return this.request(`/admin/analytics/top-categories${this.query(params)}`, 'GET', null, true);
    }

    static async adminRequests(params = {}) {
        return this.request(`/admin/requests${this.query(params)}`, 'GET', null, true);
    }

    static async adminContactMessages(params = {}) {
        return this.request(`/admin/contact-messages${this.query(params)}`, 'GET', null, true);
    }

    static async adminMetadata() {
        return this.request('/admin/metadata', 'GET', null, true);
    }

    static async adminTours(params = {}) {
        return this.request(`/admin/tours${this.query(params)}`, 'GET', null, true);
    }

    static async adminTour(tourId) {
        return this.request(`/admin/tours/${encodeURIComponent(tourId)}`, 'GET', null, true);
    }

    static async adminCreateTour(tourData) {
        return this.request('/admin/tours', 'POST', tourData, true);
    }

    static async adminUpdateTour(tourId, tourData) {
        return this.request(`/admin/tours/${encodeURIComponent(tourId)}`, 'PUT', tourData, true);
    }

    static async adminDeactivateTour(tourId) {
        return this.request(`/admin/tours/${encodeURIComponent(tourId)}/deactivate`, 'POST', {}, true);
    }

    static async adminDeleteCheck(tourId) {
        return this.request(`/admin/tours/${encodeURIComponent(tourId)}/delete-check`, 'GET', null, true);
    }

    static async adminPermanentlyDeleteTour(tourId) {
        return this.request(`/admin/tours/${encodeURIComponent(tourId)}/permanent`, 'DELETE', null, true);
    }

    static async adminUploadTourImages(files) {
        const formData = new FormData();
        Array.from(files || []).forEach(file => formData.append('files', file));
        return this.upload('/admin/tours/images', formData, true);
    }

    // Bookings
    static async createBooking(bookingData) {
        return this.request('/bookings', 'POST', bookingData, true); // Assuming booking requires auth? Or maybe not? Check controller. 
        // Based on analysis, createBooking might not strictly require auth if it's for public, 
        // but typically booking associated with a user account is better. 
        // The Controller seemed to just take BookingRequestDto. 
        // Let's assume it can work without auth for now (or maybe with), 
        // but looking at DTO it has userName/Phone so it might be open.
        // However, if we have a token, we should send it.
    }

    static async getMyBookings() {
        return this.request('/bookings/me', 'GET', null, true);
    }

    // Admin: rezervasyon arama + yönetim
    static async adminSearchBookings(params = {}) {
        return this.request(`/bookings/search${this.query(params)}`, 'GET', null, true);
    }

    static async approveBooking(bookingId, dto = {}) {
        return this.request(`/bookings/${encodeURIComponent(bookingId)}/approve`, 'POST', dto, true);
    }

    static async rejectBooking(bookingId, dto = {}) {
        return this.request(`/bookings/${encodeURIComponent(bookingId)}/reject`, 'POST', dto, true);
    }

    static async cancelBooking(bookingId) {
        return this.request(`/bookings/${encodeURIComponent(bookingId)}/cancel`, 'POST', {}, true);
    }

    // Admin: rezervasyonu kalıcı olarak sil
    static async deleteBooking(bookingId) {
        return this.request(`/bookings/${encodeURIComponent(bookingId)}`, 'DELETE', null, true);
    }

    // Ships (gemi bilgileri) — okuma public, yazma admin
    static async listShips() {
        return this.request('/ships', 'GET', null, true);
    }
    static async getShip(slug) {
        return this.request(`/ships/${encodeURIComponent(slug)}`, 'GET', null, false);
    }
    static async listShipCompanies() {
        return this.request('/ships/companies', 'GET', null, true);
    }
    static async createShip(dto) {
        return this.request('/ships', 'POST', dto, true);
    }
    static async updateShip(slug, dto) {
        return this.request(`/ships/${encodeURIComponent(slug)}`, 'PUT', dto, true);
    }
    static async deleteShip(slug) {
        return this.request(`/ships/${encodeURIComponent(slug)}`, 'DELETE', null, true);
    }
    static async uploadShipImages(files) {
        const formData = new FormData();
        Array.from(files || []).forEach(file => formData.append('files', file));
        return this.upload('/ships/images', formData, true);
    }

    // Tours
    static async getToursByDestination(destination, lang = 'tr', category = null) {
        let endpoint = `/tours/by-destination?destination=${encodeURIComponent(destination)}&lang=${encodeURIComponent(lang)}`;
        if (category) {
            endpoint += `&category=${encodeURIComponent(category)}`;
        }
        return this.request(endpoint);
    }

    static async getTourBySlug(slug, lang = 'tr') {
        return this.request(`/tours/by-slug/${encodeURIComponent(slug)}?lang=${encodeURIComponent(lang)}`);
    }

    static async filterTours(filterDto, page = 0, size = 50) {
        return this.request(`/tours/filter?page=${page}&size=${size}`, 'POST', filterDto);
    }

    // Homepage (dynamic index.html sections)
    static async getHomepage(lang = 'tr') {
        return this.request(`/homepage?lang=${encodeURIComponent(lang)}`);
    }

    static async adminGetHomepage() {
        return this.request('/admin/homepage', 'GET', null, true);
    }

    static async adminSaveHomepage(config) {
        return this.request('/admin/homepage', 'PUT', config, true);
    }

    // Reviews
    static async getReviewsByTour(tourId, lang = 'tr') {
        return this.request(`/reviews/by-tour/${encodeURIComponent(tourId)}?lang=${encodeURIComponent(lang)}`);
    }

    static async getReviewsByDestination(destination, lang = 'tr') {
        return this.request(`/reviews/by-destination?destination=${encodeURIComponent(destination)}&lang=${encodeURIComponent(lang)}`);
    }

    static async createReview(reviewData) {
        return this.request('/reviews', 'POST', reviewData);
    }
}
