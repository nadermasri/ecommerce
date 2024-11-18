import api from './api';

// Fetch all promotions
export const fetchPromotions = async () => {
    try {
        const response = await api.get('/promotions/');
        return response.data;
    } catch (error) {
        console.error("Error fetching promotions:", error);
        throw error.response?.data || new Error("Failed to fetch promotions.");
    }
};

// Create a new promotion
export const createPromotion = async (promotionData) => {
    if (typeof promotionData !== 'object') throw new Error("Invalid promotion data.");
    try {
        const response = await api.post('/promotions/', promotionData);
        return response.data;
    } catch (error) {
        console.error("Error creating promotion:", error);
        throw error.response?.data || new Error("Failed to create promotion.");
    }
};

// Update a promotion
export const updatePromotion = async (promotionId, updatedData) => {
    if (typeof promotionId !== 'number' || typeof updatedData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await api.put(`/promotions/${encodeURIComponent(promotionId)}`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Error updating promotion:", error);
        throw error.response?.data || new Error("Failed to update promotion.");
    }
};

// Delete a promotion
export const deletePromotion = async (promotionId) => {
    if (typeof promotionId !== 'number') throw new Error("Invalid promotionId.");
    try {
        const response = await api.delete(`/promotions/${encodeURIComponent(promotionId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting promotion:", error);
        throw error.response?.data || new Error("Failed to delete promotion.");
    }
};
