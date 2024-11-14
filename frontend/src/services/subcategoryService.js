// src/services/subcategoryService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Fetch subcategories
export const fetchSubcategories = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/products/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// Create a subcategory
export const createSubcategory = async (subcategoryData) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiUrl}/products/add_subcategories`, subcategoryData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

// Delete a subcategory
export const deleteSubcategory = async (subcategoryId) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiUrl}/products/subcategories/${subcategoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
