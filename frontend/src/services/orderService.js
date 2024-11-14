// src/services/orderService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// New function to create an order
export const createOrder = async (orderData) => {
    const token = localStorage.getItem('authToken');
    {
        const response = await axios.post(`${apiUrl}/orders/`, orderData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } 
};


export const updateOrderInfo = async (orderId, updateData) => {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.put(`${apiUrl}/orders/${orderId}/update_info`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Delete order function
export const deleteOrder = async (orderId) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiUrl}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const trackOrder = async (orderId) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${apiUrl}/orders/track/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error tracking order:", error);
        throw error;
    }
};


export const returnItem = async (orderId, orderItemId, reason) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.post(
            `${apiUrl}/orders/${orderId}/return_item`,
            { order_item_id: orderItemId, reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error returning item:", error);
        throw error;
    }
};

export const fetchReturns = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/orders/returns`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.returns;
};

export const updateReturnStatus = async (returnId, status) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
        `${apiUrl}/orders/returns/${returnId}`,
        { status },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
