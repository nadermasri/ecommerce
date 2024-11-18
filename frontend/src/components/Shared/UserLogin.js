// src/components/Shared/UserLogin.js
import React, { useState, useContext } from 'react';
import {
    Button,
    Box,
    TextField,
    Typography,
    CircularProgress,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

function UserLogin({ closeDialog }) {
    const { loginUser } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');

    const handleLogin = async () => {
        setError('');
        if (!username || !password) {
            setError('Please enter both username and password.');
            setAlertMessage('Please enter both username and password.');
            setAlertSeverity('error');
            setAlertOpen(true);
            return;
        }

        setLoading(true);
        try {
            await loginUser(username, password);
            setAlertMessage('Login successful!');
            setAlertSeverity('success');
            setAlertOpen(true);
            setTimeout(() => {
                closeDialog();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            setAlertMessage(err.message || 'Login failed. Please try again.');
            setAlertSeverity('error');
            setAlertOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') return;
        setAlertOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', mt: 2 }}>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                disabled={loading}
                sx={{ mt: 1 }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>

            {/* Snackbar for feedback */}
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
        </Box>
    );
}

export default UserLogin;
