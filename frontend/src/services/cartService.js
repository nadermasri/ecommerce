// frontend/src/services/cartService.js

import api from './api';

// Fetch cart items
export const getCartItems = async () => {
    try {
        const response = await api.get('/cart/');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error.response?.data || new Error("Failed to fetch cart items.");
    }
};

// Add item to cart
export const addToCart = async (productId, quantity) => {
    try {
        const response = await api.post('/cart/add', { product_id: productId, quantity });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error.response?.data || new Error("Failed to add to cart.");
    }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
    try {
        const response = await api.delete(`/cart/remove/${encodeURIComponent(itemId)}`);
        return response.data;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error.response?.data || new Error("Failed to remove from cart.");
    }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await api.put(`/cart/update/${encodeURIComponent(itemId)}`, { quantity });
        return response.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        throw error.response?.data || new Error("Failed to update cart item.");
    }
};

// Clear cart after checkout
export const clearCart = async () => {
    try {
        const response = await api.post('/cart/clear');
        return response.data;
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw error.response?.data || new Error("Failed to clear cart.");
    }
};
