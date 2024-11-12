//authentic_lebanese_sentiment_shop/frontend/src/components/AdminDashboard.js
import React from 'react';
import { Container, Tab, Tabs, Typography } from '@mui/material';
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import InventoryManagement from './InventoryManagement';
import ActivityLog from './ActivityLog';
function AdminDashboard() {
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>Admin Dashboard</Typography>
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                <Tab label="Users" />
                <Tab label="Orders" />
                <Tab label="Products" />
                <Tab label="Inventory" />
                <Tab label="Activity Logs" />
            </Tabs>
            {tabIndex === 0 && <UserManagement />}
            {tabIndex === 1 && <OrderManagement />}
            {tabIndex === 2 && <ProductManagement />}
            {tabIndex === 3 && <InventoryManagement />} 
            {tabIndex === 4 && <ActivityLog />} 
            {/* here no longer reviews add inventory */}
        </Container>
    );
}

export default AdminDashboard;
