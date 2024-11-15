// services/inventoryService.js
import api from './api';

// Update stock level with input validation and secure headers
export const updateStock = async (product_id, location, stock_level) => {
    if (typeof product_id !== 'string' || typeof location !== 'string' || typeof stock_level !== 'number') {
        throw new Error("Invalid input data.");
    }
    try {
        const response = await api.post(
            `/inventory/update_stock`,
            { product_id, location, stock_level }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating stock:", error);
        throw error.response?.data || new Error("Failed to update stock.");
    }
};

// Get low stock alerts with secure headers and error handling
export const getLowStockAlerts = async () => {
    try {
        const response = await api.get(`/inventory/low_stock_alerts`);
        return response.data;
    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        throw error.response?.data || new Error("Failed to fetch low stock alerts.");
    }
};

// Get inventory report with secure headers and error handling
export const getInventoryReport = async () => {
    try {
        const response = await api.get(`/inventory/inventory_report`);
        return response.data;
    } catch (error) {
        console.error("Error fetching inventory report:", error);
        throw error.response?.data || new Error("Failed to fetch inventory report.");
    }
};

// Fetch all inventory records with secure headers and error handling
export const fetchInventory = async () => {
    try {
        const response = await api.get(`/inventory/all`);
        return response.data.inventory;
    } catch (error) {
        console.error("Error fetching inventory:", error);
        throw error.response?.data || new Error("Failed to fetch inventory.");
    }
};

// Add new inventory item with input validation and secure headers
export const addInventory = async (inventoryData) => {
    if (typeof inventoryData !== 'object') throw new Error("Invalid inventory data.");
    try {
        const response = await api.post(`/inventory/add`, inventoryData);
        return response.data;
    } catch (error) {
        console.error("Error adding inventory:", error);
        throw error.response?.data || new Error("Failed to add inventory.");
    }
};
