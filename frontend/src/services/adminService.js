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
        const response = await axios.post(
            `${apiUrl}/user/admins/create`,
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
