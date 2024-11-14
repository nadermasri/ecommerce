// src/services/categoryService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Fetch categories
export const fetchCategories = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/products/categories`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Create a category
export const createCategory = async (categoryData) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiUrl}/products/add_categories`, categoryData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

// Delete a category
export const deleteCategory = async (categoryId) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiUrl}/products/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
