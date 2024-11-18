import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Paper,
    Snackbar,
    Alert,
    Grid,
    Collapse
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserOrders, fetchOrderDetails } from '../../services/orderService';

function Orders() {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [error, setError] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');

    useEffect(() => {
        const getOrders = async () => {
            try {
                const data = await fetchUserOrders(user.id);
                setOrders(data);
            } catch (err) {
                setError(err.message || 'Failed to load orders.');
                setAlertMessage(err.message || 'Failed to load orders.');
                setAlertSeverity('error');
                setAlertOpen(true);
            } finally {
                setLoading(false);
            }
        };
        getOrders();
    }, [user.id]);

    const handleToggleOrder = async (orderId) => {
        if (selectedOrder === orderId) {
            setSelectedOrder(null);
            return;
        }
        try {
            const orderDetails = await fetchOrderDetails(orderId);
            setSelectedOrder(orderId === selectedOrder ? null : orderId);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, details: orderDetails } : order
                )
            );
        } catch (err) {
            setError(err.message || 'Failed to load order details.');
            setAlertMessage(err.message || 'Failed to load order details.');
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    const handleCloseAlert = () => {
        setAlertOpen(false);
        setError('');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>Your Orders</Typography>
            <Paper sx={{ padding: '1rem' }} elevation={3}>
                {orders.length === 0 ? (
                    <Typography>No orders found.</Typography>
                ) : (
                    <List>
                        {orders.map(order => (
                            <React.Fragment key={order.id}>
                                <ListItem button onClick={() => handleToggleOrder(order.id)}>
                                    <ListItemText
                                        primary={`Order #${order.id}`}
                                        secondary={`Date: ${new Date(order.created_at).toLocaleDateString()} | Total: $${order.total.toFixed(2)}`}
                                    />
                                    {selectedOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>
                                <Collapse in={selectedOrder === order.id} timeout="auto" unmountOnExit>
                                    <Box sx={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '1rem' }}>
                                        {order.details ? (
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1">Shipping Address:</Typography>
                                                    <Typography variant="body2">{order.details.shipping_address}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1">Items:</Typography>
                                                    <List>
                                                        {order.details.items.map(item => (
                                                            <ListItem key={item.id}>
                                                                <ListItemText
                                                                    primary={`${item.name} x${item.quantity}`}
                                                                    secondary={`Price: $${item.price.toFixed(2)}`}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1">Payment Method:</Typography>
                                                    <Typography variant="body2">{order.details.payment_method}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle1">Order Status:</Typography>
                                                    <Typography variant="body2">{order.details.status}</Typography>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            <Typography>Loading details...</Typography>
                                        )}
                                    </Box>
                                </Collapse>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* Error Snackbar */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Orders;
