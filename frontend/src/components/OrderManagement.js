//authentic_lebanese_sentiment_shop/frontend/src/components/OrderManagement.js
import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

function OrderManagement() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const data = await getOrders();
        setOrders(data);
    };

    return (
        <div>
            <h2>Manage Orders</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.user_id}</TableCell>
                            <TableCell>{order.total_price}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="primary">View</Button>
                                <Button variant="contained" color="secondary">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default OrderManagement;
