// src/components/OrderManagement.js

import React, { useState, useEffect } from 'react';
import { fetchOrders, createOrder, updateOrderInfo, deleteOrder, trackOrder, returnItem, fetchReturns,updateReturnStatus   } from '../services/orderService';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function OrderManagement() {
    const navigate = useNavigate();  // Initialize navigate hook
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    
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

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
    const deliveryOptions = ['Standard', 'Express', 'In-Store Pickup'];
    const handleOpenReturnDialog = (returnItem) => {
        setSelectedReturn(returnItem);
        setNewStatus(returnItem.status); // Set the current status as the default
        setReturnDialogOpen(true);
    };
    const handleCloseReturnDialog = () => {
        setReturnDialogOpen(false);
        setSelectedReturn(null);
    };
    
    useEffect(() => {
        const token = localStorage.getItem('authToken');  // Retrieve the token from localStorage
    
        if (!token) {
            alert('Session expired. Please log in again.');  // Optional message
            navigate('/login');  // Redirect to login if no token exists
            return;  // Exit early if the token is missing
        }
    
        // Fetch data only if the token exists
        const fetchAllData = async () => {
            try {
                const ordersData = await fetchOrders(token);  // Pass token to fetchOrders
                setOrders(ordersData);
    
                const returnsData = await fetchReturns(token);  // Pass token to fetchReturns
                setReturns(returnsData);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert('Failed to fetch orders and returns. Please try again.');
            }
        };
    
        fetchAllData();  // Call the fetch function if the token is valid
    }, [navigate]);  // Dependency array to run the effect only once when the component mounts
    
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'user_id') {
            // Convert user_id to string before sanitization
            const sanitizedValue = String(value).replace(/[^a-zA-Z0-9]/g, '');  // Sanitize user_id by allowing only alphanumeric characters
            setNewOrder({ ...newOrder, [name]: sanitizedValue });
        } else {
            setNewOrder({ ...newOrder, [name]: value });
        }
    };
    
    

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');  // Get token from localStorage
        if (!newOrder.user_id || newOrder.items.length === 0) {
            alert('Please provide a user and at least one item.');
            return;
        }
    
        const sanitizedItems = newOrder.items.map(item => ({
            ...item,
            product_id: item.product_id.replace(/[^a-zA-Z0-9]/g, ''),  // Sanitize product_id
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1)  // Ensure valid quantity
        }));
    
        const sanitizedOrder = {
            ...newOrder,
            items: sanitizedItems
        };
    
        try {
            await createOrder(sanitizedOrder, token);  // Pass the sanitized order to API
            const data = await fetchOrders(token);  // Fetch orders with token
            setOrders(data);
            setNewOrder({
                user_id: '',
                status: 'Pending',
                delivery_option: 'Standard',
                items: [{ product_id: '', quantity: '' }],
            });
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create the order. Please try again.");
        }
    };
    
    
    

    const handleAddOrderItem = () => {
        setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: '' }] });
    };

    const handleOrderItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...newOrder.items];
    
        if (name === 'product_id') {
            // Ensure product_id is alphanumeric and safe
            newItems[index][name] = value.replace(/[^a-zA-Z0-9]/g, '');  // Sanitize product_id
        } else if (name === 'quantity') {
            // Ensure quantity is a valid positive integer
            newItems[index][name] = Math.max(1, parseInt(value, 10) || 1);  // Ensure quantity is at least 1
        } else {
            newItems[index][name] = value;
        }
    
        setNewOrder({ ...newOrder, items: newItems });
    };
    

    const handleOrderUpdate = (order) => {
        setEditingOrder(order);
        setFormData({
            status: order.status,
            delivery_option: order.delivery_option,
        });
    };

    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSaveUpdate = async (e) => {
        e.preventDefault();
        if (editingOrder) {
            try {
                await updateOrderInfo(editingOrder.id, formData);
                const data = await fetchOrders();
                setOrders(data);
                setEditingOrder(null);
                setFormData({
                    status: '',
                    delivery_option: '',
                });
            } catch (error) {
                console.error("Error updating order:", error);
            }
        }
    };

    const handleCancelUpdate = () => {
        setEditingOrder(null);
        setFormData({
            status: '',
            delivery_option: '',
        });
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            await deleteOrder(orderId);
            const data = await fetchOrders();
            setOrders(data);
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete the order. Please try again.");
        }
    };

    const handleTrackOrder = async (orderId) => {
        try {
            const trackedData = await trackOrder(orderId);
            setTrackedOrder(trackedData.order);  // Update the state with the latest order data
        } catch (error) {
            console.error("Error tracking order:", error);
        }
    };

    const closeTrackedOrder = () => {
        setTrackedOrder(null);
    };

    const handleReturnDialogOpen = (order) => {
        setSelectedOrder(order);
        setReturnDialogOpen(true);
    };

    const handleReturnDialogClose = () => {
        setReturnDialogOpen(false);
        setReturnData({ order_item_id: '', reason: '' });
        setSelectedOrder(null);
    };

    const handleReturnInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'reason') {
            // Remove any HTML tags or scripts in the reason
            const sanitizedReason = value.replace(/<[^>]*>/g, '');  // Strip HTML tags
            setReturnData({ ...returnData, [name]: sanitizedReason });
        } else {
            setReturnData({ ...returnData, [name]: value });
        }
    };
    

    const handleReturnSubmit = async () => {
        try {
            const response = await returnItem(selectedOrder.id, returnData.order_item_id, returnData.reason);
            alert(response.message);

            // Refetch the tracked order to update the display with the latest data
            await handleTrackOrder(selectedOrder.id);
            
            handleReturnDialogClose();
            const data = await fetchOrders();
            setOrders(data);  // Refresh the orders list
        } catch (error) {
            alert("Failed to process return request.");
        }
    };
    const handleUpdateReturnStatus = async () => {
        if (!selectedReturn || !newStatus) return;
    
        try {
            const updatedReturn = await updateReturnStatus(selectedReturn.id, newStatus);
            setReturns(returns.map(returnItem => 
                returnItem.id === updatedReturn.id ? updatedReturn : returnItem
            ));
            alert("Return status updated successfully.");
            handleCloseReturnDialog();
        } catch (error) {
            alert("Failed to update return status.");
            console.error("Error updating return status:", error);
        }
    };
    

    const handleOpenReturnStatusDialog = (returnItem) => {
        setSelectedReturn(returnItem);
        setNewStatus(returnItem.status); // Set the current status as the default
        setReturnDialogOpen(true);
    };
    const handleOpenUpdateStatusDialog = (returnItem) => {
        setSelectedReturn(returnItem);
        setNewStatus(returnItem.status);
        setReturnDialogOpen(true);
    };
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedReturnItem, setSelectedReturnItem] = useState(null);
    const handleOpenStatusDialog = (returnItem) => {
        setSelectedReturnItem(returnItem);
        setNewStatus(returnItem.status); // Set the current status as default
        setStatusDialogOpen(true);
    };



    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Order Management
            </Typography>

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
                            <TableCell>{order.total_price}</TableCell>
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
            <Dialog open={returnDialogOpen} onClose={handleCloseReturnDialog}>
    <DialogTitle>Update Return Status</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Select the new status for the return item.
        </DialogContentText>
        <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
            >
                {['Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
                    <MenuItem key={status} value={status}>
                        {status}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseReturnDialog} color="secondary">
            Cancel
        </Button>
        <Button onClick={handleUpdateReturnStatus} color="primary">
            Update Status
        </Button>
    </DialogActions>
</Dialog>


{/* Returns Table */}
<Box marginTop={4}>
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

<Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)}>
    <DialogTitle>Update Return Status</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Select the new status for the return item.
        </DialogContentText>
        <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
            >
                {['Pending', 'Approved', 'Rejected', 'Completed'].map((status) => (
                    <MenuItem key={status} value={status}>
                        {status}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setReturnDialogOpen(false)} color="secondary">
            Cancel
        </Button>
        <Button onClick={handleOpenReturnStatusDialog} color="primary">
            Update Status
        </Button>
    </DialogActions>
</Dialog>

            {trackedOrder && (
                <Card sx={{ marginTop: 4, padding: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Tracked Order Details</Typography>
                        <Typography variant="body1">
                            <strong>Order ID:</strong> {trackedOrder.id}<br />
                            <strong>User ID:</strong> {trackedOrder.user_id}<br />
                            <strong>Status:</strong> {trackedOrder.status}<br />
                            <strong>Delivery Option:</strong> {trackedOrder.delivery_option}<br />
                            <strong>Total Price:</strong> ${trackedOrder.total_price}<br />
                            <strong>Order Date:</strong> {new Date(trackedOrder.order_date).toLocaleString()}<br />
                        </Typography>
                        <Typography variant="h6" gutterBottom sx={{ marginTop: 2 }}>Order Items:</Typography>
                        {trackedOrder.items.map((item, index) => (
                            <Box key={index} sx={{ marginBottom: 1 }}>
                                <Typography variant="body2">
                                    <strong>Product ID:</strong> {item.product_id}<br />
                                    <strong>Quantity:</strong> {item.quantity}<br />
                                    <strong>Price:</strong> ${item.price}
                                </Typography>
                            </Box>
                        ))}
                        <Button variant="contained" color="secondary" onClick={closeTrackedOrder} sx={{ marginTop: 2 }}>
                            Close
                        </Button>
                    </CardContent>
                </Card>
            )}

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

            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>Create New Order</Typography>
                <form onSubmit={handleCreateOrder}>
                    <TextField
                        label="User ID"
                        name="user_id"
                        value={newOrder.user_id}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={newOrder.status}
                            onChange={handleInputChange}
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
                            <TextField
                                label="Product ID"
                                name="product_id"
                                value={item.product_id}
                                onChange={(e) => handleOrderItemChange(index, e)}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Quantity"
                                name="quantity"
                                value={item.quantity}
                                onChange={(e) => handleOrderItemChange(index, e)}
                                fullWidth
                                required
                            />
                        </Box>
                    ))}
                    <Button onClick={handleAddOrderItem} color="primary">Add Item</Button>
                    <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: 2 }}>
                        Create Order
                    </Button>
                </form>
            </Box>

            <Dialog open={returnDialogOpen} onClose={handleReturnDialogClose}>
                <DialogTitle>Return Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select the Order Item and provide a reason for the return.
                    </DialogContentText>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Order Item</InputLabel>
                        <Select
                            name="order_item_id"
                            value={returnData.order_item_id}
                            onChange={handleReturnInputChange}
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReturnDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleReturnSubmit} color="primary">
                        Submit Return
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default OrderManagement;
