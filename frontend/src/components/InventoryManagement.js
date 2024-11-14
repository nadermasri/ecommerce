// src/components/InventoryManagement.js

import React, { useEffect, useState } from 'react';
import { updateStock, getLowStockAlerts, getInventoryReport, fetchInventory, addInventory } from '../services/inventoryService';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Box, Typography } from '@mui/material';

function InventoryManagement() {
    const [newInventory, setNewInventory] = useState({
        product_id: '',
        location: '',
        stock_level: ''
    });
    const [formData, setFormData] = useState({
        product_id: '',
        location: '',
        stock_level: ''
    });
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [inventoryReport, setInventoryReport] = useState([]);
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        const fetchAllInventory = async () => {
            try {
                const data = await fetchInventory();
                setInventory(data);
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };
        fetchAllInventory();
    }, []);

    useEffect(() => {
        fetchLowStockAlerts();
        fetchInventoryReport();
    }, []);

    const fetchLowStockAlerts = async () => {
        try {
            const data = await getLowStockAlerts();
            setLowStockAlerts(data.low_stock_alerts);
        } catch (error) {
            alert("Failed to fetch low stock alerts.");
        }
    };

    const fetchInventoryReport = async () => {
        try {
            const data = await getInventoryReport();
            setInventoryReport(data.inventory_report);
        } catch (error) {
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
            alert("Failed to update stock.");
        }
    };

    const handleNewInventoryChange = (e) => {
        const { name, value } = e.target;
        setNewInventory({ ...newInventory, [name]: value });
    };

    const handleAddInventory = async (e) => {
        e.preventDefault();
        try {
            const response = await addInventory(newInventory);
            alert(response.message);
            
            // Refresh the inventory list after adding new record
            const updatedInventory = await fetchInventory();
            setInventory(updatedInventory);

            // Clear the form
            setNewInventory({ product_id: '', location: '', stock_level: '' });
        } catch (error) {
            alert("Failed to add inventory. Please try again.");
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Inventory Management
            </Typography>

            {/* Inventory Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Product ID</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Stock Level</TableCell>
                        <TableCell>Last Updated</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inventory.map(record => (
                        <TableRow key={record.id}>
                            <TableCell>{record.id}</TableCell>
                            <TableCell>{record.product_id}</TableCell>
                            <TableCell>{record.location}</TableCell>
                            <TableCell>{record.stock_level}</TableCell>
                            <TableCell>{new Date(record.last_updated).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Add New Inventory Form */}
            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>
                    Add New Inventory
                </Typography>
                <form onSubmit={handleAddInventory}>
                    <TextField
                        label="Product ID"
                        name="product_id"
                        value={newInventory.product_id}
                        onChange={handleNewInventoryChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Location"
                        name="location"
                        value={newInventory.location}
                        onChange={handleNewInventoryChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Stock Level"
                        name="stock_level"
                        value={newInventory.stock_level}
                        onChange={handleNewInventoryChange}
                        fullWidth
                        margin="normal"
                        required
                        type="number"
                    />
                    <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: 2 }}>
                        Add Inventory
                    </Button>
                </form>
            </Box>

            <Typography variant="h5" sx={{ marginTop: 4 }}>Low Stock Alerts</Typography>
            {lowStockAlerts.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product ID</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Stock Level</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lowStockAlerts.map((alert, index) => (
                            <TableRow key={index}>
                                <TableCell>{alert.product_id}</TableCell>
                                <TableCell>{alert.location}</TableCell>
                                <TableCell>{alert.stock_level}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography>No low stock alerts at the moment.</Typography>
            )}

            <Typography variant="h5" sx={{ marginTop: 4 }}>Inventory Report</Typography>
            {inventoryReport.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product Name</TableCell>
                            <TableCell>Total Sold</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inventoryReport.map((report, index) => (
                            <TableRow key={index}>
                                <TableCell>{report.product_name}</TableCell>
                                <TableCell>{report.total_sold}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography>No inventory report data available.</Typography>
            )}
        </Container>
    );
}

export default InventoryManagement;
