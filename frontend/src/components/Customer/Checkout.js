import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Divider
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { getCartItems, clearCart } from '../../services/cartService';
import { placeOrder } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Checkout() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    useEffect(() => {
        const getCart = async () => {
            try {
                const items = await getCartItems();
                setCartItems(items);
            } catch (err) {
                setError(err.message || 'Failed to load cart items.');
            } finally {
                setLoading(false);
            }
        };
        getCart();
    }, []);

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (!shippingAddress) {
            setError('Please enter a shipping address.');
            return;
        }

        setCheckoutLoading(true);
        try {
            const orderData = {
                user_id: user.id,
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
            };
            const response = await placeOrder(orderData);
            await clearCart();
            setSuccess(true);
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to place order.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress size={50} />
            </Box>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '5rem' }}>
                <Typography variant="h6">Your cart is empty.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#8e24aa' }}>
                Checkout
            </Typography>
            <Paper sx={{ padding: '2rem', borderRadius: '12px' }} elevation={3}>
                <Grid container spacing={4}>
                    {/* Shipping Address */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                        <TextField
                            label="Address"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                        />
                    </Grid>

                    {/* Payment Method */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Payment Method</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="payment-method-label">Payment Method</InputLabel>
                            <Select
                                labelId="payment-method-label"
                                value={paymentMethod}
                                label="Payment Method"
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <MenuItem value="Credit Card">Credit Card</MenuItem>
                                <MenuItem value="PayPal">PayPal</MenuItem>
                                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Order Summary */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Order Summary</Typography>
                        <Box sx={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                            {cartItems.map(item => (
                                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <Typography>{item.name} x{item.quantity}</Typography>
                                    <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                                </Box>
                            ))}
                            <Divider sx={{ margin: '1rem 0' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">${totalPrice.toFixed(2)}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Place Order Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePlaceOrder}
                            disabled={checkoutLoading}
                            startIcon={checkoutLoading && <CircularProgress size={20} color="inherit" />}
                            sx={{
                                padding: '0.8rem 2rem',
                                backgroundColor: '#8e24aa',
                                '&:hover': {
                                    backgroundColor: '#6a1b9a',
                                }
                            }}
                        >
                            {checkoutLoading ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </motion.div>
                </Box>
            </Paper>

            {/* Success Snackbar */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Order placed successfully!
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Checkout;
