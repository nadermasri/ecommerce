// src/services/orderService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Add a function to fetch orders with the authorization token
export const fetchOrders = async () => {
    const token = localStorage.getItem('authToken'); // Retrieve JWT token from local storage

    const response = await axios.get(`${apiUrl}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
export const createOrder = async (orderData) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiUrl}/orders/`, orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const updateOrderInfo = async (orderId, orderData) => {
    const token = localStorage.getItem('authToken'); // Retrieve the auth token
    const response = await axios.put(`${apiUrl}/orders/${orderId}/update_info`, orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const deleteOrder = async (orderId) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
