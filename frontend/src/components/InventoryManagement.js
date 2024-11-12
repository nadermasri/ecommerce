// src/components/InventoryManagement.js

import React, { useEffect, useState } from 'react';
import { updateStock, getLowStockAlerts, getInventoryReport } from '../services/inventoryService';

function InventoryManagement() {
    const [formData, setFormData] = useState({
        product_id: '',
        location: '',
        stock_level: ''
    });
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [inventoryReport, setInventoryReport] = useState([]);

    useEffect(() => {
        fetchLowStockAlerts();
        fetchInventoryReport();
    }, []);

    const fetchLowStockAlerts = async () => {
        try {
            const data = await getLowStockAlerts();
            setLowStockAlerts(data.low_stock_alerts);
        } catch (error) {
            console.error("Failed to fetch low stock alerts:", error);
            alert("Failed to fetch low stock alerts.");
        }
    };

    const fetchInventoryReport = async () => {
        try {
            const data = await getInventoryReport();
            setInventoryReport(data.inventory_report);
        } catch (error) {
            console.error("Failed to fetch inventory report:", error);
            alert("Failed to fetch inventory report.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdateStock = async (e) => {
        e.preventDefault();
        try {
            const response = await updateStock(
                parseInt(formData.product_id, 10),
                formData.location,
                parseInt(formData.stock_level, 10)
            );
            alert(response.message);
            setFormData({ product_id: '', location: '', stock_level: '' });
            fetchLowStockAlerts(); // Refresh alerts after stock update
        } catch (error) {
            console.error("Failed to update stock:", error);
            if (error.response) {
                alert(`Backend error: ${error.response.data.error}`);
            }
        }
    };

    return (
        <div>
            <h2>Update Inventory Stock</h2>
            <form onSubmit={handleUpdateStock}>
                <div>
                    <label>Product ID:</label>
                    <input
                        type="number"
                        name="product_id"
                        value={formData.product_id}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label>Stock Level:</label>
                    <input
                        type="number"
                        name="stock_level"
                        value={formData.stock_level}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <button type="submit">Update Stock</button>
            </form>

            <h3>Low Stock Alerts</h3>
            {lowStockAlerts.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Product ID</th>
                            <th>Location</th>
                            <th>Stock Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockAlerts.map((alert, index) => (
                            <tr key={index}>
                                <td>{alert.product_id}</td>
                                <td>{alert.location}</td>
                                <td>{alert.stock_level}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No low stock alerts at the moment.</p>
            )}

            <h3>Inventory Report</h3>
            {inventoryReport.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Total Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryReport.map((report, index) => (
                            <tr key={index}>
                                <td>{report.product_name}</td>
                                <td>{report.total_sold}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No inventory report data available.</p>
            )}
        </div>
    );
}

export default InventoryManagement;
