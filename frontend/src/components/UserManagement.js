//components/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
    fetchUsers,
    fetchAdminUsers,
    deleteUser,
    updateUserProfile,
    updateAdminUser,
    deleteAdminUser,
    createAdmin
} from '../services/userService';
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
    Alert
} from '@mui/material';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);
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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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

    const handleFetchAdminUsers = async () => {
        try {
            const admins = await fetchAdminUsers();
            setAdminUsers(admins);
        } catch (error) {
            console.error("Error fetching admin users:", error);
            setError("Failed to fetch admin users.");
        }
    };

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
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setEditingUser(null); // Close user form if open
        setAdminFormData({
            username: admin.username,
            email: admin.email,
            role: admin.role,
            password: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;
        setAdminFormData({ ...adminFormData, [name]: value });
    };

    const handleNewAdminInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData({ ...newAdminData, [name]: value });
    };
    // Username validation to allow only alphanumeric characters and underscores, no spaces or special characters
    const validateUsername = (username) => /^[a-zA-Z0-9_]+$/.test(username);

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (password) => password.length >= 8;

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        // Validate username format
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
            handleFetchAdminUsers();
        } catch (error) {
            console.error("Failed to create admin:", error);
            setError(error.response?.data || "Failed to create admin.");
        }
    };

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
            try {
                await updateUserProfile(editingUser.id, formData);
                setSuccess("User updated successfully!");
                const updatedUsers = await fetchUsers();
                setUsers(updatedUsers);
                setEditingUser(null);
            } catch (error) {
                console.error("Failed to update user:", error);
                setError("Failed to update user.");
            }
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (editingAdmin) {
            if (!validateUsername(adminFormData.username)) {
                setError("Username can only contain letters, numbers, and underscores.");
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
                setError("Failed to update admin.");
            }
        }
    };

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
            setError("Failed to delete user.");
        }
    };

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
            setError("Failed to delete admin.");
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Manage Users</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Regular Users Table */}
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
                                <Button variant="contained" color="primary" onClick={() => handleEditUser(user)} sx={{ marginRight: 1 }}>
                                    Update
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteUser(user.id)}>
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
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
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
                            <Button variant="outlined" color="secondary" onClick={() => setEditingUser(null)} fullWidth>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            )}

            {/* Admin Users Table */}
            <Button variant="contained" color="primary" onClick={handleFetchAdminUsers} fullWidth sx={{ marginY: 2 }}>
                View Admin Users
            </Button>
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
                                <Button variant="contained" color="primary" onClick={() => handleEditAdmin(admin)} sx={{ marginRight: 1 }}>
                                    Update
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteAdmin(admin.id)}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={adminFormData.email}
                            onChange={handleAdminInputChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Select
                            name="role"
                            value={adminFormData.role}
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
                        <TextField
                            label="Password"
                            name="password"
                            value={adminFormData.password}
                            onChange={handleAdminInputChange}
                            type="password"
                            fullWidth
                            margin="normal"
                            required
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
            <Box marginTop={4}>
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
                        error={!validateUsername(newAdminData.username)}
                        helperText={!validateUsername(newAdminData.username) ? "Username can only contain letters, numbers, and underscores" : ""}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newAdminData.email}
                        onChange={handleNewAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!validateEmail(newAdminData.email)}
                        helperText={!validateEmail(newAdminData.email) ? "Invalid email format" : ""}
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
                        error={!validatePassword(newAdminData.password)}
                        helperText={!validatePassword(newAdminData.password) ? "Password must be at least 8 characters" : ""}
                    />
                    <Select
                        name="role"
                        value={newAdminData.role}
                        onChange={handleNewAdminInputChange}
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
