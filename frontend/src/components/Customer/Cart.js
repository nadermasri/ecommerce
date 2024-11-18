import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Divider,
    Box,
    TextField
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { getCartItems, removeFromCart, updateCartItem } from '../../services/cartService';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

function Cart({ open, handleClose }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (open) {
            fetchCart();
        }
    }, [open]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const items = await getCartItems();
            setCartItems(items);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            setError('Failed to load cart items.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await removeFromCart(itemId);
            setCartItems(prev => prev.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error removing item from cart:', error);
            setError('Failed to remove item from cart.');
        }
    };

    const handleQuantityChange = async (itemId, quantity) => {
        if (quantity < 1) return;
        setUpdating(true);
        try {
            await updateCartItem(itemId, quantity);
            setCartItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                )
            );
        } catch (error) {
            console.error('Error updating cart item:', error);
            setError('Failed to update cart item.');
        } finally {
            setUpdating(false);
        }
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#8e24aa' }}>Your Shopping Cart</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                        <CircularProgress size={50} />
                    </Box>
                ) : cartItems.length === 0 ? (
                    <Typography align="center" color="text.secondary">Your cart is empty.</Typography>
                ) : (
                    <List>
                        {cartItems.map(item => (
                            <React.Fragment key={item.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="square"
                                            src={item.image || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            sx={{ width: 60, height: 60, mr: 2 }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" component={Link} to={`/products/${item.product_id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                                                {item.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.primary">
                                                    Price: ${item.price.toFixed(2)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                    <Typography variant="body2" sx={{ mr: 1 }}>Quantity:</Typography>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                                        InputProps={{ inputProps: { min: 1 } }}
                                                        sx={{ width: '60px' }}
                                                        disabled={updating}
                                                    />
                                                </Box>
                                            </>
                                        }
                                    />
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(item.id)}>
                                        <DeleteIcon sx={{ color: '#e91e63' }} />
                                    </IconButton>
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
                {error && <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>{error}</Typography>}
            </DialogContent>
            <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem' }}>
                <Box>
                    <Typography variant="h6">Total: ${totalPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={handleClose} color="secondary">Close</Button>
                    {cartItems.length > 0 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="contained" color="primary" component={Link} to="/checkout" onClick={handleClose}>
                                Checkout
                            </Button>
                        </motion.div>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default Cart;
