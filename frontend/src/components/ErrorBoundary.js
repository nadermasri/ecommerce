// src/components/ErrorBoundary.js
import React from 'react';
import { Typography, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state to render fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Typography variant="h4" color="error">Something went wrong.</Typography>
                </Box>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
