// services/productService.js
import api from './api';

// Fetch all products with secure headers and error handling
export const getProducts = async () => {
    try {
        const response = await api.get(`/products/`);
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
        const response = await api.post(`/products/add`, productData);
        return response.data;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error.response?.data || new Error("Failed to add product.");
    }
};

// Update a product with input validation and error handling
export const updateProduct = async (productId, productData) => {
    if (typeof productId !== 'number' || typeof productData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await api.put(`/products/${encodeURIComponent(productId)}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error.response?.data || new Error("Failed to update product.");
    }
};

// Delete a product with input validation and error handling
export const deleteProduct = async (productId) => {
    if (typeof productId !== 'number') throw new Error("Invalid productId.");
    try {
        const response = await api.delete(`/products/${encodeURIComponent(productId)}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error.response?.data || new Error("Failed to delete product.");
    }
};

// Set promotion for a product with input validation and secure headers
export const setPromotion = async (productId, discountedPrice) => {
    if (typeof productId !== 'number' || typeof discountedPrice !== 'number') throw new Error("Invalid input.");
    try {
        const response = await api.put(
            `/products/${encodeURIComponent(productId)}/set_promotion`,
            { discounted_price: discountedPrice }
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

        const response = await api.post(`/products/bulk_upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error bulk uploading products:', error);
        throw error.response?.data || new Error("Failed to bulk upload products.");
    }
};

