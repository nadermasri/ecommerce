//authentic_lebanese_sentiment_shop/frontend/src/components/UserManagement.js

// src/components/UserManagement.js

import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/userService';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

function UserManagement() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    return (
        <div>
            <h2>Manage Users</h2>
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
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.membership_tier}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary">Edit</Button>
                                <Button variant="contained" color="secondary">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default UserManagement;
