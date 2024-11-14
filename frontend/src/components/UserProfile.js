// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { updateUserProfile, fetchUsers } from '../services/userService';
import { TextField, Button, Typography, Box, Alert, Stack } from '@mui/material';

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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetchUsers();
                const currentUser = response.find((u) => u.id === userId);
                if (currentUser) {
                    setUser({
                        ...currentUser,
                        wishlist: JSON.stringify(currentUser.wishlist), // Store as JSON string
                        preferences: JSON.stringify(currentUser.preferences) // Store as JSON string
                    });
                }
            } catch (error) {
                setError("Failed to load user profile.");
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

        // Validate JSON fields
        if (!validateJSONField(user.wishlist) || !validateJSONField(user.preferences)) {
            setError("Invalid JSON format in Wishlist or Preferences.");
            setSuccess(null);
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
                wishlist: JSON.stringify(updatedUser.wishlist), // Store as JSON string
                preferences: JSON.stringify(updatedUser.preferences) // Store as JSON string
            });

            setSuccess("Profile updated successfully!");
            setError(null);
        } catch (error) {
            setError("Failed to update profile. Please try again.");
            setSuccess(null);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 4, boxShadow: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h4" gutterBottom>
                Edit Profile
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
                    />
                    <TextField
                        label="Address"
                        variant="outlined"
                        fullWidth
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Phone Number"
                        variant="outlined"
                        fullWidth
                        name="phone_number"
                        value={user.phone_number}
                        onChange={handleChange}
                    />
                    <TextField
                        label="Membership Tier"
                        variant="outlined"
                        fullWidth
                        name="membership_tier"
                        value={user.membership_tier}
                        onChange={handleChange}
                    />
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
                        helperText={!validateJSONField(user.wishlist) ? "Invalid JSON format" : ""}
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
                        helperText={!validateJSONField(user.preferences) ? "Invalid JSON format" : ""}
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
