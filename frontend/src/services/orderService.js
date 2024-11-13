//authentic_lebanese_sentiment_shop/frontend/src/services/orderService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const getOrders = async () => {
    const response = await axios.get(`${apiUrl}/orders`);
    return response.data;
};

export const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${apiUrl}/orders/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
