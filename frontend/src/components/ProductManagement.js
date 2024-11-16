// src/components/ProductManagement.js

import React, { useEffect, useState } from 'react';
import {
    getProducts,
    addProduct,
    deleteProduct,
    bulkUploadProducts
} from '../services/productService';
import { fetchCategories } from '../services/categoryService';          // Import fetchCategories
import { fetchSubcategories } from '../services/subcategoryService';    // Import fetchSubcategories
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    Box,
    Container,
    Typography,
    Alert,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);                    // State to store categories
    const [subcategories, setSubcategories] = useState([]);              // State to store all subcategories
    const [filteredSubcategories, setFilteredSubcategories] = useState([]); // State to store subcategories filtered by selected category
    const [loadingCategories, setLoadingCategories] = useState(true);    // Loading state for categories
    const [loadingSubcategories, setLoadingSubcategories] = useState(true); // Loading state for subcategories

    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        stock_threshold: '10',  // Keep as string for input handling
        category_id: '',
        subcategory_id: '',
        image: ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);  // Control alert visibility

    useEffect(() => {
        fetchAllData();
    }, []);

    // Reusable data fetching function
    const fetchAllData = async () => {
        try {
            // Fetch Products
            const productsData = await getProducts();
            const processedProducts = productsData.map(product => ({
                ...product,
                id: Number(product.id),  // Ensure 'id' is a number
                price: Number(product.price) || 0,
                stock: Number(product.stock) || 0,
                stock_threshold: Number(product.stock_threshold) || 10,
                category_id: product.category_id ? Number(product.category_id) : null,
                subcategory_id: product.subcategory_id ? Number(product.subcategory_id) : null,
            }));
            setProducts(processedProducts);

            // Fetch Categories
            const categoriesData = await fetchCategories();
            const sortedCategories = categoriesData.sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sortedCategories);
            setLoadingCategories(false);

            // Fetch Subcategories
            const subcategoriesData = await fetchSubcategories();
            const sortedSubcategories = subcategoriesData.sort((a, b) => a.name.localeCompare(b.name));
            setSubcategories(sortedSubcategories);
            setLoadingSubcategories(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError('Failed to fetch products, categories, or subcategories. Please try again.');
            setAlertOpen(true);
            setLoadingCategories(false);
            setLoadingSubcategories(false);
        }
    };

    // Close alert
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    // Handle category change
    const handleCategoryChange = (e) => {
        const selectedCategoryId = parseInt(e.target.value, 10);
        setNewProduct({ ...newProduct, category_id: selectedCategoryId, subcategory_id: '' });

        if (!isNaN(selectedCategoryId)) {
            const filtered = subcategories.filter(sub => sub.category_id === selectedCategoryId);
            setFilteredSubcategories(filtered);
        } else {
            setFilteredSubcategories([]);
        }
    };

    // Handle input changes with validation and sanitization
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (['price', 'stock', 'stock_threshold'].includes(name)) {
            // Allow only numbers and optionally a decimal point for price
            let sanitizedValue = value;
            if (typeof value === 'string') {
                sanitizedValue = name === 'price'
                    ? value.replace(/[^0-9.]/g, '')
                    : value.replace(/[^0-9]/g, '');
            }
            setNewProduct({ ...newProduct, [name]: sanitizedValue });
        } else {
            setNewProduct({ ...newProduct, [name]: value });
        }
    };

    // Validate product data
    const validateProductData = () => {
        const { name, description, price, stock, category_id, subcategory_id } = newProduct;

        if (!name || !description || !price || !stock || !category_id) {
            setError("Please fill in all required fields.");
            setAlertOpen(true);
            return false;
        }

        if (isNaN(newProduct.price) || parseFloat(newProduct.price) <= 0) {
            setError("Please enter a valid price.");
            setAlertOpen(true);
            return false;
        }

        if (isNaN(newProduct.stock) || parseInt(newProduct.stock, 10) < 0) {
            setError("Please enter a valid stock quantity.");
            setAlertOpen(true);
            return false;
        }

        if (isNaN(newProduct.category_id) || parseInt(newProduct.category_id, 10) <= 0) {
            setError("Please select a valid category.");
            setAlertOpen(true);
            return false;
        }

        if (newProduct.subcategory_id && (isNaN(newProduct.subcategory_id) || parseInt(newProduct.subcategory_id, 10) <= 0)) {
            setError("Please select a valid subcategory.");
            setAlertOpen(true);
            return false;
        }

        return true;
    };

    // Add a new product with validation and error handling
    const handleAddProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!validateProductData()) return;

        try {
            const formattedProduct = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock, 10),
                stock_threshold: parseInt(newProduct.stock_threshold, 10) || 10,
                category_id: parseInt(newProduct.category_id, 10),
                subcategory_id: newProduct.subcategory_id ? parseInt(newProduct.subcategory_id, 10) : null,
                image: newProduct.image.trim() || null,  // Trim whitespace or set to null
            };
            await addProduct(formattedProduct);
            setSuccessMessage("Product added successfully!");
            setAlertOpen(true);
            await fetchAllData();  // Refresh the product list
            setNewProduct({
                name: '',
                description: '',
                price: '',
                stock: '',
                stock_threshold: '10',
                category_id: '',
                subcategory_id: '',
                image: ''
            });
            setFilteredSubcategories([]);
        } catch (error) {
            console.error("Error adding product:", error);
            setError(error.response?.data?.error || "Failed to add product.");
            setAlertOpen(true);
        }
    };

    // Delete a product with error handling
    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
            setSuccessMessage("Product deleted successfully.");
            setAlertOpen(true);
            await fetchAllData();  // Refresh the product list
        } catch (error) {
            console.error("Error deleting product:", error);
            setError(error.response?.data?.error || "Failed to delete product.");
            setAlertOpen(true);
        }
    };

    // Bulk upload products with file validation and error handling
    console.log("Selected file:", file); // Add this line for debugging

    // Call bulk upload API
    const handleBulkUpload = async (e) => {
        e.preventDefault();
    
        // Check if file is selected
        if (!file) {
            setError("Please select a CSV file first.");
            setAlertOpen(true);
            return;
        }
    
        // Validate file type
        const allowedExtensions = /(\.csv)$/i;
        if (!allowedExtensions.exec(file.name)) {
            setError("Please upload a valid CSV file.");
            setAlertOpen(true);
            return;
        }
    
        try {
            const response = await bulkUploadProducts(file);
            setSuccessMessage(response.message || "Bulk upload completed successfully.");
            setAlertOpen(true);
            await fetchAllData();  // Refresh the product list
            setFile(null);  // Reset file input
            e.target.reset();  // Reset file input in the form
        } catch (error) {
            console.error("Bulk upload failed:", error);
            setError(error.response?.data?.error || "Bulk upload failed. Please ensure the CSV format is correct.");
            setAlertOpen(true);
        }
    };
    
    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>Manage Products</Typography>

            {/* Snackbar alert for feedback */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleAlertClose} severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                    {error || successMessage}
                </Alert>
            </Snackbar>

            {/* Form for adding a new product */}
            <form onSubmit={handleAddProduct}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Name"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Price ($)"
                        name="price"
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        value={newProduct.price}
                        onChange={handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Stock"
                        name="stock"
                        type="number"
                        inputProps={{ min: "0" }}
                        value={newProduct.stock}
                        onChange={handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Stock Threshold"
                        name="stock_threshold"
                        type="number"
                        inputProps={{ min: "0" }}
                        value={newProduct.stock_threshold}
                        onChange={handleInputChange}
                        fullWidth
                    />
                    {/* Category Dropdown */}
                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category_id"
                            value={newProduct.category_id}
                            onChange={handleCategoryChange}
                            label="Category"
                        >
                            {loadingCategories ? (
                                <MenuItem value="">
                                    <em>Loading...</em>
                                </MenuItem>
                            ) : categories.length > 0 ? (
                                categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="">
                                    <em>No Categories Available</em>
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    {/* Subcategory Dropdown */}
                    <FormControl fullWidth required disabled={!newProduct.category_id}>
                        <InputLabel>Subcategory</InputLabel>
                        <Select
                            name="subcategory_id"
                            value={newProduct.subcategory_id}
                            onChange={handleInputChange}
                            label="Subcategory"
                        >
                            {loadingSubcategories ? (
                                <MenuItem value="">
                                    <em>Loading...</em>
                                </MenuItem>
                            ) : filteredSubcategories.length > 0 ? (
                                filteredSubcategories.map((subcategory) => (
                                    <MenuItem key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="">
                                    <em>No Subcategories Available</em>
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Image URL"
                        name="image"
                        value={newProduct.image}
                        onChange={handleInputChange}
                        fullWidth
                        helperText="Optional: Provide a URL to the product image."
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>Add Product</Button>
                </Box>
            </form>

            {/* Form for bulk uploading products */}
            <form onSubmit={handleBulkUpload}>
                <Typography variant="h5" sx={{ marginTop: 4 }}>Bulk Upload Products</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="bulk-upload-file"
                />

                    <label htmlFor="bulk-upload-file">
                        <Button variant="outlined" component="span">Select CSV File</Button>
                    </label>
                    {file && <Typography variant="body1">{file.name}</Typography>}
                </Box>
                <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>Upload CSV</Button>
            </form>

            {/* Product list table */}
            <Table sx={{ marginTop: 4 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price ($)</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Stock Threshold</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Subcategory</TableCell>
                        <TableCell>Image</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>
                                ${typeof product.price === 'number' && !isNaN(product.price)
                                    ? product.price.toFixed(2)
                                    : '0.00'}
                            </TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>{product.stock_threshold}</TableCell>
                            <TableCell>
                                {categories.find(cat => cat.id === product.category_id)?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                                {subcategories.find(sub => sub.id === product.subcategory_id)?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                                {product.image ? (
                                    <a href={product.image} target="_blank" rel="noopener noreferrer">View Image</a>
                                ) : (
                                    'No Image'
                                )}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleDeleteProduct(product.id)}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
    }

    export default ProductManagement;
