//services/userService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Helper function for secure token retrieval
const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error("Authorization token is missing.");
    }
    return token;
};

// Fetch users with error handling and secure headers
export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/user/`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-cache',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error.response?.data || new Error("Failed to fetch users.");
    }
};

// Delete user with input validation and error handling
export const deleteUser = async (userId) => {
    if (typeof userId !== 'string') throw new Error("Invalid userId.");
    try {
        const response = await axios.delete(`${apiUrl}/user/${encodeURIComponent(userId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error.response?.data || new Error("Failed to delete user.");
    }
};

// Update user profile with input validation and error handling
export const updateUserProfile = async (userId, updatedData) => {
    if (typeof userId !== 'string' || typeof updatedData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await axios.put(`${apiUrl}/user/users/${encodeURIComponent(userId)}/profile`, updatedData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error.response?.data || new Error("Failed to update profile.");
    }
};

// Fetch user profile with secure handling
export const fetchUserProfile = async (userId) => {
    if (typeof userId !== 'string') throw new Error("Invalid userId.");
    try {
        const response = await axios.get(`${apiUrl}/user/users/${encodeURIComponent(userId)}/profile`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error.response?.data || new Error("Failed to fetch user profile.");
    }
};

// Fetch activity logs with secure handling
export const fetchActivityLogs = async () => {
    try {
        const response = await axios.get(`${apiUrl}/user/admin/activity_logs`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch activity logs:", error);
        throw error.response?.data || new Error("Failed to fetch activity logs.");
    }
};

// Create a new admin user with input validation and error handling
export const createAdmin = async (username, email, password, role) => {
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof role !== 'string') {
        throw new Error("Invalid input data.");
    }
    try {
        const response = await axios.post(`${apiUrl}/user/admins/create`, 
            { username, email, password, role },
            {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating admin user:", error);
        throw error.response?.data || new Error("Failed to create admin user.");
    }
};

// Fetch all admin users with secure handling
export const fetchAdminUsers = async () => {
    try {
        const response = await axios.get(`${apiUrl}/user/admins`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin users:', error);
        throw error.response?.data || new Error("Failed to fetch admin users.");
    }
};

// Update admin user with input validation and error handling
export const updateAdminUser = async (userId, updatedData) => {
    if (typeof userId !== 'string' || typeof updatedData !== 'object') throw new Error("Invalid input.");
    try {
        const response = await axios.put(`${apiUrl}/user/admins/${encodeURIComponent(userId)}`, updatedData, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating admin user:", error);
        throw error.response?.data || new Error("Failed to update admin user.");
    }
};

// Delete admin user with input validation and error handling
export const deleteAdminUser = async (userId) => {
    if (typeof userId !== 'string') throw new Error("Invalid userId.");
    try {
        const response = await axios.delete(`${apiUrl}/user/admins/${encodeURIComponent(userId)}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                'Cache-Control': 'no-store',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting admin user:", error);
        throw error.response?.data || new Error("Failed to delete admin user.");
    }
};
