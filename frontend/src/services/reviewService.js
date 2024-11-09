//authentic_lebanese_sentiment_shop/frontend/src/services/reviewService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const getReviews = async () => {
    const response = await axios.get(`${apiUrl}/reviews`);
    return response.data;
};
