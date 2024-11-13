import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, updateUserProfile, fetchUserProfile } from '../services/userService';
import { createAdmin } from '../services/adminService';
import { TextField, Button, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box, Select, MenuItem } from '@mui/material';

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
    const [searchUserId, setSearchUserId] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [error, setError] = useState(null);

    const [newAdminData, setNewAdminData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'InventoryManager'
    });

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
            setError(null);
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

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData({ ...newAdminData, [name]: value });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            await createAdmin(newAdminData.username, newAdminData.email, newAdminData.password, newAdminData.role);
            alert("Admin created successfully!");
            setNewAdminData({
                username: '',
                email: '',
                password: '',
                role: 'InventoryManager'
            });
        } catch (error) {
            console.error("Failed to create admin:", error);
            if (error.response) {
                alert(`Backend error: ${error.response.data.error || error.response.data}`);
            }
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Manage Users</Typography>

            {/* Search bar for finding specific users */}
            <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
                <TextField
                    label="Enter User ID to Search"
                    variant="outlined"
                    value={searchUserId}
                    onChange={handleSearchInputChange}
                    fullWidth
                />
                <Button variant="contained" onClick={handleSearchUser} color="primary">Search</Button>
            </Box>

            {error && <Typography color="error" align="center">{error}</Typography>}

            {/* Display searched user if found */}
            {searchedUser && (
                <Box marginBottom={2}>
                    <Typography variant="h6">Search Result</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Membership Tier</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{searchedUser.id}</TableCell>
                                <TableCell>{searchedUser.username}</TableCell>
                                <TableCell>{searchedUser.email}</TableCell>
                                <TableCell>{searchedUser.membership_tier}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Box>
            )}

            {/* Users Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Membership Tier</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.membership_tier}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary" onClick={() => handleEdit(user)} sx={{ marginRight: 1 }}>
                                    Update
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDelete(user.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Update User Form */}
            {editingUser && (
                <Box marginTop={4}>
                    <Typography variant="h6" gutterBottom>Update User</Typography>
                    <form onSubmit={handleUpdate}>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Membership Tier"
                            name="membership_tier"
                            value={formData.membership_tier}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                                Save Changes
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleCancel} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Create New Admin Form */}
            <Box marginTop={4}>
                <Typography variant="h6" gutterBottom>Create New Admin</Typography>
                <form onSubmit={handleCreateAdmin}>
                    <TextField
                        label="Username"
                        name="username"
                        value={newAdminData.username}
                        onChange={handleAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newAdminData.email}
                        onChange={handleAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        value={newAdminData.password}
                        onChange={handleAdminInputChange}
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Select
                        name="role"
                        value={newAdminData.role}
                        onChange={handleAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                        <MenuItem value="OrderManager">Order Manager</MenuItem>
                        <MenuItem value="ProductManager">Product Manager</MenuItem>
                        <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                    </Select>
                    <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: 2 }}>
                        Create Admin
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default UserManagement;
