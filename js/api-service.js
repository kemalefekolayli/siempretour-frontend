const API_BASE_URL = 'http://localhost:8080/api';

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
