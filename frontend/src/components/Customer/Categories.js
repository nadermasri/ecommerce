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
    Paper
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/formatPrice'; // Import helper function
import '../../assets/css/priceStyles.css'; // Import price styles

function Categories() {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            try {
                const [allProducts, allCategories] = await Promise.all([
                    getProducts(),
                    fetchCategories()
                ]);
                const foundCategory = allCategories.find(cat => cat.id === parseInt(categoryId));
                setCategory(foundCategory);
                const filteredProducts = allProducts.filter(product => product.category_id === parseInt(categoryId));
                setProducts(filteredProducts);
            } catch (error) {
                console.error('Error fetching category or products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryAndProducts();
    }, [categoryId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress size={50} />
            </Box>
        );
    }

    if (!category) {
        return (
            <Box sx={{ textAlign: 'center', marginTop: '5rem' }}>
                <Typography variant="h6" color="error">Category not found.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '3rem 2rem', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#003366' }}>
                {category.name} Products
            </Typography>

            {/* Products Grid */}
            <Grid container spacing={4} justifyContent="center">
                {products.map(product => (
                    <Grid item key={product.id} xs={12} sm={6} md={3}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Card sx={{
                                borderRadius: '16px',
                                boxShadow: 3,
                                transition: '0.3s ease',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'scale(1.05)',
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.image || 'https://via.placeholder.com/200'}
                                    alt={product.name}
                                    sx={{
                                        borderTopLeftRadius: '16px',
                                        borderTopRightRadius: '16px',
                                        objectFit: 'cover',
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                                    {product.discounted_price ? (
                                        <>
                                            <Typography variant="body2" color="text.secondary" className="original-price">
                                                ${formatPrice(product.price)}
                                            </Typography>
                                            <Typography variant="body1" className="discounted-price">
                                                ${formatPrice(product.discounted_price)}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" className="price-text" sx={{ fontWeight: 'bold' }}>
                                            ${formatPrice(product.price)}
                                        </Typography>
                                    )}
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

            {/* No Products Found */}
            {products.length === 0 && (
                <Box sx={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Typography variant="h6" color="text.secondary">
                        No products found in this category.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default Categories;
