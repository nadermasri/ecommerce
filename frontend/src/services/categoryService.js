// services/categoryService.js
import api from './api';

// Fetch categories with secure headers and error handling
export const fetchCategories = async () => {
    try {
        const response = await api.get(`/products/categories`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error.response?.data || new Error("Failed to fetch categories.");
    }
};

// Create a new category with input validation and secure headers
export const createCategory = async (categoryData) => {
    if (typeof categoryData !== 'object') throw new Error("Invalid category data.");
    try {
        const response = await api.post(`/products/add_categories`, categoryData);
        return response.data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error.response?.data || new Error("Failed to create category.");
    }
};

// Delete a category with input validation and secure headers
export const deleteCategory = async (categoryId) => {
    if (typeof categoryId !== 'string') throw new Error("Invalid categoryId.");
    try {
        const response = await api.delete(`/products/categories/${encodeURIComponent(categoryId)}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error.response?.data || new Error("Failed to delete category.");
    }
};
