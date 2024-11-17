// services/adminService.js
import api from './api';

// Create a new admin user with input validation and error handling
export const createAdmin = async (username, email, password, role) => {
    // Input validation
    if (
        typeof username !== 'string' || 
        typeof email !== 'string' || 
        typeof password !== 'string' || 
        typeof role !== 'string'
    ) {
        throw new Error("Invalid input data.");
    }
    
    try {
        const response = await api.post(
            `/user/admins/create`,
            { username, email, password, role }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating admin user:", error);
        throw error.response?.data || new Error("Failed to create admin user.");
    }
};
