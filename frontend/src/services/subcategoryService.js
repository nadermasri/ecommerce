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
    if (typeof subcategoryId !== 'string') throw new Error("Invalid subcategoryId.");
    try {
        const response = await api.delete(`/products/subcategories/${encodeURIComponent(subcategoryId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        throw error.response?.data || new Error("Failed to delete subcategory.");
    }
};
