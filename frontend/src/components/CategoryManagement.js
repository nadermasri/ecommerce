// src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, deleteCategory } from '../services/categoryService';
import { TextField, Button, Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (error) {
                setMessage('Error fetching categories.');
                console.error(error);
            }
        };
        fetchCategoriesData();
    }, []);

    // Add a new category
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            const newCategory = { name: categoryName, description };
            const createdCategory = await createCategory(newCategory);
            setCategories([...categories, createdCategory]);
            setCategoryName('');
            setDescription('');
            setMessage('Category added successfully!');
        } catch (error) {
            setMessage('Error creating category.');
            console.error(error);
        }
    };

    // Delete category
    const handleDeleteCategory = async (categoryId) => {
        try {
            await deleteCategory(categoryId);
            setCategories(categories.filter(category => category.id !== categoryId));
            setMessage('Category deleted successfully!');
        } catch (error) {
            setMessage('Error deleting category.');
            console.error(error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h5" gutterBottom>Create New Category</Typography>
            <form onSubmit={handleAddCategory}>
                <TextField
                    label="Category Name"
                    fullWidth
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    label="Description"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Add Category
                </Button>
            </form>
            {message && <Typography color="error" align="center">{message}</Typography>}

            <Typography variant="h6" gutterBottom>Categories List</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Category ID</TableCell>
                        <TableCell>Category Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.id}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                                <IconButton color="primary" onClick={() => alert('Edit Category')}>
                                    <Edit />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => handleDeleteCategory(category.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Container>
    );
}

export default CategoryManagement;
