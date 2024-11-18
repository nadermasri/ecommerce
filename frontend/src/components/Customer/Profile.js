import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Avatar
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../../services/userService';
import { motion } from 'framer-motion';

function Profile() {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const data = await fetchUserProfile(user.id);
                setProfile(data);
            } catch (err) {
                setError(err.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, [user.id]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await updateUserProfile(user.id, profile);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setUpdating(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError('');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <Avatar
                    alt={user.username}
                    src={profile?.avatar || 'https://via.placeholder.com/100'}
                    sx={{ width: 100, height: 100, marginBottom: '1rem' }}
                />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>My Profile</Typography>
            
            <Paper sx={{ padding: '2rem', borderRadius: '12px' }} elevation={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1" color="textSecondary">Username:</Typography>
                        <Typography variant="body1">{profile.username}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            type="email"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Address"
                            name="address"
                            value={profile.address}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            name="phone_number"
                            value={profile.phone_number}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            type="tel"
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdate}
                            disabled={updating}
                            startIcon={updating && <CircularProgress size={20} />}
                            sx={{
                                padding: '0.8rem 2rem',
                                backgroundColor: '#8e24aa',
                                '&:hover': {
                                    backgroundColor: '#6a1b9a',
                                }
                            }}
                        >
                            {updating ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </motion.div>
                </Box>
            </Paper>

            {/* Success Snackbar */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Profile updated successfully!
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default Profile;
