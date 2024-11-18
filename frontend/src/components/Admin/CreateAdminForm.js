// src/components/CreateAdminForm.js

import React, { useState } from 'react';
import { createAdmin } from '../../services/adminService';
import {
    TextField,
    Button,
    Container,
    Typography,
    Select,
    MenuItem,
    Box,
    Snackbar,
    Alert,
    FormControl,
    InputLabel
} from '@mui/material';

function CreateAdminForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');

    // Regular expression to enforce username format: only alphanumeric, no spaces or special characters
    const usernameRegex = /^[a-zA-Z0-9]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset alerts
        setAlertMessage('');
        setAlertSeverity('info');

        // Check if all fields are filled
        if (!username || !email || !password || !role) {
            setAlertMessage("All fields are required.");
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
        }

        // Validate username
        if (!usernameRegex.test(username)) {
            setAlertMessage("Username can only contain letters and numbers, with no spaces or special characters.");
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
        }

        // Basic sanitization to prevent XSS attacks (use a library like DOMPurify in production)
        const sanitizedUsername = username.replace(/[<>]/g, "");
        const sanitizedEmail = email.replace(/[<>]/g, "");
        const sanitizedRole = role.replace(/[<>]/g, "");

        try {
            const data = await createAdmin(sanitizedUsername, sanitizedEmail, password, sanitizedRole);
            setAlertMessage(data.message || "Admin created successfully!");
            setAlertSeverity("success");
            setAlertOpen(true);
            // Reset form fields
            setUsername('');
            setEmail('');
            setPassword('');
            setRole('');
        } catch (error) {
            console.error("Failed to create admin:", error);
            setAlertMessage("Failed to create admin: " + (error.response?.data?.error || error.message));
            setAlertSeverity("error");
            setAlertOpen(true);
        }
    };

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
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
                        type="email"
                        inputProps={{ maxLength: 50 }} // Validate email input and limit length
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
                        helperText="Password must be at least 8 characters long."
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            label="Role"
                        >
                            <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                            <MenuItem value="OrderManager">Order Manager</MenuItem>
                            <MenuItem value="ProductManager">Product Manager</MenuItem>
                            <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                        </Select>
                    </FormControl>
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
            </Box>

            {/* Snackbar for user feedback */}
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
        </Container>
    );
}

export default CreateAdminForm;
