//authentic_lebanese_sentiment_shop/frontend/src/services/orderService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const getOrders = async () => {
    const response = await axios.get(`${apiUrl}/orders`);
    return response.data;
};
