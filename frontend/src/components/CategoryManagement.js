// src/components/CategoryManagement.js

import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, deleteCategory } from '../services/categoryService';
import {
    TextField,
    Button,
    Container,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function CategoryManagement() {
    // State variables for category data and user inputs
    const [categories, setCategories] = useState([]); // Stores all categories
    const [categoryName, setCategoryName] = useState(''); // Stores new category name input
    const [description, setDescription] = useState(''); // Stores new category description input
    const [alertOpen, setAlertOpen] = useState(false); // Controls Snackbar visibility
    const [alertMessage, setAlertMessage] = useState(''); // Message for Snackbar
    const [alertSeverity, setAlertSeverity] = useState('info'); // Severity for Snackbar feedback (success, error)

    // Fetch categories when the component is first rendered
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const data = await fetchCategories(); // API call to fetch categories
                setCategories(data); // Update state with fetched categories
                setAlertMessage('Categories loaded successfully.'); // Feedback for successful load
                setAlertSeverity('success'); // Set alert to success
                setAlertOpen(true); // Open alert
            } catch (error) {
                console.error("Error fetching categories:", error); // Log error for debugging
                setAlertMessage('Error fetching categories.'); // Feedback for failed fetch
                setAlertSeverity('error'); // Set alert to error
                setAlertOpen(true); // Open alert to notify user
            }
        };
        fetchCategoriesData(); // Trigger data fetch
    }, []);

    // Handler for adding a new category
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) { // Input validation for category name
            setAlertMessage("Category name is required."); // Alert if name is empty
            setAlertSeverity("error");
            setAlertOpen(true);
            return; // Prevent submission if validation fails
        }

        try {
            const newCategory = { name: categoryName.trim(), description: description.trim() }; // New category data
            const createdCategory = await createCategory(newCategory); // API call to create category
            setCategories([...categories, createdCategory]); // Update category list with new category
            setCategoryName(''); // Clear input fields after successful add
            setDescription('');
            setAlertMessage('Category added successfully!'); // Success feedback for user
            setAlertSeverity('success');
            setAlertOpen(true);
        } catch (error) {
            console.error("Error creating category:", error); // Log detailed error for debugging
            setAlertMessage('Error creating category.'); // Feedback for failed create
            setAlertSeverity('error'); // Set alert to error
            setAlertOpen(true);
        }
    };

    // Handler for deleting a category by its ID
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return; // Confirmation before deletion
        try {
            await deleteCategory(categoryId); // API call to delete category
            setCategories(categories.filter(category => category.id !== categoryId)); // Remove deleted category from list
            setAlertMessage('Category deleted successfully!'); // Success feedback for user
            setAlertSeverity('success');
            setAlertOpen(true);
        } catch (error) {
            console.error("Error deleting category:", error); // Log error for debugging
            setAlertMessage('Error deleting category.'); // Feedback for failed delete
            setAlertSeverity('error'); // Set alert to error
            setAlertOpen(true);
        }
    };

    // Close Snackbar alert after display
    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    return (
        <Container maxWidth="sm">
            {/* Form for creating a new category */}
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
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                    Add Category
                </Button>
            </form>

            {/* Display a list of existing categories in a table */}
            <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>Categories List</Typography>
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
                    {/* Map over categories to create table rows */}
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.id}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                                {/* Edit button placeholder for future implementation */}
                                <IconButton color="primary" onClick={() => alert('Edit Category (Not Implemented)')}>
                                    <Edit />
                                </IconButton>
                                {/* Delete button with confirmation */}
                                <IconButton color="secondary" onClick={() => handleDeleteCategory(category.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Snackbar alert for feedback on actions */}
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Container>
    );

}

export default CategoryManagement;
