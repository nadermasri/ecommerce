// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { login as authLogin, logout as authLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // User object with role if admin
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await api.get('/user/me');
            console.log("Auth Check Response:", response.data); // Debugging
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Auth Check Error:", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginUser = async (username, password) => {
        try {
            console.log(`Attempting to log in user: ${username}`); // Debugging
            await authLogin(username, password);
            await checkAuth();
            console.log("User after login:", user); // Debugging
        } catch (error) {
            console.error("Login User Error:", error);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await authLogout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout Error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loginUser, logoutUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
