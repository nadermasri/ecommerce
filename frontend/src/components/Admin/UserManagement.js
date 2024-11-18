// components/UserManagement.js

import React, { useState, useEffect } from 'react';
import {
    fetchUsers,
    fetchAdminUsers,
    deleteUser,
    updateUserProfile,
    updateAdminUser,
    deleteAdminUser,
    createAdmin
} from '../../services/userService';
import {
    TextField,
    Button,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box,
    Select,
    MenuItem,
    Alert,
    IconButton,
    FormControl,
    InputLabel
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

function UserManagement() {
    // State variables for users and admin users
    const [users, setUsers] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    
    // State variables for editing users and admins
    const [editingUser, setEditingUser] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const membershipTiers = ['Normal', 'Premium', 'Gold'];

    // State variables for form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        address: '',
        membership_tier: '',
        wishlist: [],
        preferences: {},
        password: ''
    });
    const [adminFormData, setAdminFormData] = useState({
        username: '',
        email: '',
        role: 'InventoryManager',
        password: ''
    });
    const [newAdminData, setNewAdminData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'InventoryManager'
    });
    
    // State variables for feedback messages
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch regular users on component mount
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await fetchUsers();
                setUsers(users);
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users.");
            }
        };
        fetchAllUsers();
    }, []);

    // Handler to fetch admin users
    const handleFetchAdminUsers = async () => {
        try {
            const admins = await fetchAdminUsers();
            setAdminUsers(admins);
        } catch (error) {
            console.error("Error fetching admin users:", error);
            setError("Failed to fetch admin users.");
        }
    };

    // Handler to initiate editing a regular user
    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditingAdmin(null); // Close admin form if open
        setFormData({
            username: user.username,
            email: user.email,
            address: user.address,
            membership_tier: user.membership_tier,
            wishlist: user.wishlist || [],
            preferences: user.preferences || {},
            password: ''
        });
        setError(null); // Clear any existing errors
        setSuccess(null); // Clear any existing success messages
    };

    // Handler to initiate editing an admin user
    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setEditingUser(null); // Close regular user form if open
        setAdminFormData({
            username: admin.username,
            email: admin.email,
            role: admin.role,
            password: ''
        });
        setError(null); // Clear any existing errors
        setSuccess(null); // Clear any existing success messages
    };

    // Handler for regular user form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handler for admin user form input changes
    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setAdminFormData({ ...adminFormData, [name]: value });
    };

    // Handler for new admin form input changes
    const handleNewAdminInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData({ ...newAdminData, [name]: value });
    };

    // Username validation: only alphanumeric characters and underscores
    const validateUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);

    // Email validation: basic regex
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    // Password validation: minimum 8 characters
    const validatePassword = (password) => password.length >= 8;

    // Handler to create a new admin
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        // Validate input fields
        if (!validateUsername(newAdminData.username)) {
            setError("Username can only contain letters, numbers, and underscores.");
            return;
        }
        if (!validateEmail(newAdminData.email)) {
            setError("Invalid email format.");
            return;
        }
        if (!validatePassword(newAdminData.password)) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            await createAdmin(newAdminData.username, newAdminData.email, newAdminData.password, newAdminData.role);
            setSuccess("Admin created successfully!");
            setNewAdminData({ username: '', email: '', password: '', role: 'InventoryManager' });
            handleFetchAdminUsers(); // Refresh admin users list
        } catch (error) {
            console.error("Failed to create admin:", error);
            setError(error.response?.data?.error || "Failed to create admin.");
        }
    };

    // Handler to update a regular user
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (editingUser) {
            // Validate username format
            if (!validateUsername(formData.username)) {
                setError("Username can only contain letters, numbers, and underscores.");
                return;
            }
            // Optional: Validate email and password if necessary
            if (formData.email && !validateEmail(formData.email)) {
                setError("Invalid email format.");
                return;
            }
            if (formData.password && !validatePassword(formData.password)) {
                setError("Password must be at least 8 characters.");
                return;
            }

            // Ensure membership tier is valid
            if (formData.membership_tier && !membershipTiers.includes(formData.membership_tier)) {
                setError("Invalid membership tier.");
                return;
            }

            try {
                await updateUserProfile(editingUser.id, formData);
                setSuccess("User updated successfully!");
                const updatedUsers = await fetchUsers();
                setUsers(updatedUsers);
                setEditingUser(null);
            } catch (error) {
                console.error("Failed to update user:", error);
                const errorMsg = error.response?.data?.error || "Failed to update user.";
                setError(errorMsg);
            }
        }
    };

    // Handler to update an admin user
    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (editingAdmin) {
            // Validate username format
            if (!validateUsername(adminFormData.username)) {
                setError("Username can only contain letters, numbers, and underscores.");
                return;
            }
            // Optional: Validate email and password if necessary
            if (adminFormData.email && !validateEmail(adminFormData.email)) {
                setError("Invalid email format.");
                return;
            }
            if (adminFormData.password && !validatePassword(adminFormData.password)) {
                setError("Password must be at least 8 characters.");
                return;
            }

            try {
                await updateAdminUser(editingAdmin.id, adminFormData);
                setSuccess("Admin updated successfully!");
                const updatedAdmins = await fetchAdminUsers();
                setAdminUsers(updatedAdmins);
                setEditingAdmin(null);
            } catch (error) {
                console.error("Failed to update admin:", error);
                setError(error.response?.data?.error || "Failed to update admin.");
            }
        }
    };

    // Handler to delete a regular user
    const handleDeleteUser = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await deleteUser(id);
            setSuccess("User deleted successfully.");
            const updatedUsers = await fetchUsers();
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Failed to delete user:", error);
            setError(error.response?.data?.error || "Failed to delete user.");
        }
    };

    // Handler to delete an admin user
    const handleDeleteAdmin = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await deleteAdminUser(id);
            setSuccess("Admin deleted successfully.");
            const updatedAdmins = await fetchAdminUsers();
            setAdminUsers(updatedAdmins);
        } catch (error) {
            console.error("Failed to delete admin:", error);
            setError(error.response?.data?.error || "Failed to delete admin.");
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Manage Users</Typography>

            {/* Display error and success alerts */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Regular Users Table */}
            <Typography variant="h6" gutterBottom>Regular Users</Typography>
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
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={() => handleEditUser(user)} 
                                    sx={{ marginRight: 1 }}
                                >
                                    Update
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    onClick={() => handleDeleteUser(user.id)}
                                >
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
                    <form onSubmit={handleUpdateUser}>
                        <TextField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            error={formData.username && !validateUsername(formData.username)}
                            helperText={formData.username && !validateUsername(formData.username) ? "Only letters, numbers, and underscores are allowed." : ""}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            error={formData.email && !validateEmail(formData.email)}
                            helperText={formData.email && !validateEmail(formData.email) ? "Invalid email format." : ""}
                        />
                        <TextField
                            label="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Membership Tier</InputLabel>
                            <Select
                                name="membership_tier"
                                value={formData.membership_tier}
                                onChange={handleInputChange}
                                label="Membership Tier"
                            >
                                {membershipTiers.map(tier => (
                                    <MenuItem key={tier} value={tier}>{tier}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                                Save Changes
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => setEditingUser(null)} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Admin Users Section */}
            <Box marginTop={6}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" gutterBottom>Admin Users</Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleFetchAdminUsers}
                    >
                        Refresh Admin Users
                    </Button>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {adminUsers.map(admin => (
                            <TableRow key={admin.id}>
                                <TableCell>{admin.id}</TableCell>
                                <TableCell>{admin.username}</TableCell>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>{admin.role}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        onClick={() => handleEditAdmin(admin)} 
                                        sx={{ marginRight: 1 }}
                                    >
                                        Update
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        onClick={() => handleDeleteAdmin(admin.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Update Admin Form */}
            {editingAdmin && (
                <Box marginTop={4}>
                    <Typography variant="h6" gutterBottom>Update Admin</Typography>
                    <form onSubmit={handleUpdateAdmin}>
                        <TextField
                            label="Username"
                            name="username"
                            value={adminFormData.username}
                            onChange={handleAdminInputChange}
                            fullWidth
                            margin="normal"
                            required
                            error={adminFormData.username && !validateUsername(adminFormData.username)}
                            helperText={adminFormData.username && !validateUsername(adminFormData.username) ? "Only letters, numbers, and underscores are allowed." : ""}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={adminFormData.email}
                            onChange={handleAdminInputChange}
                            fullWidth
                            margin="normal"
                            required
                            error={adminFormData.email && !validateEmail(adminFormData.email)}
                            helperText={adminFormData.email && !validateEmail(adminFormData.email) ? "Invalid email format." : ""}
                        />
                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={adminFormData.role}
                                onChange={handleAdminInputChange}
                                label="Role"
                            >
                                <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                                <MenuItem value="OrderManager">Order Manager</MenuItem>
                                <MenuItem value="ProductManager">Product Manager</MenuItem>
                                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Password"
                            name="password"
                            value={adminFormData.password}
                            onChange={handleAdminInputChange}
                            type="password"
                            fullWidth
                            margin="normal"
                            required
                            error={adminFormData.password && !validatePassword(adminFormData.password)}
                            helperText={adminFormData.password && !validatePassword(adminFormData.password) ? "Password must be at least 8 characters." : ""}
                        />
                        <Box display="flex" gap={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit" fullWidth>
                                Save Changes
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={() => setEditingAdmin(null)} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Create New Admin Form */}
            <Box marginTop={6}>
                <Typography variant="h6" gutterBottom>Create New Admin</Typography>
                <form onSubmit={handleCreateAdmin}>
                    <TextField
                        label="Username"
                        name="username"
                        value={newAdminData.username}
                        onChange={handleNewAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                        error={newAdminData.username && !validateUsername(newAdminData.username)}
                        helperText={newAdminData.username && !validateUsername(newAdminData.username) ? "Only letters, numbers, and underscores are allowed." : ""}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newAdminData.email}
                        onChange={handleNewAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                        error={newAdminData.email && !validateEmail(newAdminData.email)}
                        helperText={newAdminData.email && !validateEmail(newAdminData.email) ? "Invalid email format." : ""}
                    />
                    <TextField
                        label="Password"
                        name="password"
                        value={newAdminData.password}
                        onChange={handleNewAdminInputChange}
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        error={newAdminData.password && !validatePassword(newAdminData.password)}
                        helperText={newAdminData.password && !validatePassword(newAdminData.password) ? "Password must be at least 8 characters." : ""}
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={newAdminData.role}
                            onChange={handleNewAdminInputChange}
                            label="Role"
                        >
                            <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                            <MenuItem value="OrderManager">Order Manager</MenuItem>
                            <MenuItem value="ProductManager">Product Manager</MenuItem>
                            <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit" 
                        fullWidth 
                        sx={{ marginTop: 2 }}
                    >
                        Create Admin
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default UserManagement;
