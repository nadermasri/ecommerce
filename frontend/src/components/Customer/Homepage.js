import React from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { motion } from 'framer-motion';

function Homepage() {
    const [featuredProducts, setFeaturedProducts] = React.useState([]);

    React.useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const products = await getProducts();
                // Assuming the first 4 products are featured
                setFeaturedProducts(products.slice(0, 4));
            } catch (error) {
                console.error('Error fetching featured products:', error);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <Box sx={{ padding: '2rem', backgroundColor: '#f5f5f5' }}>
            {/* Hero Section */}
            <Box sx={{
                textAlign: 'center',
                marginBottom: '4rem',
                backgroundImage: 'url(https://lp-cms-production.imgix.net/2023-03/shutterstockRF_756972694.jpg?w=1440&h=810&fit=crop&auto=format&q=75)', // Replace with a hero image
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '6rem 2rem',
                color: '#fff',
                borderRadius: '8px',
                boxShadow: 4
            }}>
                <Typography variant="h3" sx={{
                    fontWeight: 'bold',
                    fontSize: '3rem',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'
                }} gutterBottom>
                    Welcome to Our E-Commerce Shop
                </Typography>
                <Typography variant="h5" sx={{ marginBottom: '2rem' }}>
                    Find the best products at unbeatable prices!
                </Typography>
                <Button variant="contained" color="primary" size="large" component={Link} to="/products" sx={{
                    background: 'linear-gradient(45deg, #003366 30%, #2c3e50 90%)',
                    padding: '1rem 3rem',
                    fontWeight: 'bold',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #2c3e50 30%, #003366 90%)'
                    }
                }}>
                    Shop Now
                </Button>
            </Box>

            {/* Featured Products Section */}
            <Typography variant="h4" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '3rem' }}>
                Featured Products
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {featuredProducts.map(product => (
                    <Grid item key={product.id} xs={12} sm={6} md={3}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Card sx={{
                                maxWidth: 345,
                                borderRadius: '15px',
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'scale(1.05)',
                                    transition: '0.3s ease-in-out'
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image || 'https://via.placeholder.com/200'}
                                    alt={product.name}
                                    sx={{
                                        borderTopLeftRadius: '15px',
                                        borderTopRightRadius: '15px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        ${product.price}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                                    <Button size="small" component={Link} to={`/products/${product.id}`} sx={{
                                        color: '#003366',
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            background: 'rgba(0, 51, 102, 0.1)',
                                            transform: 'scale(1.05)',
                                        }
                                    }}>
                                        View
                                    </Button>
                                    <Button size="small" variant="contained" color="primary" component={Link} to={`/cart/add/${product.id}`} sx={{
                                        background: '#003366',
                                        '&:hover': {
                                            background: '#2c3e50'
                                        }
                                    }}>
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Promotions Section */}
            <Box sx={{
                textAlign: 'center',
                marginTop: '5rem',
                padding: '3rem',
                backgroundColor: '#003366',
                borderRadius: '10px',
                boxShadow: 4
            }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }} gutterBottom>
                    Current Promotions
                </Typography>
                <Typography variant="h6" sx={{ color: '#fff', marginBottom: '2rem' }}>
                    Don't miss out on our latest discounts and offers!
                </Typography>
                <Button variant="outlined" color="secondary" size="large" component={Link} to="/promotions" sx={{
                    borderColor: '#fff',
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#fff',
                        color: '#003366',
                    }
                }}>
                    View All Promotions
                </Button>
            </Box>
        </Box>
    );
}

export default Homepage;
