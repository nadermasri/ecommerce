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