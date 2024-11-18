// src/components/SignUpForm.js

import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack
} from '@mui/material';

function SignUpForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        membership_tier: 'Normal',
        address: '',
        phone_number: '',
        wishlist: [],        // Default empty array
        preferences: {}      // Default empty object
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const SERVER_URL = "http://127.0.0.1:5000";

    // Input validation functions
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 8;
    const validatePhoneNumber = (phone) => /^[\d\s-]{7,15}$/.test(phone);  // Allows digits, spaces, hyphens

    // Handle input changes with validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission with input validation and error handling
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset alerts
        setAlertMessage('');
        setAlertSeverity('info');

        // Client-side validation
        if (!validateEmail(formData.email)) {
            setAlertMessage('Please enter a valid email address.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }
        if (!validatePassword(formData.password)) {
            setAlertMessage('Password must be at least 8 characters long.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }
        if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
            setAlertMessage('Please enter a valid phone number.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }

        try {
            const response = await axios.post(`${SERVER_URL}/user/register`, formData);
            setAlertMessage('Registration successful!');
            setAlertSeverity('success');
            setAlertOpen(true);
            // Reset form fields
            setFormData({
                username: '',
                email: '',
                password: '',
                membership_tier: 'Normal',
                address: '',
                phone_number: '',
                wishlist: [],
                preferences: {}
            });
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'An error occurred while signing up. Please try again.';
            setAlertMessage(`Failed to register: ${errorMsg}`);
            setAlertSeverity('error');
            setAlertOpen(true);
            console.error("Registration Error:", error);
        }
    };

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>Sign Up</Typography>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ maxLength: 30 }}
                            helperText="Username can only contain letters and numbers, with no spaces or special characters."
                        />
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ maxLength: 50 }}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{ minLength: 8 }}
                            helperText="Password must be at least 8 characters long."
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Membership Tier</InputLabel>
                            <Select
                                name="membership_tier"
                                value={formData.membership_tier}
                                onChange={handleChange}
                                label="Membership Tier"
                            >
                                <MenuItem value="Normal">Normal</MenuItem>
                                <MenuItem value="Premium">Premium</MenuItem>
                                <MenuItem value="VIP">VIP</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Phone Number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            fullWidth
                            helperText="Format: digits, spaces, or hyphens (7-15 characters)."
                        />
                        {/* Optional: Implement Wishlist and Preferences Inputs if needed */}
                        {/* <TextField
                            label="Wishlist"
                            name="wishlist"
                            value={JSON.stringify(formData.wishlist)}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <TextField
                            label="Preferences"
                            name="preferences"
                            value={JSON.stringify(formData.preferences)}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        /> */}
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                        >
                            Register
                        </Button>
                    </Stack>
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

export default SignUpForm;
