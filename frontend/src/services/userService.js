// src/services/userService.js

import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const fetchUsers = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${apiUrl}/user/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// New function to delete a user
export const deleteUser = async (userId) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.delete(`${apiUrl}/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }

    
};

export const updateUserProfile = async (userId, updatedData) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.put(`${apiUrl}/user/users/${userId}/profile`, updatedData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const fetchUserProfile = async (userId) => {
    const response = await axios.get(`${apiUrl}/user/users/${userId}/profile`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
    });
    return response.data;
};

export const fetchActivityLogs = async (token) => {
    try {
        const response = await axios.get(`${apiUrl}/user/admin/activity_logs`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        throw error;
    }
};

export const createAdmin = async (username, email, password, role) => {
    const token = localStorage.getItem('authToken');  // Retrieve JWT token from local storage

    const response = await axios.post(`${apiUrl}/user/admins/create`, 
        { username, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }  // Pass JWT token in the Authorization header
    );
    return response.data;
};

export const fetchAdminUsers = async () => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.get(`${apiUrl}/user/admins`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin users:', error);
        throw error;
    }
};

// Update admin user function
export const updateAdminUser = async (userId, updatedData) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.put(`${apiUrl}/user/admins/${userId}`, updatedData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating admin user:", error);
        throw error;
    }
};

// Delete admin user function
export const deleteAdminUser = async (userId) => {
    const token = localStorage.getItem('authToken');
    try {
        const response = await axios.delete(`${apiUrl}/user/admins/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting admin user:", error);
        throw error;
    }
};