// components/InventoryManagement.js

import React, { useEffect, useState } from 'react';
import {
    updateStock,
    getLowStockAlerts,
    getInventoryReport,
    fetchInventory,
    addInventory
} from '../services/inventoryService';
import { getProducts } from '../services/productService'; // Import getProducts
import {
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Container,
    Box,
    Typography,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';

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
    const [editingInventory, setEditingInventory] = useState(null);

    // State variables for products
    const [productsList, setProductsList] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState('');

    // Define static locations
    const LOCATIONS = ["Main Branch Beirut", "Dubai Branch"];

    // State variables for alerts
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);  // Control alert visibility

    // Fetch data on component mount
    useEffect(() => {
        fetchAllInventory();
        fetchLowStockAlerts();
        fetchInventoryReport();
        fetchProductsList();
    }, []);

    // Fetch list of products for dropdown
    const fetchProductsList = async () => {
        try {
            const products = await getProducts();
            setProductsList(products);
            setLoadingProducts(false);
        } catch (error) {
            console.error("Error fetching products list:", error);
            setErrorProducts('Failed to fetch products list.');
            setAlertOpen(true);
            setLoadingProducts(false);
        }
    };

    // Fetches all inventory
    const fetchAllInventory = async () => {
        try {
            const data = await fetchInventory();
            setInventory(data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setError('Failed to fetch inventory.');
            setAlertOpen(true);
        }
    };

    // Fetches low stock alerts
    const fetchLowStockAlerts = async () => {
        try {
            const data = await getLowStockAlerts();
            setLowStockAlerts(data.low_stock_alerts);
        } catch (error) {
            console.error("Error fetching low stock alerts:", error);
            setError('Failed to fetch low stock alerts.');
            setAlertOpen(true);
        }
    };

    // Fetches inventory report
    const fetchInventoryReport = async () => {
        try {
            const data = await getInventoryReport();
            setInventoryReport(data.inventory_report);
        } catch (error) {
            console.error("Error fetching inventory report:", error);
            setError('Failed to fetch inventory report.');
            setAlertOpen(true);
        }
    };

    // Helper function to get product name by ID
    const getProductName = (productId) => {
        const product = productsList.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    // Handle closing of the alert
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    // Handles input changes with validation for number fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'stock_level' ? validateNumber(value) : value });
    };

    // Handles new inventory input changes with validation
    const handleNewInventoryChange = (e) => {
        const { name, value } = e.target;
        setNewInventory({ ...newInventory, [name]: name === 'stock_level' ? validateNumber(value) : value });
    };

    // Validate stock level and product ID
    const validateNumber = (value) => {
        const number = parseInt(value, 10);
        return !isNaN(number) && number >= 0 ? value : '';
    };

    // Helper function to validate form inputs
    const validateStockForm = (form) => {
        if (!form.product_id || !form.location || form.stock_level === '') {
            setError("All fields are required.");
            setSuccessMessage('');
            setAlertOpen(true);
            return false;
        }
        if (isNaN(form.stock_level) || form.stock_level < 0) {
            setError("Stock level must be a non-negative number.");
            setSuccessMessage('');
            setAlertOpen(true);
            return false;
        }
        return true;
    };

    // Update stock level with validation
    const handleUpdateStock = async (e) => {
        e.preventDefault();
        if (!validateStockForm(formData)) return;

        try {
            // Ensure product_id is a number, as per backend expectation
            const parsedProductId = parseInt(formData.product_id, 10);
            const parsedStockLevel = parseInt(formData.stock_level, 10);

            if (isNaN(parsedProductId) || parsedProductId <= 0) {
                setError("Invalid Product ID.");
                setAlertOpen(true);
                return;
            }

            if (isNaN(parsedStockLevel) || parsedStockLevel < 0) {
                setError("Stock level must be a non-negative number.");
                setAlertOpen(true);
                return;
            }

            const response = await updateStock(
                parsedProductId,      // Number
                formData.location,    // String
                parsedStockLevel      // Number
            );
            setSuccessMessage(response.message || "Stock updated successfully.");
            setError('');
            setAlertOpen(true);
            setFormData({ product_id: '', location: '', stock_level: '' });
            setEditingInventory(null);
            fetchAllInventory();
        } catch (error) {
            console.error("Failed to update stock:", error);
            const errorMsg = error.response?.data?.message || "Failed to update stock.";
            setError(errorMsg);
            setSuccessMessage('');
            setAlertOpen(true);
        }
    };

    // Adds new inventory record with validation
    const handleAddInventory = async (e) => {
        e.preventDefault();
        if (!validateStockForm(newInventory)) return;

        try {
            // Ensure product_id is a number
            const parsedProductId = parseInt(newInventory.product_id, 10);
            const parsedStockLevel = parseInt(newInventory.stock_level, 10);

            if (isNaN(parsedProductId) || parsedProductId <= 0) {
                setError("Invalid Product ID.");
                setAlertOpen(true);
                return;
            }

            if (isNaN(parsedStockLevel) || parsedStockLevel < 0) {
                setError("Stock level must be a non-negative number.");
                setAlertOpen(true);
                return;
            }

            const inventoryData = {
                product_id: parsedProductId, // Number
                location: newInventory.location, // String
                stock_level: parsedStockLevel  // Number
            };

            const response = await addInventory(inventoryData);
            setSuccessMessage(response.message || "Inventory added successfully.");
            setError('');
            setAlertOpen(true);
            await fetchAllInventory();
            setNewInventory({ product_id: '', location: '', stock_level: '' });
        } catch (error) {
            console.error("Failed to add inventory:", error);
            const errorMsg = error.response?.data?.message || "Failed to add inventory. Please try again.";
            setError(errorMsg);
            setSuccessMessage('');
            setAlertOpen(true);
        }
    };

    // Enters editing mode for selected inventory item
    const handleEditInventory = (record) => {
        setEditingInventory(record);
        setFormData({
            product_id: record.product_id.toString(), // Convert to string for Select component
            location: record.location,
            stock_level: record.stock_level.toString()
        });
        setError('');
        setSuccessMessage('');
    };

    // Cancels editing mode
    const handleCancelEdit = () => {
        setEditingInventory(null);
        setFormData({ product_id: '', location: '', stock_level: '' });
        setError('');
        setSuccessMessage('');
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Inventory Management
            </Typography>

            {/* Snackbar alert for feedback */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleAlertClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || successMessage}
                </Alert>
            </Snackbar>

            {/* Display loading indicators or error messages for products */}
            {loadingProducts ? (
                <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                    <CircularProgress />
                </Box>
            ) : errorProducts ? (
                <Alert severity="error" sx={{ mt: 2 }}>{errorProducts}</Alert>
            ) : null}

            {/* Inventory Table */}
            <Table sx={{ marginTop: 4 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Stock Level</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inventory.map(record => (
                        <TableRow key={record.id}>
                            <TableCell>{record.id}</TableCell>
                            <TableCell>{getProductName(record.product_id)}</TableCell>
                            <TableCell>{record.location}</TableCell>
                            <TableCell>{record.stock_level}</TableCell>
                            <TableCell>{new Date(record.last_updated).toLocaleString()}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleEditInventory(record)}
                                >
                                    Update Stock
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Update Stock Form */}
            {editingInventory && (
                <Box marginTop={4}>
                    <Typography variant="h6" gutterBottom>
                        Update Stock for Product: {getProductName(editingInventory.product_id)}
                    </Typography>
                    <form onSubmit={handleUpdateStock}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Product</InputLabel>
                            <Select
                                name="product_id"
                                value={formData.product_id}
                                onChange={handleInputChange}
                                disabled // Disable editing of Product ID
                                required
                            >
                                {productsList.map(product => (
                                    <MenuItem key={product.id} value={product.id.toString()}>
                                        {product.name} (ID: {product.id})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Location</InputLabel>
                            <Select
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                disabled // Disable editing of Location
                                required
                            >
                                {LOCATIONS.map((location, index) => (
                                    <MenuItem key={index} value={location}>
                                        {location}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Stock Level"
                            name="stock_level"
                            value={formData.stock_level}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            type="number"
                            inputProps={{ min: "0" }}
                            required
                        />
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                                Save
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleCancelEdit} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Add New Inventory Form */}
            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>Add New Inventory</Typography>
                <form onSubmit={handleAddInventory}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Product</InputLabel>
                        <Select
                            name="product_id"
                            value={newInventory.product_id}
                            onChange={handleNewInventoryChange}
                            required
                        >
                            {productsList.map(product => (
                                <MenuItem key={product.id} value={product.id.toString()}>
                                    {product.name} (ID: {product.id})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Location</InputLabel>
                        <Select
                            name="location"
                            value={newInventory.location}
                            onChange={handleNewInventoryChange}
                            required
                        >
                            {LOCATIONS.map((location, index) => (
                                <MenuItem key={index} value={location}>
                                    {location}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Stock Level"
                        name="stock_level"
                        value={newInventory.stock_level}
                        onChange={handleNewInventoryChange}
                        fullWidth
                        margin="normal"
                        type="number"
                        inputProps={{ min: "0" }}
                        required
                    />
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: 2 }}>
                            Add Inventory
                        </Button>
                    </Box>
                </form>
            </Box>

            {/* Low Stock Alerts */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>Low Stock Alerts</Typography>
            {lowStockAlerts.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Stock Level</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lowStockAlerts.map((alert, index) => (
                            <TableRow key={index}>
                                <TableCell>{getProductName(alert.product_id)} (ID: {alert.product_id})</TableCell>
                                <TableCell>{alert.location}</TableCell>
                                <TableCell>{alert.stock_level}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Typography>No low stock alerts at the moment.</Typography>
            )}

            {/* Inventory Report */}
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
