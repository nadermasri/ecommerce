// src/components/SubcategoryManagement.js

import React, { useState, useEffect } from 'react';
import { fetchSubcategories, createSubcategory, deleteSubcategory } from '../services/subcategoryService';
import { fetchCategories } from '../services/categoryService';
import {
    TextField,
    Button,
    Container,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
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

function SubcategoryManagement() {
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [alertOpen, setAlertOpen] = useState(false);  // State to control alert visibility
    const [alertMessage, setAlertMessage] = useState(''); // Message for Snackbar
    const [alertSeverity, setAlertSeverity] = useState('info'); // Severity for Snackbar feedback (success, error)

    // Fetch categories and subcategories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subcategoriesData, categoriesData] = await Promise.all([
                    fetchSubcategories(),
                    fetchCategories(),
                ]);
                setSubcategories(subcategoriesData);
                setCategories(categoriesData);
                setAlertMessage('Data loaded successfully.');
                setAlertSeverity('success');
                setAlertOpen(true);
            } catch (error) {
                console.error("Error fetching data:", error);
                setAlertMessage('Error fetching data.');
                setAlertSeverity('error');
                setAlertOpen(true);
            }
        };
        fetchData();
    }, []);

    // Handler for adding a new subcategory
    const handleAddSubcategory = async (e) => {
        e.preventDefault();

        // Validate inputs to ensure subcategory name and categoryId are provided
        if (!subcategoryName.trim() || !categoryId) {
            setAlertMessage('Please provide all required fields.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }

        try {
            const newSubcategory = { name: subcategoryName.trim(), category_id: categoryId };
            const createdSubcategory = await createSubcategory(newSubcategory);

            setSubcategories([...subcategories, createdSubcategory]);
            setSubcategoryName('');
            setCategoryId('');
            setAlertMessage('Subcategory added successfully!');
            setAlertSeverity('success');
            setAlertOpen(true);
        } catch (error) {
            console.error("Error creating subcategory:", error);
            setAlertMessage('Error creating subcategory.');
            setAlertSeverity('error');
            setAlertOpen(true);
        }
    };

    // Handler for deleting subcategory with error handling
    const handleDeleteSubcategory = async (subcategoryId) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) return; // Confirmation before deletion
        try {
            await deleteSubcategory(subcategoryId);
            setSubcategories(subcategories.filter(subcategory => subcategory.id !== subcategoryId));
            setAlertMessage('Subcategory deleted successfully!');
            setAlertSeverity('success');
            setAlertOpen(true);
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            setAlertMessage('Error deleting subcategory.');
            setAlertSeverity('error');
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
            <Typography variant="h5" gutterBottom>Create New Subcategory</Typography>
            <form onSubmit={handleAddSubcategory}>
                <TextField
                    label="Subcategory Name"
                    fullWidth
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        required
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                    Add Subcategory
                </Button>
            </form>

            {/* Snackbar alert for user messages */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            {/* Subcategories List */}
            <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>Subcategories List</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Subcategory ID</TableCell>
                        <TableCell>Subcategory Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {subcategories.map((subcategory) => (
                        <TableRow key={subcategory.id}>
                            <TableCell>{subcategory.id}</TableCell>
                            <TableCell>{subcategory.name}</TableCell>
                            <TableCell>{subcategory.category ? subcategory.category.name : 'No Category'}</TableCell>
                            <TableCell>
                                {/* Edit button placeholder for future implementation */}
                                <IconButton color="primary" onClick={() => alert('Edit Subcategory (Not Implemented)')}>
                                    <Edit />
                                </IconButton>
                                {/* Delete button with confirmation */}
                                <IconButton color="secondary" onClick={() => handleDeleteSubcategory(subcategory.id)}>
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

export default SubcategoryManagement;
