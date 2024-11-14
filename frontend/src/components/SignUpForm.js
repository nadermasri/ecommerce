//components/SignUpForm.js
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
        wishlist: [],        // Default empty array
        preferences: {}      // Default empty object
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const SERVER_URL = "http://127.0.0.1:5000";

    // Input validation functions
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 8;
    const validatePhoneNumber = (phone) => /^[\d\s-]{7,15}$/.test(phone);  // Allows digits, spaces, hyphens

    // Handle input changes with validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission with input validation and error handling
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Client-side validation
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!validatePassword(formData.password)) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
            setError('Please enter a valid phone number.');
            return;
        }

        try {
            const response = await axios.post(`${SERVER_URL}/user/register`, formData);
            setSuccessMessage('Registration successful!');
            setFormData({
                username: '',
                email: '',
                password: '',
                membership_tier: 'Normal',
                address: '',
                phone_number: '',
                wishlist: [],
                preferences: {}
            });
        } catch (error) {
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);
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
