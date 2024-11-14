import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, CircularProgress, InputAdornment, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { AccountCircle, Visibility, VisibilityOff } from '@mui/icons-material';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Handler for logging in
    const handleLogin = async () => {
        setError(''); // Reset error message before each attempt

        // Simple input validation to ensure both fields are filled
        if (!username || !password) {
            setError('Please enter both username and password'); // Prevents empty submissions
            return;
        }

        setLoading(true); // Show loading spinner to prevent multiple submissions

        try {
            // Attempt login with provided credentials
            const data = await login(username, password);

            // Store token securely in local storage
            // Storing the auth token allows secured API requests in future sessions
            localStorage.setItem('authToken', data.token);

            // Redirect to protected dashboard after successful login
            navigate('/dashboard');
        } catch (error) {
            // Display a generic error to avoid revealing sensitive information
            setError('Login failed. Please try again.'); // Avoids exposure of login failure details
        } finally {
            setLoading(false); // Hide loading spinner after response
        }
    };

    // Toggle visibility for password input
    const handleClickShowPassword = () => setShowPassword(!showPassword);

    // Prevent default action on password input mouse down
    const handleMouseDownPassword = (event) => event.preventDefault();

    // Allow login with the "Enter" key
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin(); // Supports accessibility for keyboard users
        }
    };

    return (
        <Container maxWidth="xs" style={styles.container}>
            <Typography variant="h4" align="center" style={styles.header}>Admin Login</Typography>
            <div style={styles.inputContainer}>

                {/* Username input with validation to ensure required fields are filled */}
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel htmlFor="username" style={styles.inputLabel}>Username</InputLabel>
                    <OutlinedInput
                        id="username"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}  // Allow login with Enter key
                        error={!!error} // Shows error highlight if there's a login issue
                        startAdornment={
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        }
                        style={styles.textField}
                    />
                </FormControl>

                {/* Password input with secure features */}
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel htmlFor="password" style={styles.inputLabel}>Password</InputLabel>
                    <OutlinedInput
                        id="password"
                        type={showPassword ? 'text' : 'password'} // Toggles between hidden and visible password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        endAdornment={
                            <InputAdornment position="end">
                                <Button
                                    aria-label="toggle password visibility" // Accessibility label
                                    onClick={handleClickShowPassword} // Securely toggle password visibility
                                    onMouseDown={handleMouseDownPassword} // Prevent focus shift on button click
                                    edge="end"
                                    style={styles.eyeIcon}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </Button>
                            </InputAdornment>
                        }
                        label="Password"
                        error={!!error} // Error highlight for login issues
                        style={styles.textField}
                    />
                </FormControl>

                {/* Display error message for login issues */}
                {error && <Typography variant="body2" color="error" style={styles.errorText}>{error}</Typography>}
                
                {/* Login button with loading indicator */}
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    style={styles.loginButton}
                    disabled={loading} // Disables button while loading to prevent multiple submissions
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
            </div>

            {/* Placeholder for "Forgot password?" functionality */}
            <div style={styles.forgot}>
                <a href="#" style={styles.forgotLink}>Forgot password?</a>
            </div>
        </Container>
    );
}

// Styling for the component elements
const styles = {
    container: {
        background: 'linear-gradient(135deg, #2f4b7c, #596e88)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        marginTop: '8rem',
        minHeight: '500px',
        animation: 'fadeIn 0.7s ease-out',
    },
    header: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: '2rem',
        fontSize: '2.5rem',
        fontFamily: "'Roboto', sans-serif",
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
    },
    textField: {
        backgroundColor: '#fff',  // White background for inputs
        borderRadius: '15px',
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#fff',
        },
        '& .MuiInputBase-root': {
            color: '#333',
        },
    },
    inputLabel: {
        color: '#333',
    },
    inputField: {
        color: '#333',
    },
    loginButton: {
        marginTop: '1.5rem',
        padding: '1rem',
        fontWeight: 'bold',
        backgroundColor: '#00bcd4',
        '&:hover': {
            backgroundColor: '#0097a7',
        },
        boxShadow: '0px 6px 12px rgba(0, 188, 212, 0.2)',
        transition: 'all 0.3s ease',
    },
    forgot: {
        marginTop: '1.5rem',
    },
    forgotLink: {
        color: '#00bcd4',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'color 0.2s ease',
        '&:hover': {
            color: '#0097a7',
        },
    },
    errorText: {
        marginTop: '0.5rem',
        color: '#f44336',
        fontSize: '0.9rem',
    },
    eyeIcon: {
        color: '#00bcd4',
    },
};

export default LoginForm;
