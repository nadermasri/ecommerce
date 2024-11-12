// frontend/src/components/CreateAdminForm.js
import React, { useState } from 'react';
import { createAdmin } from '../services/adminService';
import { TextField, Button, Container, Typography, Select, MenuItem } from '@mui/material';

function CreateAdminForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await createAdmin(username, email, password, role);
            setMessage(data.message);  // Display success message
        } catch (error) {
            setMessage("Failed to create admin: " + error.response?.data?.error || error.message);
        }
    };

    return (
        <Container>
            <Typography variant="h4" align="center">Create New Admin</Typography>
            <TextField 
                label="Username" 
                fullWidth 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                margin="normal"
            />
            <TextField 
                label="Email" 
                fullWidth 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                margin="normal"
            />
            <TextField 
                label="Password" 
                type="password" 
                fullWidth 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                margin="normal"
            />
            <Select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                margin="normal"
            >
                <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                <MenuItem value="OrderManager">Order Manager</MenuItem>
                <MenuItem value="ProductManager">Product Manager</MenuItem>
                <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
            </Select>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSubmit} 
                fullWidth
            >
                Create Admin
            </Button>
            {message && <Typography color="secondary" align="center">{message}</Typography>}
        </Container>
    );
}

export default CreateAdminForm;
