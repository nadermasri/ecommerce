import React, { useState, useEffect } from 'react';
import { fetchOrders, createOrder, updateOrderInfo, deleteOrder } from '../services/orderService';
import { TextField, Button, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState({
        user_id: '',
        total_price: '',
        status: 'Pending',
        delivery_option: 'Standard',
        items: [],
    });
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        user_id: '',
        total_price: '',
        status: '',
        delivery_option: ''
    });
    const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: '', price: '' }]);

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
    const deliveryOptions = ['Standard', 'Express', 'In-Store Pickup'];

    useEffect(() => {
        const fetchAllOrders = async () => {
            const data = await fetchOrders();
            setOrders(data);
        };
        fetchAllOrders();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOrder({ ...newOrder, [name]: value });
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        const orderData = { ...newOrder, items: orderItems };
        await createOrder(orderData);
        const data = await fetchOrders();  // Refresh orders list after creation
        setOrders(data);
        setNewOrder({
            user_id: '',
            total_price: '',
            status: 'Pending',
            delivery_option: 'Standard',
            items: []
        });
        setOrderItems([{ product_id: '', quantity: '', price: '' }]);
    };

    const handleAddOrderItem = () => {
        setOrderItems([...orderItems, { product_id: '', quantity: '', price: '' }]);
    };

    const handleOrderItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...orderItems];
        newItems[index][name] = value;
        setOrderItems(newItems);
    };

    const handleOrderUpdate = (order) => {
        setEditingOrder(order);
        setFormData({
            user_id: order.user_id,
            total_price: order.total_price,
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
            await updateOrderInfo(editingOrder.id, formData);
            const data = await fetchOrders();  // Refresh orders list after update
            setOrders(data);
            setEditingOrder(null);
            setFormData({
                user_id: '',
                total_price: '',
                status: '',
                delivery_option: ''
            });
        }
    };

    const handleCancelUpdate = () => {
        setEditingOrder(null);
    };

    const handleDeleteOrder = async (orderId) => {
        await deleteOrder(orderId);
        const data = await fetchOrders();  // Refresh orders list after deletion
        setOrders(data);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Order Management</Typography>

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
                        <TextField
                            label="User ID"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleUpdateInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Total Price"
                            name="total_price"
                            value={formData.total_price}
                            onChange={handleUpdateInputChange}
                            fullWidth
                            margin="normal"
                        />
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
                    <TextField
                        label="Total Price"
                        name="total_price"
                        value={newOrder.total_price}
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
                    {orderItems.map((item, index) => (
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
                            <TextField
                                label="Price"
                                name="price"
                                value={item.price}
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
        </Container>
    );
}

export default OrderManagement;
