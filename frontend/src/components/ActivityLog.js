// Import essential modules and components from React and MUI libraries
import React, { useState, useEffect } from 'react';
import { fetchActivityLogs } from '../services/userService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Snackbar, Alert } from '@mui/material';

function ActivityLogs({ token }) {
    // State to store activity logs fetched from API
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null); // Error state for handling fetch issues
    const [alertOpen, setAlertOpen] = useState(false); // Snackbar control
    const [alertSeverity, setAlertSeverity] = useState('info'); // Severity for Snackbar
    const [alertMessage, setAlertMessage] = useState(''); // Message for Snackbar feedback

    // Fetch activity logs on component mount or when token changes
    useEffect(() => {
        const getActivityLogs = async () => {
            try {
                const data = await fetchActivityLogs(token); // Fetch logs with provided token
                setLogs(data); // Update logs state with fetched data
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error("Error fetching activity logs:", error); // Log detailed error for debugging
                setError("Failed to load activity logs."); // User-facing error message
                setAlertMessage("Failed to load activity logs."); // Snackbar message for feedback
                setAlertSeverity("error"); // Set alert to error level
                setAlertOpen(true); // Open alert to inform user
            }
        };

        getActivityLogs(); // Call fetch function
    }, [token]); // Dependency array watches for token changes

    // Close Snackbar after a delay or on user interaction
    const handleCloseAlert = () => setAlertOpen(false);

    return (
        <div>
            {/* Title for the activity logs page */}
            <Typography variant="h4" gutterBottom>Activity Logs</Typography>
            
            {/* Conditionally display error message if fetch fails */}
            {error && <Typography color="error">{error}</Typography>}
            
            {/* Table container with logs data */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell> {/* Unique identifier for each log */}
                            <TableCell>Admin ID</TableCell> {/* ID of the admin performing the action */}
                            <TableCell>Action</TableCell> {/* Description of the action performed */}
                            <TableCell>Timestamp</TableCell> {/* Date and time of the action */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Map over logs and render each log entry in a table row */}
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

            {/* Snackbar alert for error and success feedback */}
            <Snackbar open={alertOpen} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage} {/* Display message in Snackbar */}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default ActivityLogs;
