import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, updateUserProfile, fetchUserProfile } from '../services/userService';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        address: '',
        membership_tier: '',
        wishlist: [],
        preferences: {},
        password: ''
    });
    const [searchUserId, setSearchUserId] = useState(''); // State for search input
    const [searchedUser, setSearchedUser] = useState(null); // State for displaying searched user
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            const users = await fetchUsers();
            setUsers(users);
        };
        getUsers();
    }, []);

    const handleDelete = async (id) => {
        await deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            address: user.address,
            membership_tier: user.membership_tier,
            wishlist: user.wishlist || [],
            preferences: user.preferences || {},
            password: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearchInputChange = (e) => {
        setSearchUserId(e.target.value);
    };

    const handleSearchUser = async () => {
        try {
            const user = await fetchUserProfile(searchUserId);
            setSearchedUser(user);
            setError(null); // Clear any previous error
        } catch (err) {
            setSearchedUser(null);
            setError("User not found or unauthorized.");
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            address: '',
            membership_tier: '',
            wishlist: [],
            preferences: {},
            password: ''
        });
        setEditingUser(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (editingUser) {
            await updateUserProfile(editingUser.id, formData);
            setUsers(users.map(user => (user.id === editingUser.id ? { ...user, ...formData } : user)));
            resetForm();
        }
    };

    const handleCancel = () => {
        resetForm();
    };

    return (
        <div>
            <h2>Manage Users</h2>

            {/* Search bar for finding specific users */}
            <div>
                <input
                    type="text"
                    placeholder="Enter User ID to Search"
                    value={searchUserId}
                    onChange={handleSearchInputChange}
                />
                <button onClick={handleSearchUser}>Search</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Display searched user if found */}
            {searchedUser && (
                <div>
                    <h3>Search Result</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Membership Tier</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{searchedUser.id}</td>
                                <td>{searchedUser.username}</td>
                                <td>{searchedUser.email}</td>
                                <td>{searchedUser.membership_tier}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Membership Tier</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.membership_tier}</td>
                            <td>
                                <button onClick={() => handleEdit(user)}>Update</button>
                                <button onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Update User Form */}
            {editingUser && (
                <div>
                    <h3>Update User</h3>
                    <form onSubmit={handleUpdate}>
                        <div>
                            <label>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Address:</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label>Membership Tier:</label>
                            <input
                                type="text"
                                name="membership_tier"
                                value={formData.membership_tier}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={handleCancel}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
