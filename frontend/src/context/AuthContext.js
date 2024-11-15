// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api'; // Ensure this path is correct
import { login as authLogin, logout as authLogout } from '../services/authService';

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check authentication status
    const checkAuth = async () => {
        try {
            const response = await api.get('/user/me'); // Ensure this endpoint exists in backend
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    // Function to handle user login
    const loginUser = async (username, password) => {
        await authLogin(username, password);
        await checkAuth();
    };

    // Function to handle user logout
    const logoutUser = async () => {
        await authLogout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
