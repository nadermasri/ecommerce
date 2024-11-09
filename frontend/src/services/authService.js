//authentic_lebanese_sentiment_shop/frontend/src/services/authService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const login = async (username, password) => {
    const response = await axios.post(`${apiUrl}/auth/login`, { username, password });
    return response.data;
};

export const logout = () => {
    // Clear token from local storage or perform any other logout operations.
};
