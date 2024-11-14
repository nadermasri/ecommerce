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

// Fetch categories with secure headers and error handling
export const fetchCategories = async () => {
    try {
        const response = await axios.get(`${apiUrl}/products/categories`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
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
        const response = await axios.post(`${apiUrl}/products/add_categories`, categoryData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
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
        const response = await axios.delete(`${apiUrl}/products/categories/${encodeURIComponent(categoryId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error.response?.data || new Error("Failed to delete category.");
    }
};
