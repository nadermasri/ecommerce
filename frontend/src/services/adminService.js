// frontend/src/services/adminService.js
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export const createAdmin = async (username, email, password, role) => {
    const token = localStorage.getItem('authToken');  // Retrieve JWT token from local storage

    const response = await axios.post(`${apiUrl}/user/admins/create`, 
        { username, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }  // Pass JWT token in the Authorization header
    );
    return response.data;
};
