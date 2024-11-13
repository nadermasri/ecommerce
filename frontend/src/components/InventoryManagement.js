//ecommerce/inventory_management/src/components/InventoryManagement.js
import React, { useEffect, useState } from 'react';
import { updateStock, getLowStockAlerts, getInventoryReport } from '../services/inventoryService';
import { TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Box, Typography } from '@mui/material';

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

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Inventory Management</Typography>
            <form onSubmit={handleUpdateStock}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        label="Product ID" 
                        name="product_id" 
                        type="number" 
                        value={formData.product_id} 
                        onChange={handleInputChange} 
                        fullWidth 
                        required
                    />
                    <TextField 
                        label="Location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleInputChange} 
                        fullWidth 
                        required
                    />
                    <TextField 
                        label="Stock Level" 
                        name="stock_level" 
                        type="number" 
                        value={formData.stock_level} 
                        onChange={handleInputChange} 
                        fullWidth 
                        required
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        fullWidth
                    >
                        Update Stock
                    </Button>
                </Box>
            </form>

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
