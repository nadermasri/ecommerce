// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { login as authLogin, logout as authLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await api.get('/user/me');
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

    const loginUser = async (username, password) => {
        await authLogin(username, password);
        await checkAuth();
    };

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
