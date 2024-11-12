// src/components/ActivityLogs.js

import React, { useState, useEffect } from 'react';
import { fetchActivityLogs } from '../services/userService';

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
            <h2>Activity Logs</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Admin ID</th>
                        <th>Action</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.id}</td>
                            <td>{log.admin_id}</td>
                            <td>{log.action}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ActivityLogs;
