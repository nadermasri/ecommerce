// components/AdminDashboard.js

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, Menu, MenuItem, Avatar,
  Tooltip, Typography, Tabs, Tab
} from '@mui/material';
import {
  Logout, Home, ShoppingCart, Inventory,
  ListAlt, History, Menu as MenuIcon, AccountCircle
} from '@mui/icons-material';

// Import authentication service and context
import { logout } from '../services/authService';
import { AuthContext } from '../context/AuthContext';

// Import dashboard components
import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import InventoryManagement from './InventoryManagement';
import ActivityLog from './ActivityLog';
import DashboardHome from './DashboardHome';
import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Define tabs with roles and components
  const tabs = [
    { label: 'Home', icon: <Home />, roles: ['SuperAdmin', 'ProductManager', 'InventoryManager', 'OrderManager'], component: DashboardHome },
    { label: 'Users', icon: <AccountCircle />, roles: ['SuperAdmin'], component: UserManagement },
    { label: 'Orders', icon: <ShoppingCart />, roles: ['SuperAdmin', 'OrderManager'], component: OrderManagement },
    { label: 'Products', icon: <Inventory />, roles: ['SuperAdmin', 'ProductManager'], component: ProductManagement },
    { label: 'Inventory', icon: <ListAlt />, roles: ['SuperAdmin', 'InventoryManager'], component: InventoryManagement },
    { label: 'Logs', icon: <History />, roles: ['SuperAdmin'], component: ActivityLog },
    { label: 'Categories', icon: <ListAlt />, roles: ['SuperAdmin', 'ProductManager'], component: CategoryManagement },
    { label: 'Subcategories', icon: <ListAlt />, roles: ['SuperAdmin', 'ProductManager'], component: SubcategoryManagement },
  ];

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => tab.roles.includes(user?.role));

  // Map tab labels to their indices in visibleTabs
  const tabLabelToIndex = {};
  visibleTabs.forEach((tab, index) => {
    tabLabelToIndex[tab.label] = index;
  });

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Open menu for admin options
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close admin menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Secure logout handler
  const handleLogout = async () => {
    await logout(); // Clear auth token securely
    navigate('/'); // Redirect to login page
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{
        width: sidebarOpen ? '250px' : '78px',
        backgroundColor: '#11101D',
        color: '#fff',
        paddingTop: '20px',
        height: '100vh',
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        position: 'fixed',
        zIndex: 1000,
        boxShadow: 'none',
        borderRadius: 0,
      }}>
        {/* Sidebar toggle button */}
        <Box sx={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1100,
          cursor: 'pointer',
        }}>
          <IconButton
            onClick={toggleSidebar}
            sx={{ color: '#fff', fontSize: '30px' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Navigation tabs */}
        <Tabs
          orientation="vertical"
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            mt: 6,
            '& .MuiTab-root': {
              color: '#fff',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              minHeight: '60px',
              transition: 'all 0.3s',
              '& .MuiTab-wrapper': {
                flexDirection: 'row',
                gap: '10px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              },
            },
            '& .Mui-selected': {
              color: '#11101D',
              backgroundColor: '#fff',
              borderRadius: '12px',
            },
          }}
        >
          {visibleTabs.map((tab, index) => (
            <Tab key={index} icon={tab.icon} label={sidebarOpen ? tab.label : null} />
          ))}
        </Tabs>

        {/* Profile and Logout section */}
        <Box sx={{
          position: 'absolute',
          bottom: '20px',
          width: '100%',
          padding: '0 14px',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            {sidebarOpen && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ color: '#fff', fontWeight: 600 }}
                >
                  {user?.username}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#888' }}
                >
                  {user?.role || 'User'}
                </Typography>
              </Box>
            )}
          </Box>
          <Tooltip title="Logout" arrow>
            <Button
              fullWidth
              startIcon={<Logout />}
              onClick={handleLogout} // Secure logout
              sx={{
                mt: 2,
                backgroundColor: '#1d1b31',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 0',
                '&:hover': { backgroundColor: '#1565c0' },
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              {sidebarOpen && 'Logout'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Main content area */}
      <Box sx={{
        flex: 1,
        backgroundColor: '#f4f6f8',
        padding: '30px',
        marginLeft: sidebarOpen ? '250px' : '78px',
        transition: 'margin-left 0.3s ease-in-out',
      }}>
        {/* Top-right admin menu */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 2,
        }}>
          <Typography
            variant="body1"
            sx={{ mr: 1, fontWeight: 500 }}
          >
            {user?.username}
          </Typography>
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
            </Avatar>
          </IconButton>

          {/* Admin options menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>

        {/* Dashboard content rendering based on tabIndex */}
        <Box sx={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}>
          {visibleTabs[tabIndex] && React.createElement(visibleTabs[tabIndex].component, { setTabIndex, tabLabelToIndex })}
        </Box>
      </Box>
    </Box>
  );
}

// No changes needed for card styles
const cardStyles = (bgColor) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: bgColor,
  color: '#fff',
  borderRadius: '12px',
  transition: 'transform 0.3s',
  '&:hover': { transform: 'scale(1.05)' },
});

const actionCardStyles = {
  backgroundColor: '#fff',
  boxShadow: 3,
  borderRadius: '12px',
  padding: '20px',
};

export default AdminDashboard;
