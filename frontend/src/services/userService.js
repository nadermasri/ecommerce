//authentic_lebanese_sentiment_shop/frontend/src/services/userService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const getUsers = async () => {
    const response = await axios.get(`${apiUrl}/users`);
    return response.data;
};
