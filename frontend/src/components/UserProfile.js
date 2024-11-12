// src/components/UserProfile.js

import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../services/userService';

function UserProfile({ userId }) {
    const [user, setUser] = useState({
        username: '',
        email: '',
        address: '',
        phone_number: '',
        membership_tier: '',
        wishlist: [],
        preferences: {}
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Fetch user profile data from the backend
        const fetchUserProfile = async () => {
            try {
                const response = await fetchUsers(); // Fetch current user data
                const currentUser = response.find(u => u.id === userId);
                if (currentUser) {
                    setUser({
                        ...currentUser,
                        wishlist: JSON.stringify(currentUser.wishlist), // Convert to JSON string
                        preferences: JSON.stringify(currentUser.preferences) // Convert to JSON string
                    });
                }
            } catch (error) {
                setError("Failed to load user profile.");
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedUser = await updateUserProfile(userId, {
                ...user,
                wishlist: JSON.parse(user.wishlist), // Parse back to array/object
                preferences: JSON.parse(user.preferences)
            });
            setUser({
                ...updatedUser,
                wishlist: JSON.stringify(updatedUser.wishlist),
                preferences: JSON.stringify(updatedUser.preferences)
            });
            setSuccess("Profile updated successfully!");
        } catch (error) {
            setError("Failed to update profile. Please try again.");
        }
    };

    return (
        <div>
            <h2>Edit Profile</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        name="phone_number"
                        value={user.phone_number}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Membership Tier:</label>
                    <input
                        type="text"
                        name="membership_tier"
                        value={user.membership_tier}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Wishlist (JSON):</label>
                    <textarea
                        name="wishlist"
                        value={user.wishlist}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Preferences (JSON):</label>
                    <textarea
                        name="preferences"
                        value={user.preferences}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}


export default UserProfile;
