// src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * ProtectedRoute component to guard routes based on authentication and user roles.
 *
 * @param {React.ReactNode} children - The component(s) to render if access is granted.
 * @param {string} requiredRole - The role required to access the route.
 * @returns {React.ReactNode} - The children components or a redirect.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);

    if (loading) {
        // Display a loading spinner while checking authentication
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        // Redirect unauthenticated users to admin login
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // Redirect users without the required role to home
        return <Navigate to="/home" replace />;
    }

    // Render the protected component(s)
    return children;
};

export default ProtectedRoute;
