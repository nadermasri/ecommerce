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

    const handleLogin = async () => {
        setError('');
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        try {
            const data = await login(username, password);
            localStorage.setItem('authToken', data.token);
            navigate('/dashboard');
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <Container maxWidth="xs" style={styles.container}>
            <Typography variant="h4" align="center" style={styles.header}>Admin Login</Typography>
            <div style={styles.inputContainer}>
                {/* Username input with FormControl and OutlinedInput */}
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel htmlFor="username" style={styles.inputLabel}>Username</InputLabel>
                    <OutlinedInput
                        id="username"
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}  // Add onKeyPress here
                        error={!!error}
                        startAdornment={
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        }
                        style={styles.textField}
                    />
                </FormControl>

                {/* Password input with FormControl and OutlinedInput */}
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel htmlFor="password" style={styles.inputLabel}>Password</InputLabel>
                    <OutlinedInput
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}  // Add onKeyPress here
                        endAdornment={
                            <InputAdornment position="end">
                                <Button
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    style={styles.eyeIcon}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </Button>
                            </InputAdornment>
                        }
                        label="Password"
                        error={!!error}
                        style={styles.textField}
                    />
                </FormControl>

                {error && <Typography variant="body2" color="error" style={styles.errorText}>{error}</Typography>}
                
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleLogin}
                    style={styles.loginButton}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
            </div>
            <div style={styles.forgot}>
                <a href="#" style={styles.forgotLink}>Forgot password?</a>
            </div>
        </Container>
    );
}

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
