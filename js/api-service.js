// API base resolved by environment.
// - Local dev (localhost/127.0.0.1/file://): talks to the local Spring Boot backend.
// - Production: talks to the deployed backend. UPDATE the domain below once the
//   Railway backend URL is known (replace PROD_BACKEND_ORIGIN).
const PROD_BACKEND_ORIGIN = 'https://REPLACE-WITH-RAILWAY-BACKEND-DOMAIN';
const API_BASE_URL = (function () {
    var h = (typeof window !== 'undefined' && window.location) ? window.location.hostname : '';
    var isLocal = h === '' || h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0';
    return (isLocal ? 'http://localhost:8080' : PROD_BACKEND_ORIGIN) + '/api';
})();

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
