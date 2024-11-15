// src/components/OrderManagement.js

import React, { useState, useEffect } from 'react';
import {
    fetchOrders,
    createOrder,
    updateOrderInfo,
    deleteOrder,
    trackOrder,
    returnItem,
    fetchReturns,
    updateReturnStatus,
    fetchProducts // Import fetchProducts
} from '../services/orderService';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function OrderManagement() {
    const navigate = useNavigate();  // Initialize navigate hook
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]); // State to store fetched products

    const [selectedReturn, setSelectedReturn] = useState(null);
    const [newStatus, setNewStatus] = useState("");

    const [newOrder, setNewOrder] = useState({
        user_id: '',
        status: 'Pending',
        delivery_option: 'Standard',
        items: [{ product_id: '', quantity: '' }],
    });
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        status: '',
        delivery_option: '',
    });
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [returnData, setReturnData] = useState({ order_item_id: '', reason: '' });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
    const deliveryOptions = ['Standard', 'Express', 'In-Store Pickup'];
    const returnStatusOptions = ['Pending', 'Approved', 'Rejected', 'Completed'];

    // Fetch data on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [ordersData, returnsData, productsData] = await Promise.all([
                    fetchOrders(),
                    fetchReturns(),
                    fetchProducts() // Fetch products
                ]);

                // Process orders to ensure total_price is a number
                const processedOrders = ordersData.map(order => ({
                    ...order,
                    total_price: Number(order.total_price) || 0,  // Convert to number, default to 0 if NaN
                }));
                setOrders(processedOrders);

                setReturns(returnsData);

                // Process products to ensure stock is a number
                const processedProducts = productsData.map(product => ({
                    ...product,
                    stock: Number(product.stock) || 0,  // Convert to number, default to 0 if NaN
                }));
                setProducts(processedProducts);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError('Failed to fetch orders, returns, or products. Please try again.');
            }
        };

        fetchAllData();  // Call the fetch function
    }, []);  // Empty dependency array to run once

    // Close alert
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setError(null);
        setSuccess(null);
    };

    // Handle input changes for new order form
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'user_id') {
            // Sanitize user_id by allowing only alphanumeric characters
            const sanitizedValue = String(value).replace(/[^a-zA-Z0-9]/g, '');
            setNewOrder({ ...newOrder, [name]: sanitizedValue });
        } else {
            setNewOrder({ ...newOrder, [name]: value });
        }
    };

    // Handle adding a new item to the order
    const handleAddOrderItem = () => {
        setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: '' }] });
    };

    // Handle changes in order items
    const handleOrderItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...newOrder.items];

        if (name === 'product_id') {
            // Update product_id
            newItems[index][name] = value;

            // Reset quantity when product changes
            newItems[index]['quantity'] = '';
        } else if (name === 'quantity') {
            // Ensure quantity is a valid positive integer
            newItems[index][name] = Math.max(1, parseInt(value, 10) || 1);
        } else {
            newItems[index][name] = value;
        }

        setNewOrder({ ...newOrder, items: newItems });
    };

    // Validate product data
    const validateProductData = () => {
        const { user_id, items } = newOrder;

        if (!user_id || items.length === 0) {
            setError("Please provide a user ID and at least one order item.");
            return false;
        }

        // Validate all items
        for (let item of items) {
            if (!item.product_id || !item.quantity) {
                setError("All order items must have a product selected and a quantity.");
                return false;
            }

            // Check if selected quantity is within available stock
            const selectedProduct = products.find(p => p.id === item.product_id);
            if (!selectedProduct) {
                setError(`Product with ID ${item.product_id} not found.`);
                return false;
            }
            if (item.quantity > selectedProduct.stock) {
                setError(`Quantity for product ${selectedProduct.name} exceeds available stock (${selectedProduct.stock}).`);
                return false;
            }
        }

        return true;
    };

    // Handle creating a new order
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateProductData()) return;

        try {
            // Prepare sanitized items
            const sanitizedItems = newOrder.items.map(item => ({
                ...item,
                product_id: item.product_id,
                quantity: parseInt(item.quantity, 10),
            }));

            const sanitizedOrder = {
                ...newOrder,
                items: sanitizedItems
            };

            await createOrder(sanitizedOrder);  // No token passed
            const data = await fetchOrders();  // Fetch updated orders
            const processedOrders = data.map(order => ({
                ...order,
                total_price: Number(order.total_price) || 0,
            }));
            setOrders(processedOrders);
            setSuccess('Order created successfully!');
            setNewOrder({
                user_id: '',
                status: 'Pending',
                delivery_option: 'Standard',
                items: [{ product_id: '', quantity: '' }],
            });
        } catch (error) {
            console.error("Error creating order:", error);
            setError('Failed to create the order. Please try again.');
        }
    };

    // Handle editing an existing order
    const handleOrderUpdate = (order) => {
        setEditingOrder(order);
        setFormData({
            status: order.status,
            delivery_option: order.delivery_option,
        });
        setError(null);
        setSuccess(null);
    };

    // Handle input changes for updating an order
    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle saving updates to an order
    const handleSaveUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (editingOrder) {
            const { status, delivery_option } = formData;

            if (!status || !delivery_option) {
                setError('Please provide both status and delivery option.');
                return;
            }

            try {
                await updateOrderInfo(editingOrder.id, formData);  // No token passed
                const data = await fetchOrders();  // Fetch updated orders
                const processedOrders = data.map(order => ({
                    ...order,
                    total_price: Number(order.total_price) || 0,
                }));
                setOrders(processedOrders);
                setSuccess('Order updated successfully!');
                setEditingOrder(null);
                setFormData({
                    status: '',
                    delivery_option: '',
                });
            } catch (error) {
                console.error("Error updating order info:", error);
                setError('Failed to update the order. Please try again.');
            }
        }
    };

    // Handle canceling the edit
    const handleCancelUpdate = () => {
        setEditingOrder(null);
        setFormData({
            status: '',
            delivery_option: '',
        });
        setError(null);
        setSuccess(null);
    };

    // Handle deleting an order
    const handleDeleteOrder = async (orderId) => {
        setError(null);
        setSuccess(null);
        try {
            await deleteOrder(orderId);  // No token passed
            const data = await fetchOrders();  // Fetch updated orders
            const processedOrders = data.map(order => ({
                ...order,
                total_price: Number(order.total_price) || 0,
            }));
            setOrders(processedOrders);
            setSuccess('Order deleted successfully!');
        } catch (error) {
            console.error("Error deleting order:", error);
            setError('Failed to delete the order. Please try again.');
        }
    };

    // Handle tracking an order
    const handleTrackOrder = async (orderId) => {
        setError(null);
        setSuccess(null);
        try {
            const trackedData = await trackOrder(orderId);  // No token passed
            setTrackedOrder(trackedData.order);  // Update the state with the latest order data
        } catch (error) {
            console.error("Error tracking order:", error);
            setError('Failed to track the order. Please try again.');
        }
    };

    // Close the tracked order view
    const closeTrackedOrder = () => {
        setTrackedOrder(null);
    };

    // Handle opening the return item dialog
    const handleReturnDialogOpen = (order) => {
        setSelectedOrder(order);
        setReturnDialogOpen(true);
        setReturnData({ order_item_id: '', reason: '' });  // Reset return data
        setError(null);
        setSuccess(null);
    };

    // Handle closing the return item dialog
    const handleReturnDialogClose = () => {
        setReturnDialogOpen(false);
        setSelectedOrder(null);
        setReturnData({ order_item_id: '', reason: '' });
    };

    // Handle input changes in the return item form
    const handleReturnInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'reason') {
            // Remove any HTML tags to prevent XSS
            const sanitizedReason = value.replace(/<[^>]*>/g, '');
            setReturnData({ ...returnData, [name]: sanitizedReason });
        } else {
            setReturnData({ ...returnData, [name]: value });
        }
    };

    // Handle submitting a return request
    const handleReturnSubmit = async () => {
        setError(null);
        setSuccess(null);
        const { order_item_id, reason } = returnData;

        if (!order_item_id || !reason) {
            setError('Please provide both Order Item ID and Reason for return.');
            return;
        }

        try {
            const response = await returnItem(selectedOrder.id, order_item_id, reason);  // No token passed
            setSuccess(response.message || 'Return request submitted successfully!');
            await fetchAllReturns();  // Fetch updated returns
            handleReturnDialogClose();
        } catch (error) {
            console.error("Failed to process return request:", error);
            setError(error.response?.data?.error || 'Failed to submit return request.');
        }
    };

    // Fetch all returns (used after creating a return)
    const fetchAllReturns = async () => {
        try {
            const returnsData = await fetchReturns();  // No token passed
            setReturns(returnsData);
        } catch (error) {
            console.error("Error fetching returns:", error);
            setError('Failed to fetch returns.');
        }
    };

    // Handle updating return status
    const handleUpdateReturnStatus = async () => {
        if (!selectedReturn || !newStatus) {
            setError('Please select a status.');
            return;
        }

        try {
            const updatedReturn = await updateReturnStatus(selectedReturn.id, newStatus);  // No token passed
            setReturns(returns.map(returnItem =>
                returnItem.id === updatedReturn.id ? updatedReturn : returnItem
            ));
            setSuccess('Return status updated successfully!');
            setReturnDialogOpen(false);
            setSelectedReturn(null);
            setNewStatus('');
        } catch (error) {
            console.error("Failed to update return status:", error);
            setError('Failed to update return status.');
        }
    };

    // Open dialog for updating return status
    const handleOpenReturnStatusDialog = (returnItem) => {
        setSelectedReturn(returnItem);
        setNewStatus(returnItem.status); // Set the current status as the default
        setReturnDialogOpen(true);
        setError(null);
        setSuccess(null);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Order Management
            </Typography>

            {/* Display error and success alerts */}
            {(error || success) && (
                <Alert
                    severity={error ? "error" : "success"}
                    onClose={handleAlertClose}
                    sx={{ mb: 2 }}
                >
                    {error || success}
                </Alert>
            )}

            {/* Regular Orders Table */}
            <Typography variant="h5" gutterBottom>Orders</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Delivery Option</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.user_id}</TableCell>
                            <TableCell>
                                ${typeof order.total_price === 'number' && !isNaN(order.total_price)
                                    ? order.total_price.toFixed(2)
                                    : '0.00'}
                            </TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>{order.delivery_option}</TableCell>
                            <TableCell>
                                <Box display="flex" gap={1}>
                                    <Button variant="contained" color="primary" onClick={() => handleOrderUpdate(order)}>
                                        Update
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={() => handleDeleteOrder(order.id)}>
                                        Delete
                                    </Button>
                                    <Button variant="contained" color="info" onClick={() => handleTrackOrder(order.id)}>
                                        Track
                                    </Button>
                                    <Button variant="contained" color="warning" onClick={() => handleReturnDialogOpen(order)}>
                                        Return Item
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Update Order Form */}
            {editingOrder && (
                <Box marginTop={4}>
                    <Typography variant="h6" gutterBottom>Update Order</Typography>
                    <form onSubmit={handleSaveUpdate}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleUpdateInputChange}
                                required
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Delivery Option</InputLabel>
                            <Select
                                name="delivery_option"
                                value={formData.delivery_option}
                                onChange={handleUpdateInputChange}
                                required
                            >
                                {deliveryOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                                Save Changes
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleCancelUpdate} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Create New Order Form */}
            <Box marginTop={4}>
                <Typography variant="h5" gutterBottom>Create New Order</Typography>
                <form onSubmit={handleCreateOrder}>
                    <TextField
                        label="User ID"
                        name="user_id"
                        value={newOrder.user_id}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ maxLength: 20 }} // Limit User ID length if necessary
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={newOrder.status}
                            onChange={handleInputChange}
                            required
                        >
                            {statusOptions.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Delivery Option</InputLabel>
                        <Select
                            name="delivery_option"
                            value={newOrder.delivery_option}
                            onChange={handleInputChange}
                            required
                        >
                            {deliveryOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="subtitle1" gutterBottom>Order Items</Typography>
                    {newOrder.items.map((item, index) => (
                        <Box display="flex" gap={2} key={index} marginBottom={2}>
                            <FormControl fullWidth required>
                                <InputLabel>Product</InputLabel>
                                <Select
                                    name="product_id"
                                    value={item.product_id}
                                    onChange={(e) => handleOrderItemChange(index, e)}
                                    label="Product"
                                >
                                    {products.length > 0 ? (
                                        products.map((product) => (
                                            <MenuItem key={product.id} value={product.id}>
                                                {product.name} (Stock: {product.stock})
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">
                                            <em>No Products Available</em>
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Quantity"
                                name="quantity"
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleOrderItemChange(index, e)}
                                fullWidth
                                required
                                InputProps={{
                                    inputProps: {
                                        min: 1,
                                        max: item.product_id ? products.find(p => p.id === item.product_id)?.stock : 1
                                    }
                                }}
                                helperText={
                                    item.product_id
                                        ? `Max: ${products.find(p => p.id === item.product_id)?.stock || 1}`
                                        : ''
                                }
                            />
                        </Box>
                    ))}
                    <Button onClick={handleAddOrderItem} color="primary" variant="outlined">
                        Add Item
                    </Button>
                    <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: 2 }}>
                        Create Order
                    </Button>
                </form>
            </Box>

            {/* Return Item Dialog */}
            <Dialog open={returnDialogOpen} onClose={handleReturnDialogClose}>
                <DialogTitle>
                    {selectedReturn && selectedReturn.status ? 'Update Return Status' : 'Return Item'}
                </DialogTitle>
                <DialogContent>
                    {selectedReturn && selectedReturn.status ? (
                        <>
                            <DialogContentText>
                                Select the new status for the return item.
                            </DialogContentText>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                >
                                    {returnStatusOptions.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    ) : (
                        <>
                            <DialogContentText>
                                Select the Order Item and provide a reason for the return.
                            </DialogContentText>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Order Item</InputLabel>
                                <Select
                                    name="order_item_id"
                                    value={returnData.order_item_id}
                                    onChange={handleReturnInputChange}
                                    required
                                >
                                    {selectedOrder?.items.map(item => (
                                        <MenuItem key={item.id} value={item.id}>
                                            Product ID: {item.product_id}, Quantity: {item.quantity}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                margin="dense"
                                label="Reason"
                                name="reason"
                                type="text"
                                fullWidth
                                value={returnData.reason}
                                onChange={handleReturnInputChange}
                                required
                                inputProps={{ maxLength: 200 }} // Limit reason length if necessary
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReturnDialogClose} color="secondary">
                        Cancel
                    </Button>
                    {selectedReturn && selectedReturn.status ? (
                        <Button onClick={handleUpdateReturnStatus} color="primary">
                            Update Status
                        </Button>
                    ) : (
                        <Button onClick={handleReturnSubmit} color="primary">
                            Submit Return
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Returns Management Table */}
            <Box marginTop={6}>
                <Typography variant="h5" gutterBottom>
                    Returns Management
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Return ID</TableCell>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Order Item ID</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {returns.map(returnItem => (
                            <TableRow key={returnItem.id}>
                                <TableCell>{returnItem.id}</TableCell>
                                <TableCell>{returnItem.order_id}</TableCell>
                                <TableCell>{returnItem.order_item_id}</TableCell>
                                <TableCell>{returnItem.reason}</TableCell>
                                <TableCell>{returnItem.status}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleOpenReturnStatusDialog(returnItem)}
                                    >
                                        Update Status
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Tracked Order Details */}
            {trackedOrder && (
                <Card sx={{ marginTop: 4, padding: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Tracked Order Details</Typography>
                        <Typography variant="body1">
                            <strong>Order ID:</strong> {trackedOrder.id}<br />
                            <strong>User ID:</strong> {trackedOrder.user_id}<br />
                            <strong>Status:</strong> {trackedOrder.status}<br />
                            <strong>Delivery Option:</strong> {trackedOrder.delivery_option}<br />
                            <strong>Total Price:</strong> ${trackedOrder.total_price.toFixed(2)}<br />
                            <strong>Order Date:</strong> {new Date(trackedOrder.order_date).toLocaleString()}<br />
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>Order Items:</Typography>
                        {trackedOrder.items.map((item, index) => (
                            <Box key={index} sx={{ marginBottom: 1 }}>
                                <Typography variant="body2">
                                    <strong>Product ID:</strong> {item.product_id}<br />
                                    <strong>Quantity:</strong> {item.quantity}<br />
                                    <strong>Price:</strong> ${item.price.toFixed(2)}
                                </Typography>
                            </Box>
                        ))}
                        <Button variant="contained" color="secondary" onClick={closeTrackedOrder} sx={{ marginTop: 2 }}>
                            Close
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
    }

    export default OrderManagement;
