import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { fetchPromotions } from '../../services/promotionService'; // Assume you have a promotionService
import { motion } from 'framer-motion';

function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotionsAndProducts = async () => {
            try {
                const [allProducts, allPromotions] = await Promise.all([
                    getProducts(),
                    fetchPromotions()
                ]);

                // Assuming promotions have a list of product IDs
                const promotedProductIds = allPromotions.reduce((acc, promo) => {
                    return acc.concat(promo.product_ids || []);
                }, []);

                const uniquePromotedProductIds = [...new Set(promotedProductIds)];
                const promotedProducts = allProducts.filter(product => uniquePromotedProductIds.includes(product.id));
                setPromotions(allPromotions);
                setProducts(promotedProducts);
            } catch (error) {
                console.error('Error fetching promotions or products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotionsAndProducts();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress size={50} color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '2rem' }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#003366' }}>
                Current Promotions
            </Typography>

            {/* Promotions Grid */}
            <Grid container spacing={4} justifyContent="center">
                {products.map(product => (
                    <Grid item key={product.id} xs={12} sm={6} md={3}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Card sx={{
                                borderRadius: '12px',
                                boxShadow: 3,
                                transition: '0.3s ease',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'scale(1.03)',
                                },
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image || 'https://via.placeholder.com/200'}
                                    alt={product.name}
                                    sx={{
                                        borderTopLeftRadius: '12px',
                                        borderTopRightRadius: '12px',
                                        objectFit: 'cover',
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                        ${product.price}
                                    </Typography>
                                    <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>
                                        ${product.discounted_price || 'N/A'}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                                    <Button size="small" component={Link} to={`/products/${product.id}`} sx={{
                                        color: '#003366',
                                        '&:hover': { backgroundColor: 'rgba(0, 51, 102, 0.1)' }
                                    }}>
                                        View
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        component={Link}
                                        to={`/cart/add/${product.id}`}
                                        sx={{
                                            backgroundColor: '#003366',
                                            '&:hover': {
                                                backgroundColor: '#2c3e50'
                                            }
                                        }}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* No Promotions Found */}
            {products.length === 0 && (
                <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Typography variant="h6" color="text.secondary">
                        No promotions available at the moment.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default Promotions;
