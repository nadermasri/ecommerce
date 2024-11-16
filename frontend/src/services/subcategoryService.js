// services/subcategoryService.js
import api from './api';

// Fetch subcategories with secure headers and error handling
export const fetchSubcategories = async () => {
    try {
        const response = await api.get(`/products/subcategories`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error.response?.data || new Error("Failed to fetch subcategories.");
    }
};

// Create a new subcategory with input validation and secure headers
export const createSubcategory = async (subcategoryData) => {
    if (typeof subcategoryData !== 'object') throw new Error("Invalid input data.");
    try {
        const response = await api.post(`/products/add_subcategories`, subcategoryData);
        return response.data;
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error.response?.data || new Error("Failed to create subcategory.");
    }
};

// Delete a subcategory with input validation and secure headers
export const deleteSubcategory = async (subcategoryId) => {
    if (typeof subcategoryId !== 'number') throw new Error("Invalid subcategoryId.");
    try {
        const response = await api.delete(`/products/subcategories/${encodeURIComponent(subcategoryId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        throw error.response?.data || new Error("Failed to delete subcategory.");
    }
};

// Update Subcategory Function
export const updateSubcategory = async (subcategoryId, updatedData) => {
    if (typeof subcategoryId !== 'number' || typeof updatedData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await api.put(`/products/subcategories/${encodeURIComponent(subcategoryId)}`, updatedData);
        return response.data;
    } catch (error) {
        console.error("Error updating subcategory:", error);
        throw error.response?.data || new Error("Failed to update subcategory.");
    }
};
