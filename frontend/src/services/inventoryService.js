// src/services/inventoryService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const updateStock = async (product_id, location, stock_level) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(
        `${apiUrl}/inventory/update_stock`,
        { product_id, location, stock_level },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return response.data;
};

export const getLowStockAlerts = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/inventory/low_stock_alerts`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getInventoryReport = async () => {
    const token = localStorage.getItem('authToken');
    const response = await axios.get(`${apiUrl}/inventory/inventory_report`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
