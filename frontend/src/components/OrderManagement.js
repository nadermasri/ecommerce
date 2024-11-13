// src/components/OrderManagement.js

import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    Typography,
    IconButton,
    Stack
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';

function OrderManagement() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const data = await getOrders();
        setOrders(data);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'canceled':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Manage Orders
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography variant="subtitle1" fontWeight="bold">ID</Typography></TableCell>
                            <TableCell><Typography variant="subtitle1" fontWeight="bold">User ID</Typography></TableCell>
                            <TableCell><Typography variant="subtitle1" fontWeight="bold">Total Price</Typography></TableCell>
                            <TableCell><Typography variant="subtitle1" fontWeight="bold">Status</Typography></TableCell>
                            <TableCell><Typography variant="subtitle1" fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.user_id}</TableCell>
                                <TableCell>${order.total_price.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Typography color={getStatusColor(order.status)} fontWeight="bold">
                                        {order.status}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton color="primary" aria-label="view order">
                                            <Visibility />
                                        </IconButton>
                                        <IconButton color="secondary" aria-label="delete order">
                                            <Delete />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default OrderManagement;
