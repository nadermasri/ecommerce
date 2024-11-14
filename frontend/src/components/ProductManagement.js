//components/ProductManagement.js
import React, { useEffect, useState } from 'react';
import {
    getProducts,
    addProduct,
    deleteProduct,
    bulkUploadProducts
} from '../services/productService';
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
    Snackbar
} from '@mui/material';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        stock_threshold: 10,
        category_id: '',
        subcategory_id: '',
        image: ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);  // Control alert visibility

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch all products
    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            setError('Failed to fetch products.');
            setAlertOpen(true);
        }
    };

    // Close alert
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // Input change handler with validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    // Validate product data
    const validateProductData = () => {
        if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.stock) {
            setError("Please fill in all required fields.");
            setAlertOpen(true);
            return false;
        }
        if (isNaN(newProduct.price) || parseFloat(newProduct.price) <= 0) {
            setError("Please enter a valid price.");
            setAlertOpen(true);
            return false;
        }
        if (isNaN(newProduct.stock) || parseInt(newProduct.stock) < 0) {
            setError("Please enter a valid stock quantity.");
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
                stock_threshold: parseInt(newProduct.stock_threshold, 10),
                category_id: newProduct.category_id ? parseInt(newProduct.category_id, 10) : null,
                subcategory_id: newProduct.subcategory_id ? parseInt(newProduct.subcategory_id, 10) : null,
            };
            await addProduct(formattedProduct);
            setSuccessMessage("Product added successfully!");
            setAlertOpen(true);
            fetchProducts();
            setNewProduct({
                name: '',
                description: '',
                price: '',
                stock: '',
                stock_threshold: 10,
                category_id: '',
                subcategory_id: '',
                image: ''
            });
        } catch (error) {
            setError("Failed to add product.");
            setAlertOpen(true);
        }
    };

    // Delete a product with error handling
    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter((product) => product.id !== id));
            setSuccessMessage("Product deleted successfully.");
            setAlertOpen(true);
        } catch (error) {
            setError("Failed to delete product.");
            setAlertOpen(true);
        }
    };

    // Bulk upload products with file validation and error handling
    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a CSV file first.");
            setAlertOpen(true);
            return;
        }
        try {
            const response = await bulkUploadProducts(file);
            setSuccessMessage(response.message || "Bulk upload completed successfully.");
            setAlertOpen(true);
            fetchProducts();
        } catch (error) {
            setError("Bulk upload failed.");
            setAlertOpen(true);
        }
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>Manage Products</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

            {/* Form for adding a new product */}
            <form onSubmit={handleAddProduct}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Name" name="name" value={newProduct.name} onChange={handleInputChange} fullWidth required />
                    <TextField label="Description" name="description" value={newProduct.description} onChange={handleInputChange} fullWidth required />
                    <TextField label="Price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} fullWidth required />
                    <TextField label="Stock" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} fullWidth required />
                    <TextField label="Stock Threshold" name="stock_threshold" type="number" value={newProduct.stock_threshold} onChange={handleInputChange} fullWidth />
                    <TextField label="Category ID" name="category_id" type="number" value={newProduct.category_id} onChange={handleInputChange} fullWidth required />
                    <TextField label="Subcategory ID" name="subcategory_id" type="number" value={newProduct.subcategory_id} onChange={handleInputChange} fullWidth />
                    <TextField label="Image URL" name="image" value={newProduct.image} onChange={handleInputChange} fullWidth />
                    <Button type="submit" variant="contained" color="primary" fullWidth>Add Product</Button>
                </Box>
            </form>

            {/* Form for bulk uploading products */}
            <form onSubmit={handleBulkUpload}>
                <Typography variant="h5" sx={{ marginTop: 4 }}>Bulk Upload Products</Typography>
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                <Button type="submit" variant="contained" color="primary">Upload CSV</Button>
            </form>

            {/* Snackbar alert for feedback */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleAlertClose} severity={error ? "error" : "success"}>
                    {error || successMessage}
                </Alert>
            </Snackbar>

            {/* Product list table */}
            <Table sx={{ marginTop: 4 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default ProductManagement;
