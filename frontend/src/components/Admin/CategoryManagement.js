// src/components/CategoryManagement.js

import React, { useState, useEffect } from 'react';
import { fetchCategories, createCategory, deleteCategory, updateCategory } from '../../services/categoryService';
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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
    const [isEditing, setIsEditing] = useState(false); // State to control edit dialog
    const [currentCategory, setCurrentCategory] = useState(null); // Category being edited

    // Function to fetch categories
    const fetchCategoriesData = async () => {
        try {
            const data = await fetchCategories(); // API call to fetch categories
            setCategories(data); // Update state with fetched categories
        } catch (error) {
            console.error("Error fetching categories:", error); // Log error for debugging
            setAlertMessage('Error fetching categories.');
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    // Fetch categories when the component is first rendered
    useEffect(() => {
        fetchCategoriesData()
            .then(() => {
                setAlertMessage('Categories loaded successfully.');
                setAlertSeverity('success');
                setAlertOpen(true);
            })
            .catch(() => {
                // Error handling is already managed in fetchCategoriesData
            });
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
            setAlertMessage('Category added successfully!');
            setAlertSeverity('success');
            setAlertOpen(true);
        } catch (error) {
            console.error("Error creating category:", error); // Log detailed error for debugging
            const errorMsg = error.response?.data?.error || 'Error creating category.';
            setAlertMessage(errorMsg);
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    // Handler for deleting a category by its ID
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return; // Confirmation before deletion
        try {
            await deleteCategory(categoryId); // API call to delete category
            setAlertMessage('Category deleted successfully.');
            setAlertSeverity('success');
            setAlertOpen(true);
            await fetchCategoriesData(); // Refresh the categories list
        } catch (error) {
            console.error("Error deleting category:", error); // Log error for debugging
            const errorMsg = error.response?.data?.error || "Error deleting category.";
            setAlertMessage(errorMsg);
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    // Handler for initiating edit
    const handleEditCategory = (category) => {
        setCurrentCategory(category);
        setIsEditing(true);
    };

    // Handler for saving edited category
    const handleSaveEdit = async () => {
        if (!currentCategory.name.trim()) {
            setAlertMessage("Category name is required.");
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
        }

        try {
            const updatedData = {
                name: currentCategory.name.trim(),
                description: currentCategory.description.trim(),
            };
            const updatedCategory = await updateCategory(currentCategory.id, updatedData);
            setCategories(categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
            setAlertMessage('Category updated successfully!');
            setAlertSeverity('success');
            setAlertOpen(true);
            setIsEditing(false);
            setCurrentCategory(null);
        } catch (error) {
            console.error("Error updating category:", error);
            const errorMsg = error.response?.data?.error || 'Error updating category.';
            setAlertMessage(errorMsg);
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    // Handler for closing edit dialog
    const handleCloseEdit = () => {
        setIsEditing(false);
        setCurrentCategory(null);
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
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.id}</TableCell>
                            <TableCell>{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                                {/* Edit Button */}
                                <IconButton color="primary" onClick={() => handleEditCategory(category)}>
                                    <Edit />
                                </IconButton>
                                {/* Delete Button */}
                                <IconButton color="secondary" onClick={() => handleDeleteCategory(category.id)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Edit Category Dialog */}
            <Dialog open={isEditing} onClose={handleCloseEdit}>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    {currentCategory && (
                        <>
                            <TextField
                                label="Category Name"
                                fullWidth
                                value={currentCategory.name}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                value={currentCategory.description}
                                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                margin="normal"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit} color="secondary">Cancel</Button>
                    <Button onClick={handleSaveEdit} color="primary">Save</Button>
                </DialogActions>
            </Dialog>

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
