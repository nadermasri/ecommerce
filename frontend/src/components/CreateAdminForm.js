//ecommerce/frontend/src/components/CreateAdminForm.js
import React, { useState } from 'react';
import { createAdmin } from '../services/adminService';
import { TextField, Button, Container, Typography, Select, MenuItem, Box } from '@mui/material';

function CreateAdminForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [message, setMessage] = useState('');

    // Regular expression to enforce username format: only alphanumeric, no spaces or special characters
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if all fields are filled
        if (!username || !email || !password || !role) {
            setMessage("All fields are required.");
            return;
        }

        // Validate username
        if (!usernameRegex.test(username)) {
            setMessage("Username can only contain letters and numbers, with no spaces or special characters.");
            return;
        }

        // Basic sanitization to prevent XSS attacks (use a library like DOMPurify in production)
        const sanitizedUsername = username.replace(/[<>]/g, "");
        const sanitizedEmail = email.replace(/[<>]/g, "");
        const sanitizedRole = role.replace(/[<>]/g, "");

        try {
            const data = await createAdmin(sanitizedUsername, sanitizedEmail, password, sanitizedRole);
            setMessage(data.message);  // Display success message
        } catch (error) {
            setMessage("Failed to create admin: " + (error.response?.data?.error || error.message));
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Create New Admin</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        label="Username" 
                        fullWidth 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        margin="normal"
                        required
                        inputProps={{ maxLength: 30 }} // Limit username length
                        helperText="Username can only contain letters and numbers, with no spaces or special characters."
                    />
                    <TextField 
                        label="Email" 
                        fullWidth 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        margin="normal"
                        required
                        inputProps={{ type: 'email', maxLength: 50 }} // Validate email input and limit length
                    />
                    <TextField 
                        label="Password" 
                        type="password" 
                        fullWidth 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        margin="normal"
                        required
                        inputProps={{ minLength: 8 }} // Enforce minimum password length for security
                    />
                    <Select
                        label="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                        <MenuItem value="OrderManager">Order Manager</MenuItem>
                        <MenuItem value="ProductManager">Product Manager</MenuItem>
                        <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
                    </Select>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit" 
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Create Admin
                    </Button>
                </form>
                {message && <Typography color="secondary" align="center" sx={{ marginTop: 2 }}>{message}</Typography>}
            </Box>
        </Container>
    );
}

export default CreateAdminForm;
