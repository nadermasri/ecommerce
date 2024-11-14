//services/subcategoryService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Authorization token is missing.");
    return token;
};

export const fetchSubcategories = async () => {
    try {
        const response = await axios.get(`${apiUrl}/products/subcategories`, {
            headers: { 
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error.response?.data || new Error("Failed to fetch subcategories.");
    }
};

export const createSubcategory = async (subcategoryData) => {
    if (typeof subcategoryData !== 'object') throw new Error("Invalid input data.");
    try {
        const response = await axios.post(`${apiUrl}/products/add_subcategories`, subcategoryData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating subcategory:", error);
        throw error.response?.data || new Error("Failed to create subcategory.");
    }
};

export const deleteSubcategory = async (subcategoryId) => {
    if (typeof subcategoryId !== 'string') throw new Error("Invalid subcategoryId.");
    try {
        const response = await axios.delete(`${apiUrl}/products/subcategories/${encodeURIComponent(subcategoryId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        throw error.response?.data || new Error("Failed to delete subcategory.");
    }
};
