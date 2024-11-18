// frontend/src/components/Customer/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    TextField,
    Snackbar,
    Alert,
    Paper,
    Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/formatPrice'; // Import helper function
import '../../assets/css/priceStyles.css'; // Import price styles

function ProductDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        const getProduct = async () => {
            try {
                const data = await fetchProductById(parseInt(productId, 10));
                console.log("Fetched Product:", data); // Debugging
                if (data && data.price) {
                    setProduct(data);
                } else {
                    throw new Error("Product data is incomplete.");
                }
            } catch (err) {
                setError(err.message || 'Failed to load product.');
            } finally {
                setLoading(false);
            }
        };
        getProduct();
    }, [productId]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product.id, quantity);
            setSnackbarMessage('Product added to cart!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (err) {
            setSnackbarMessage(err.message || 'Failed to add product to cart.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress size={50} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '5rem' }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '5rem' }}>
                <Typography variant="h6">Product not found.</Typography>
            </Box>
        );
    }

    const formattedPrice = formatPrice(product.price);
    const formattedDiscountedPrice = product.discounted_price ? formatPrice(product.discounted_price) : null;

    return (
        <Box sx={{ padding: '3rem 2rem', backgroundColor: '#fafafa' }}>
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '2rem' }}>
                {product.name}
            </Typography>
            
            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: '2rem', borderRadius: '12px' }}>
                        <motion.img
                            src={product.image || 'https://via.placeholder.com/400'}
                            alt={product.name}
                            style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
                            whileHover={{ scale: 1.05 }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: 3 }}>
                        {formattedDiscountedPrice ? (
                            <>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                    Price: <span className="original-price">${formattedPrice}</span> <span className="discounted-price">${formattedDiscountedPrice}</span>
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                Price: ${formattedPrice}
                            </Typography>
                        )}
                        <Typography variant="body1" sx={{ marginBottom: '1rem', color: '#555' }}>
                            {product.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                InputProps={{ inputProps: { min: 1 } }}
                                sx={{ width: '100px' }}
                            />
                            <Button variant="contained" color="primary" onClick={handleAddToCart} sx={{ padding: '0.8rem 2rem' }}>
                                Add to Cart
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Snackbar for feedback */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
    }

    export default ProductDetail;
