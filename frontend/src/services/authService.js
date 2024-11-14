//authentic_lebanese_sentiment_shop/frontend/src/services/authService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Login function with input validation and error handling
export const login = async (username, password) => {
    if (typeof username !== 'string' || typeof password !== 'string') {
        throw new Error("Invalid username or password.");
    }
    try {
        const response = await axios.post(`${apiUrl}/user/login`, { username, password }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Store the auth token securely
        if (response.data && response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error.response?.data || new Error("Failed to login.");
    }
};

// Logout function to clear the auth token
export const logout = () => {
    try {
        localStorage.removeItem('authToken');
    } catch (error) {
        console.error("Error during logout:", error);
        throw new Error("Failed to logout.");
    }
};
