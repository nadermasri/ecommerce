import React, { useState, useEffect } from 'react';
import { fetchSubcategories, createSubcategory, deleteSubcategory } from '../services/subcategoryService';
import { fetchCategories } from '../services/categoryService';
import { TextField, Button, Container, Typography, Select, MenuItem, FormControl, InputLabel, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function SubcategoryManagement() {
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');

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
            }
        };
        fetchData();
    }, []);

    // Add a new subcategory
    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        try {
            const newSubcategory = { name: subcategoryName, category_id: categoryId };
            console.log("Creating subcategory with data:", newSubcategory);  // Log request data to check
            const createdSubcategory = await createSubcategory(newSubcategory);
    
            // Log the response to check the structure
            console.log("Created subcategory:", createdSubcategory);
            
            setSubcategories([...subcategories, createdSubcategory]);
            setSubcategoryName('');
            setCategoryId('');
            setMessage('Subcategory added successfully!');
        } catch (error) {
            setMessage('Error creating subcategory.');
            console.error(error);
        }
    };

    // Delete subcategory
    const handleDeleteSubcategory = async (subcategoryId) => {
        try {
            await deleteSubcategory(subcategoryId);
            setSubcategories(subcategories.filter(subcategory => subcategory.id !== subcategoryId));
            setMessage('Subcategory deleted successfully!');
        } catch (error) {
            setMessage('Error deleting subcategory.');
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
            {message && <Typography color="error" align="center">{message}</Typography>}

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
                            <TableCell>{subcategory.category ? subcategory.category.name : 'No Category'}</TableCell>  {/* Fix: Category display */}
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
