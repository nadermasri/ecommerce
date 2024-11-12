// src/components/ProductManagement.js

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
    DialogTitle
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
    const [editingProduct, setEditingProduct] = useState(null);
    const [promotionPrice, setPromotionPrice] = useState('');
    const [file, setFile] = useState(null); // State for the bulk upload file

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
        const formattedProduct = {
            ...newProduct,
            price: parseFloat(newProduct.price),
            stock: parseInt(newProduct.stock, 10),
            stock_threshold: parseInt(newProduct.stock_threshold, 10),
            category_id: parseInt(newProduct.category_id, 10),
            subcategory_id: newProduct.subcategory_id ? parseInt(newProduct.subcategory_id, 10) : null,
        };

        try {
            const addedProduct = await addProduct(formattedProduct);
            setProducts((prevProducts) => [...prevProducts, addedProduct]);
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
            console.error("Failed to add product:", error);
            if (error.response) {
                alert(`Backend error: ${JSON.stringify(error.response.data)}`);
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter((product) => product.id !== id));
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct(product);
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        const updatedProduct = {
            ...newProduct,
            price: parseFloat(newProduct.price),
            stock: parseInt(newProduct.stock, 10),
            stock_threshold: parseInt(newProduct.stock_threshold, 10),
            category_id: parseInt(newProduct.category_id, 10),
            subcategory_id: newProduct.subcategory_id ? parseInt(newProduct.subcategory_id, 10) : null,
        };

        try {
            const updated = await updateProduct(editingProduct.id, updatedProduct);
            setProducts(products.map((product) => (product.id === editingProduct.id ? updated : product)));
            setEditingProduct(null);
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
            console.error("Failed to update product:", error);
        }
    };

    const handlePromotion = async (id) => {
        try {
            await setPromotion(id, parseFloat(promotionPrice));
            alert("Promotion set successfully");
            fetchProducts();
        } catch (error) {
            console.error("Failed to set promotion:", error);
            alert(`Error setting promotion: ${error.response?.data?.error || error.message}`);
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
            console.error("Bulk upload failed:", error);
            if (error.response) {
                alert(`Backend error: ${JSON.stringify(error.response.data)}`);
            }
        }
    };

    return (
        <div>
            <h2>Manage Products</h2>

            <form onSubmit={handleAddProduct}>
                <h3>Add Product</h3>
                <TextField label="Name" name="name" value={newProduct.name} onChange={handleInputChange} required />
                <TextField label="Description" name="description" value={newProduct.description} onChange={handleInputChange} required />
                <TextField label="Price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} required />
                <TextField label="Stock" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} required />
                <TextField label="Stock Threshold" name="stock_threshold" type="number" value={newProduct.stock_threshold} onChange={handleInputChange} />
                <TextField label="Category ID" name="category_id" type="number" value={newProduct.category_id} onChange={handleInputChange} required />
                <TextField label="Subcategory ID" name="subcategory_id" type="number" value={newProduct.subcategory_id} onChange={handleInputChange} />
                <TextField label="Image URL" name="image" value={newProduct.image} onChange={handleInputChange} />
                <Button type="submit" variant="contained" color="primary">Add Product</Button>
            </form>

            <form onSubmit={handleBulkUpload}>
                <h3>Bulk Upload Products</h3>
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
                                <Button variant="contained" color="primary" onClick={() => handleEditProduct(product)}>Edit</Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                                <Button variant="contained" onClick={() => handlePromotion(product.id)}>Set Promotion</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {editingProduct && (
                <Dialog open={true} onClose={() => setEditingProduct(null)}>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogContent>
                        <TextField label="Name" name="name" value={newProduct.name} onChange={handleInputChange} />
                        <TextField label="Description" name="description" value={newProduct.description} onChange={handleInputChange} />
                        <TextField label="Price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} />
                        <TextField label="Stock" name="stock" type="number" value={newProduct.stock} onChange={handleInputChange} />
                        <TextField label="Stock Threshold" name="stock_threshold" type="number" value={newProduct.stock_threshold} onChange={handleInputChange} />
                        <TextField label="Category ID" name="category_id" type="number" value={newProduct.category_id} onChange={handleInputChange} />
                        <TextField label="Subcategory ID" name="subcategory_id" type="number" value={newProduct.subcategory_id} onChange={handleInputChange} />
                        <TextField label="Image URL" name="image" value={newProduct.image} onChange={handleInputChange} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleUpdateProduct} color="primary">Save</Button>
                        <Button onClick={() => setEditingProduct(null)} color="secondary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            )}

            <Dialog open={Boolean(promotionPrice)} onClose={() => setPromotionPrice('')}>
                <DialogTitle>Set Promotion Price</DialogTitle>
                <DialogContent>
                    <TextField label="Discounted Price" type="number" value={promotionPrice} onChange={(e) => setPromotionPrice(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handlePromotion(editingProduct.id)} color="primary">Apply</Button>
                    <Button onClick={() => setPromotionPrice('')} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ProductManagement;
