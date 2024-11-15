// frontend/src/services/authService.js
import api from './api';

// Login function
export const login = async (username, password) => {
    if (typeof username !== 'string' || typeof password !== 'string') {
        throw new Error("Invalid username or password.");
    }
    try {
        const response = await api.post('/user/login', { username, password });
        // No need to store the JWT token in localStorage
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error.response?.data || new Error("Failed to login.");
    }
};

// Logout function
export const logout = async () => {
    try {
        // Ensure your backend has a logout endpoint that clears the cookies
        await api.post('/user/logout');
    } catch (error) {
        console.error("Error during logout:", error);
        throw new Error("Failed to logout.");
    }
};
