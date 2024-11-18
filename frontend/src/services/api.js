// src/services/api.js
import axios from 'axios';

// Helper function to retrieve CSRF token from cookies
const getCsrfTokenFromCookie = () => {
    const match = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
    if (match) return match[2];
    return null;
};

// Create a centralized Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000', // Replace with your backend URL
    withCredentials: true, // Ensures cookies are sent with requests
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


export default api;
