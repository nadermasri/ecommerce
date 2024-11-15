// frontend/src/services/api.js
import axios from 'axios';

// Helper function to retrieve CSRF token from cookies
const getCsrfTokenFromCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
    if (match) return match[2];
    return null;
};

// Create a centralized Axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000',
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios request interceptor to include CSRF token
api.interceptors.request.use(
    (config) => {
        const csrfToken = getCsrfTokenFromCookie();
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Remove or comment out the response interceptor to prevent redirect loops
/*
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Redirect to login page
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
*/

export default api;
