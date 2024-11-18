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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Pagination,
    Paper
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { fetchCategories } from '../../services/categoryService';
import { motion } from 'framer-motion';
import { formatPrice } from '../../utils/formatPrice'; // Import helper function
import '../../assets/css/priceStyles.css'; // Import price styles

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Products() {
    const query = useQuery();
    const searchQuery = query.get('search') || '';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allProducts, allCategories] = await Promise.all([
                    getProducts(),
                    fetchCategories()
                ]);
                setProducts(allProducts);
                setCategories(allCategories);
            } catch (error) {
                console.error('Error fetching products or categories:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const category = categories.find(cat => cat.id === selectedCategory);
            if (category && category.subcategories) {
                setSubcategories(category.subcategories);
            } else {
                setSubcategories([]);
            }
        } else {
            setSubcategories([]);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        let tempProducts = [...products];

        // Filter by search query
        if (searchQuery) {
            tempProducts = tempProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            tempProducts = tempProducts.filter(product => product.category_id === selectedCategory);
        }

        // Filter by subcategory
        if (selectedSubcategory) {
            tempProducts = tempProducts.filter(product => product.subcategory_id === selectedSubcategory);
        }

        setFilteredProducts(tempProducts);
        setCurrentPage(1); // Reset to first page on filter change
    }, [products, searchQuery, selectedCategory, selectedSubcategory]);

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Box sx={{ padding: '3rem 2rem', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '2rem' }}>All Products</Typography>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{ borderRadius: '8px', '& .MuiSelect-icon': { color: '#003366' } }}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map(category => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {subcategories.length > 0 && (
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="subcategory-label">Subcategory</InputLabel>
                        <Select
                            labelId="subcategory-label"
                            value={selectedSubcategory}
                            label="Subcategory"
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            sx={{ borderRadius: '8px', '& .MuiSelect-icon': { color: '#003366' } }}
                        >
                            <MenuItem value="">All Subcategories</MenuItem>
                            {subcategories.map(sub => (
                                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {/* Products Grid */}
            <Grid container spacing={4} justifyContent="center">
                {currentProducts.map(product => (
                    <Grid item key={product.id} xs={12} sm={6} md={3}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                            <Card sx={{
                                maxWidth: 345,
                                borderRadius: '16px',
                                boxShadow: 3,
                                transition: '0.3s ease',
                                '&:hover': {
                                    boxShadow: 8,
                                    transform: 'scale(1.05)'
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
                                        objectFit: 'cover'
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
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 51, 102, 0.1)',
                                            transform: 'scale(1.05)'
                                        }
                                    }}>
                                        View
                                    </Button>
                                    <Button size="small" variant="contained" color="primary" component={Link} to={`/cart/add/${product.id}`} sx={{
                                        backgroundColor: '#003366',
                                        '&:hover': {
                                            backgroundColor: '#2c3e50'
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
                </Box>
            )}

            {/* No Products Found */}
            {filteredProducts.length === 0 && (
                <Box sx={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Typography variant="h6">No products found.</Typography>
                </Box>
            )}
        </Box>
    );
}

export default Products;
