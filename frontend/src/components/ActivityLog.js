//ecommerce/frontend/src/components/ActivityLog.js
import React, { useState, useEffect } from 'react';
import { fetchActivityLogs } from '../services/userService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

function ActivityLogs({ token }) {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getActivityLogs = async () => {
            try {
                const data = await fetchActivityLogs(token);
                setLogs(data);
            } catch (error) {
                setError("Failed to load activity logs.");
            }
        };

        getActivityLogs();
    }, [token]);

    return (
        <div>
            <Typography variant="h4" gutterBottom>Activity Logs</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Admin ID</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.id}</TableCell>
                                <TableCell>{log.admin_id}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default ActivityLogs;
