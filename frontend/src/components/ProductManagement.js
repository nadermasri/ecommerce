import React, { useEffect, useState } from 'react';
import {
    getProducts,
    addProduct,
    deleteProduct,
    updateProduct,
    setPromotion,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Container,
    Typography
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({ ...newProduct, [name]: value });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const formattedProduct = {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock, 10),
                stock_threshold: parseInt(newProduct.stock_threshold, 10),
                category_id: parseInt(newProduct.category_id, 10),
                subcategory_id: newProduct.subcategory_id ? parseInt(newProduct.subcategory_id, 10) : null,
            };
            await addProduct(formattedProduct);
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
            alert("Failed to add product.");
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter((product) => product.id !== id));
        } catch (error) {
            alert("Failed to delete product.");
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a CSV file first.");
            return;
        }
        try {
            const response = await bulkUploadProducts(file);
            alert(response.message);
            fetchProducts();
        } catch (error) {
            alert("Bulk upload failed.");
        }
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>Manage Products</Typography>
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

            <form onSubmit={handleBulkUpload}>
                <Typography variant="h5" sx={{ marginTop: 4 }}>Bulk Upload Products</Typography>
                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
                <Button type="submit" variant="contained" color="primary">Upload CSV</Button>
            </form>

            <Table>
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
