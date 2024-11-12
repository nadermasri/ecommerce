//authentic_lebanese_sentiment_shop/frontend/src/services/productService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';


export const getProducts = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${apiUrl}/products/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const addProduct = async (productData) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${apiUrl}/products/add`, 
        productData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(`${apiUrl}/products/${productId}`, productData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const deleteProduct = async (productId) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.delete(`${apiUrl}/products/${productId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const setPromotion = async (productId, discountedPrice) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.put(
        `${apiUrl}/products/${productId}/set_promotion`,
        { discounted_price: discountedPrice },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};

export const bulkUploadProducts = async (file) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${apiUrl}/products/bulk_upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
