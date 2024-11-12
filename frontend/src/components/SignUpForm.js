import React, { useState } from 'react';
import axios from 'axios';

function SignUpForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        membership_tier: 'Normal',
        address: '',
        phone_number: '',
        wishlist: [],       // Assuming this can be an empty array by default
        preferences: {}      // Assuming this can be an empty object by default
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const SERVER_URL = "http://127.0.0.1:5000";
    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');  // Clear any previous error
        setSuccessMessage('');  // Clear any previous success message

        try {
            const response = await axios.post(`${SERVER_URL}/user/register`, formData);
            setSuccessMessage('Registration successful!');
        } catch (error) {
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);  // Display backend error message
            } else {
                setError('An error occurred while signing up. Please try again.');
            }
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Password:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Membership Tier:
                    <input
                        type="text"
                        name="membership_tier"
                        value={formData.membership_tier}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Address:
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <label>
                    Phone Number:
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </label>
                <br />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default SignUpForm;
