// frontend/src/services/orderService.js
import api from './api';

// Fetch all orders
export const fetchOrders = async () => {
    try {
        const response = await api.get(`/orders/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error.response?.data || new Error("Failed to fetch orders.");
    }
};

// Create a new order
export const createOrder = async (orderData) => {
    if (typeof orderData !== 'object') throw new Error("Invalid order data.");
    try {
        const response = await api.post(`/orders/`, orderData);
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error.response?.data || new Error("Failed to create order.");
    }
};

// Update order information
export const updateOrderInfo = async (orderId, updateData) => {
    if (typeof orderId !== 'number' || typeof updateData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await api.put(`/orders/${encodeURIComponent(orderId)}/update_info`, updateData);
        return response.data;
    } catch (error) {
        console.error("Error updating order info:", error);
        throw error.response?.data || new Error("Failed to update order info.");
    }
};

// Delete an order
export const deleteOrder = async (orderId) => {
    if (typeof orderId !== 'number') throw new Error("Invalid orderId.");
    try {
        const response = await api.delete(`/orders/${encodeURIComponent(orderId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error.response?.data || new Error("Failed to delete order.");
    }
};

// Track an order
export const trackOrder = async (orderId) => {
    if (typeof orderId !== 'number') throw new Error("Invalid orderId.");
    try {
        const response = await api.get(`/orders/track/${encodeURIComponent(orderId)}`);
        return response.data;
    } catch (error) {
        console.error("Error tracking order:", error);
        throw error.response?.data || new Error("Failed to track order.");
    }
};

// Return an item
export const returnItem = async (orderId, orderItemId, reason) => {
    if (typeof orderId !== 'number' || typeof orderItemId !== 'number' || typeof reason !== 'string') {
        throw new Error("Invalid input data.");
    }
    try {
        const response = await api.post(
            `/orders/${encodeURIComponent(orderId)}/return_item`,
            { order_item_id: orderItemId, reason }
        );
        return response.data;
    } catch (error) {
        console.error("Error returning item:", error);
        throw error.response?.data || new Error("Failed to return item.");
    }
};

// Fetch all returns
export const fetchReturns = async () => {
    try {
        const response = await api.get(`/orders/returns`);
        return response.data.returns;
    } catch (error) {
        console.error("Error fetching returns:", error);
        throw error.response?.data || new Error("Failed to fetch returns.");
    }
};

// Update return status
export const updateReturnStatus = async (returnId, status) => {
    if (typeof returnId !== 'number' || typeof status !== 'string') throw new Error("Invalid input.");
    try {
        const response = await api.put(
            `/orders/returns/${encodeURIComponent(returnId)}`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating return status:", error);
        throw error.response?.data || new Error("Failed to update return status.");
    }
};

// Fetch all products
export const fetchProducts = async () => {
    try {
        const response = await api.get(`/products/`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error.response?.data || new Error("Failed to fetch products.");
    }
};

// **Added Functions**

// Fetch orders for a specific user
export const fetchUserOrders = async (userId) => {
    if (typeof userId !== 'number') throw new Error("Invalid userId.");
    try {
        const response = await api.get(`/orders/user/${encodeURIComponent(userId)}`);
        return response.data.orders; // Adjust based on your API response
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error.response?.data || new Error("Failed to fetch user orders.");
    }
};

// Fetch details of a specific order
export const fetchOrderDetails = async (orderId) => {
    if (typeof orderId !== 'number') throw new Error("Invalid orderId.");
    try {
        const response = await api.get(`/orders/${encodeURIComponent(orderId)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order details:", error);
        throw error.response?.data || new Error("Failed to fetch order details.");
    }
};

// Place a new order (alias for createOrder)
export const placeOrder = async (orderData) => {
    return await createOrder(orderData);
};
