// src/components/UserProfile.js

import React, { useState, useEffect } from 'react';
import { updateUserProfile, fetchUsers } from '../../services/userService';
import {
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Stack,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

function UserProfile({ userId }) {
    const [user, setUser] = useState({
        username: '',
        email: '',
        address: '',
        phone_number: '',
        membership_tier: '',
        wishlist: '[]', // Default as JSON string
        preferences: '{}', // Default as JSON string
        password: ''
    });
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetchUsers();
                const currentUser = response.find((u) => u.id === userId);
                if (currentUser) {
                    setUser({
                        ...currentUser,
                        wishlist: JSON.stringify(currentUser.wishlist || []), // Ensure default empty array
                        preferences: JSON.stringify(currentUser.preferences || {}) // Ensure default empty object
                    });
                } else {
                    setAlertMessage("User not found.");
                    setAlertSeverity("error");
                    setAlertOpen(true);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setAlertMessage("Failed to load user profile.");
                setAlertSeverity("error");
                setAlertOpen(true);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const validateJSONField = (fieldValue) => {
        try {
            JSON.parse(fieldValue);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset alerts
        setAlertMessage('');
        setAlertSeverity('info');

        // Validate JSON fields
        if (!validateJSONField(user.wishlist) || !validateJSONField(user.preferences)) {
            setAlertMessage("Invalid JSON format in Wishlist or Preferences.");
            setAlertSeverity("error");
            setAlertOpen(true);
            return;
        }

        try {
            const updatedUser = await updateUserProfile(userId, {
                ...user,
                wishlist: JSON.parse(user.wishlist), // Parse JSON string
                preferences: JSON.parse(user.preferences) // Parse JSON string
            });

            setUser({
                ...updatedUser,
                wishlist: JSON.stringify(updatedUser.wishlist || []),
                preferences: JSON.stringify(updatedUser.preferences || {})
            });

            setAlertMessage("Profile updated successfully!");
            setAlertSeverity("success");
            setAlertOpen(true);
        } catch (error) {
            console.error("Failed to update profile:", error);
            setAlertMessage("Failed to update profile. Please try again.");
            setAlertSeverity("error");
            setAlertOpen(true);
        }
    };

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 4, boxShadow: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
                Edit Profile
            </Typography>

            {/* Snackbar alert for feedback */}
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

            <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        required
                        inputProps={{ maxLength: 30 }}
                        helperText="Username can only contain letters and numbers, with no spaces or special characters."
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        type="email"
                        fullWidth
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                        inputProps={{ maxLength: 50 }}
                    />
                    <TextField
                        label="Address"
                        variant="outlined"
                        fullWidth
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Phone Number"
                        variant="outlined"
                        fullWidth
                        name="phone_number"
                        value={user.phone_number}
                        onChange={handleChange}
                        helperText="Format: digits, spaces, or hyphens (7-15 characters)."
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Membership Tier</InputLabel>
                        <Select
                            name="membership_tier"
                            value={user.membership_tier}
                            onChange={handleChange}
                            label="Membership Tier"
                        >
                            <MenuItem value="Normal">Normal</MenuItem>
                            <MenuItem value="Premium">Premium</MenuItem>
                            <MenuItem value="VIP">VIP</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Wishlist (JSON)"
                        variant="outlined"
                        fullWidth
                        name="wishlist"
                        value={user.wishlist}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        error={!validateJSONField(user.wishlist)}
                        helperText={!validateJSONField(user.wishlist) ? "Invalid JSON format" : "Enter wishlist items as a JSON array, e.g., [\"Item1\", \"Item2\"]"}
                    />
                    <TextField
                        label="Preferences (JSON)"
                        variant="outlined"
                        fullWidth
                        name="preferences"
                        value={user.preferences}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        error={!validateJSONField(user.preferences)}
                        helperText={!validateJSONField(user.preferences) ? "Invalid JSON format" : "Enter preferences as a JSON object, e.g., {\"theme\":\"dark\"}"}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        name="password"
                        value={user.password || ''}
                        onChange={handleChange}
                        autoComplete="new-password"
                        helperText="Leave blank to keep existing password."
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Save Changes
                    </Button>
                </Stack>
            </form>
        </Box>
    );
    }

    export default UserProfile;
