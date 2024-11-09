//authentic_lebanese_sentiment_shop/frontend/src/components/LoginForm.js

import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const data = await login(username, password);
            localStorage.setItem('authToken', data.token);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <Container>
            <Typography variant="h4" align="center">Admin Login</Typography>
            <TextField label="Username" fullWidth onChange={(e) => setUsername(e.target.value)} />
            <TextField label="Password" type="password" fullWidth onChange={(e) => setPassword(e.target.value)} />
            <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
        </Container>
    );
}

export default LoginForm;
