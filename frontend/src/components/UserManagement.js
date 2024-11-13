import React, { useState, useEffect } from 'react';
import {
    fetchUsers,
    fetchAdminUsers,
    deleteUser,
    updateUserProfile,
    fetchUserProfile,
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
    MenuItem
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

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await fetchUsers();
                setUsers(users);
            } catch (error) {
                console.error("Error fetching users:", error);
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
            handleFetchAdminUsers();  // Refresh the list of admins
        } catch (error) {
            console.error("Failed to create admin:", error);
            if (error.response) {
                alert(`Backend error: ${error.response.data.error || error.response.data}`);
            }
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (editingUser) {
            await updateUserProfile(editingUser.id, formData);
            const updatedUsers = await fetchUsers();
            setUsers(updatedUsers);
            setEditingUser(null);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        if (editingAdmin) {
            await updateAdminUser(editingAdmin.id, adminFormData);
            const updatedAdmins = await fetchAdminUsers();
            setAdminUsers(updatedAdmins);
            setEditingAdmin(null);
        }
    };

    const handleDeleteUser = async (id) => {
        await deleteUser(id);
        const updatedUsers = await fetchUsers();
        setUsers(updatedUsers);
    };

    const handleDeleteAdmin = async (id) => {
        await deleteAdminUser(id);
        const updatedAdmins = await fetchAdminUsers();
        setAdminUsers(updatedAdmins);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" align="center" gutterBottom>Manage Users</Typography>

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
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={adminFormData.email}
                            onChange={handleAdminInputChange}
                            fullWidth
                            margin="normal"
                        />
                        <Select
                            name="role"
                            value={adminFormData.role}
                            onChange={handleAdminInputChange}
                            fullWidth
                            margin="normal"
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
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={newAdminData.email}
                        onChange={handleNewAdminInputChange}
                        fullWidth
                        margin="normal"
                        required
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
