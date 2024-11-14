//components/SubcategoryManagement.js
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
    Alert,
    Snackbar
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function SubcategoryManagement() {
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);  // State to control alert visibility

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
            } catch (error) {
                setMessage('Error fetching data.');
                setAlertOpen(true);
            }
        };
        fetchData();
    }, []);

    // Handle success/error messages display
    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    // Add a new subcategory with input validation and error handling
    const handleAddSubcategory = async (e) => {
        e.preventDefault();

        // Validate inputs to ensure subcategory name and categoryId are provided
        if (!subcategoryName || !categoryId) {
            setMessage('Please provide all required fields.');
            setAlertOpen(true);
            return;
        }

        try {
            const newSubcategory = { name: subcategoryName, category_id: categoryId };
            const createdSubcategory = await createSubcategory(newSubcategory);

            setSubcategories([...subcategories, createdSubcategory]);
            setSubcategoryName('');
            setCategoryId('');
            setMessage('Subcategory added successfully!');
            setAlertOpen(true);
        } catch (error) {
            setMessage('Error creating subcategory.');
            setAlertOpen(true);
            console.error(error);
        }
    };

    // Delete subcategory with error handling
    const handleDeleteSubcategory = async (subcategoryId) => {
        try {
            await deleteSubcategory(subcategoryId);
            setSubcategories(subcategories.filter(subcategory => subcategory.id !== subcategoryId));
            setMessage('Subcategory deleted successfully!');
            setAlertOpen(true);
        } catch (error) {
            setMessage('Error deleting subcategory.');
            setAlertOpen(true);
            console.error(error);
        }
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
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Add Subcategory
                </Button>
            </form>

            {/* Snackbar alert for user messages */}
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleAlertClose} severity={message.includes('Error') ? 'error' : 'success'}>
                    {message}
                </Alert>
            </Snackbar>

            <Typography variant="h6" gutterBottom>Subcategories List</Typography>
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
                                <IconButton color="primary" onClick={() => alert('Edit Subcategory')}>
                                    <Edit />
                                </IconButton>
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
