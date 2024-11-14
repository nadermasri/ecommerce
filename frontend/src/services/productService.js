//services/productService.js
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

// Fetch all products with secure headers and error handling
export const getProducts = async () => {
    try {
        const response = await axios.get(`${apiUrl}/products/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-cache',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error.response?.data || new Error("Failed to fetch products.");
    }
};

// Add a new product with input validation and secure headers
export const addProduct = async (productData) => {
    if (typeof productData !== 'object') throw new Error("Invalid product data.");
    try {
        const response = await axios.post(`${apiUrl}/products/add`, productData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error.response?.data || new Error("Failed to add product.");
    }
};

// Update a product with input validation and secure headers
export const updateProduct = async (productId, productData) => {
    if (typeof productId !== 'string' || typeof productData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await axios.put(`${apiUrl}/products/${encodeURIComponent(productId)}`, productData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error.response?.data || new Error("Failed to update product.");
    }
};

// Delete a product with input validation and secure headers
export const deleteProduct = async (productId) => {
    if (typeof productId !== 'string') throw new Error("Invalid productId.");
    try {
        const response = await axios.delete(`${apiUrl}/products/${encodeURIComponent(productId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error.response?.data || new Error("Failed to delete product.");
    }
};

// Set promotion for a product with input validation and secure headers
export const setPromotion = async (productId, discountedPrice) => {
    if (typeof productId !== 'string' || typeof discountedPrice !== 'number') throw new Error("Invalid input.");
    try {
        const response = await axios.put(
            `${apiUrl}/products/${encodeURIComponent(productId)}/set_promotion`,
            { discounted_price: discountedPrice },
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error setting promotion:', error);
        throw error.response?.data || new Error("Failed to set promotion.");
    }
};

// Bulk upload products with secure file handling and error handling
export const bulkUploadProducts = async (file) => {
    if (!(file instanceof File)) throw new Error("Invalid file input.");
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${apiUrl}/products/bulk_upload`, formData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'multipart/form-data',
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error bulk uploading products:', error);
        throw error.response?.data || new Error("Failed to bulk upload products.");
    }
};
