// src/components/OrderManagement.js

import React, { useState, useEffect } from 'react';
import { fetchOrders, createOrder, updateOrderInfo, deleteOrder, trackOrder, returnOrderItem } from '../services/orderService';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
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
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [returnData, setReturnData] = useState({ order_item_id: '', reason: '' });

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
    const deliveryOptions = ['Standard', 'Express', 'In-Store Pickup'];

    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                const data = await fetchOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };
        fetchAllOrders();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOrder({ ...newOrder, [name]: value });
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            await createOrder(newOrder);
            const data = await fetchOrders(); // Refresh orders list after creation
            setOrders(data);
            setNewOrder({
                user_id: '',
                status: 'Pending',
                delivery_option: 'Standard',
                items: [{ product_id: '', quantity: '' }],
            });
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const handleAddOrderItem = () => {
        setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: '' }] });
    };

    const handleOrderItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...newOrder.items];
        newItems[index][name] = value;
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
                const data = await fetchOrders(); // Refresh orders list after update
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
            const data = await fetchOrders(); // Refresh orders list after deletion
            setOrders(data);
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const handleTrackOrder = async (orderId) => {
        try {
            const trackedOrder = await trackOrder(orderId);
            setTrackingOrder(trackedOrder.order);
        } catch (error) {
            console.error("Error tracking order:", error);
        }
    };

    const handleReturnItem = async (orderId) => {
        try {
            await returnOrderItem(orderId, returnData);
            setReturnData({ order_item_id: '', reason: '' });
            alert("Return request created successfully");
        } catch (error) {
            console.error("Error returning order item:", error);
        }
    };

    const handleReturnDataChange = (e) => {
        const { name, value } = e.target;
        setReturnData({ ...returnData, [name]: value });
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>
                Order Management
            </Typography>

            {/* Orders Table */}
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
                                <Button variant="contained" color="primary" onClick={() => handleOrderUpdate(order)} sx={{ marginRight: 1 }}>
                                    Update
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteOrder(order.id)}>
                                    Delete
                                </Button>
                                <Button variant="contained" color="info" onClick={() => handleTrackOrder(order.id)} sx={{ marginTop: 1 }}>
                                    Track
                                </Button>
                                {/* <Button variant="contained" color="secondary" onClick={() => handleReturnItem(order.id)} sx={{ marginLeft: 1 }}>
                                Return Item
                                    </Button> */}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Display tracked order information */}
            {trackingOrder && (
                <Box marginTop={4}>
                    <Typography variant="h6" gutterBottom>Tracked Order Details</Typography>
                    <pre>{JSON.stringify(trackingOrder, null, 2)}</pre>
                </Box>
            )}

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

            {/* Create New Order Form */}
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

            {/* Return Order Item Form */}
            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>Return Order Item</Typography>
                <TextField
                    label="Order Item ID"
                    name="order_item_id"
                    value={returnData.order_item_id}
                    onChange={handleReturnDataChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Reason for Return"
                    name="reason"
                    value={returnData.reason}
                    onChange={handleReturnDataChange}
                    fullWidth
                    margin="normal"
                />
                <Button variant="contained" color="secondary" onClick={() => handleReturnItem(editingOrder?.id)} fullWidth>
                    Submit Return Request
                </Button>
            </Box>
        </Container>
    );
}

export default OrderManagement;
