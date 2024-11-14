//services/orderService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Helper function for secure token retrieval
const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error("Authorization token is missing.");
    }
    return token;
};

// Fetch all orders with secure headers and error handling
export const fetchOrders = async () => {
    try {
        const response = await axios.get(`${apiUrl}/orders/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error.response?.data || new Error("Failed to fetch orders.");
    }
};

// Create a new order with input validation and error handling
export const createOrder = async (orderData) => {
    if (typeof orderData !== 'object') throw new Error("Invalid order data.");
    try {
        const response = await axios.post(`${apiUrl}/orders/`, orderData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error.response?.data || new Error("Failed to create order.");
    }
};

// Update order information with input validation and secure headers
export const updateOrderInfo = async (orderId, updateData) => {
    if (typeof orderId !== 'string' || typeof updateData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await axios.put(`${apiUrl}/orders/${encodeURIComponent(orderId)}/update_info`, updateData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating order info:", error);
        throw error.response?.data || new Error("Failed to update order info.");
    }
};

// Delete an order with input validation and error handling
export const deleteOrder = async (orderId) => {
    if (typeof orderId !== 'string') throw new Error("Invalid orderId.");
    try {
        const response = await axios.delete(`${apiUrl}/orders/${encodeURIComponent(orderId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error.response?.data || new Error("Failed to delete order.");
    }
};

// Track an order with input validation and error handling
export const trackOrder = async (orderId) => {
    if (typeof orderId !== 'string') throw new Error("Invalid orderId.");
    try {
        const response = await axios.get(`${apiUrl}/orders/track/${encodeURIComponent(orderId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error tracking order:", error);
        throw error.response?.data || new Error("Failed to track order.");
    }
};

// Return an item with input validation and error handling
export const returnItem = async (orderId, orderItemId, reason) => {
    if (typeof orderId !== 'string' || typeof orderItemId !== 'string' || typeof reason !== 'string') {
        throw new Error("Invalid input data.");
    }
    try {
        const response = await axios.post(
            `${apiUrl}/orders/${encodeURIComponent(orderId)}/return_item`,
            { order_item_id: orderItemId, reason },
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error returning item:", error);
        throw error.response?.data || new Error("Failed to return item.");
    }
};

// Fetch all returns with secure headers and error handling
export const fetchReturns = async () => {
    try {
        const response = await axios.get(`${apiUrl}/orders/returns`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data.returns;
    } catch (error) {
        console.error("Error fetching returns:", error);
        throw error.response?.data || new Error("Failed to fetch returns.");
    }
};

// Update return status with input validation and secure headers
export const updateReturnStatus = async (returnId, status) => {
    if (typeof returnId !== 'string' || typeof status !== 'string') throw new Error("Invalid input.");
    try {
        const response = await axios.put(
            `${apiUrl}/orders/returns/${encodeURIComponent(returnId)}`,
            { status },
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating return status:", error);
        throw error.response?.data || new Error("Failed to update return status.");
    }
};
