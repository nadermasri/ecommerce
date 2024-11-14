//components/AdminDashboard.js

// Import necessary modules and components from React and MUI
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, Menu, MenuItem, Avatar,
  Tooltip, Typography, Tabs, Tab
} from '@mui/material';
import {
  Logout, Home, ShoppingCart, Inventory,
  ListAlt, History, Menu as MenuIcon, AccountCircle
} from '@mui/icons-material';

// Import authentication service
import { logout } from '../services/authService';

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
  // State to manage active tab
  const [tabIndex, setTabIndex] = React.useState(0);
  // State to manage sidebar visibility
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // State for anchor element in menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication check on component mount
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/');
    }
  }, [navigate]);

  // Handle tab changes securely
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
  const handleLogout = () => {
    logout(); // Clear auth token securely
    navigate('/'); // Redirect to login page
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar with conditional rendering */}
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
          {/* Tabs with icons and labels */}
          <Tab icon={<Home />} label={sidebarOpen ? "Home" : null} />
          <Tab icon={<AccountCircle />} label={sidebarOpen ? "Users" : null} />
          <Tab icon={<ShoppingCart />} label={sidebarOpen ? "Orders" : null} />
          <Tab icon={<Inventory />} label={sidebarOpen ? "Products" : null} />
          <Tab icon={<ListAlt />} label={sidebarOpen ? "Inventory" : null} />
          <Tab icon={<History />} label={sidebarOpen ? "Logs" : null} />
          <Tab icon={<ListAlt />} label={sidebarOpen ? "Categories" : null} />
          <Tab icon={<ListAlt />} label={sidebarOpen ? "Subcategories" : null} />
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
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#1976d2' }} />
            {sidebarOpen && (
              <Box>
                <Typography
                  variant="body1"
                  sx={{ color: '#fff', fontWeight: 600 }}
                >
                  Super Admin
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: '#888' }}
                >
                  Web Developer
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
            Super Admin
          </Typography>
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              <AccountCircle />
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
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
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
          {/* Render components securely based on active tab */}
          {tabIndex === 0 && (
            <DashboardHome setTabIndex={setTabIndex} />
          )}
          {tabIndex === 1 && <UserManagement />}
          {tabIndex === 2 && <OrderManagement />}
          {tabIndex === 3 && <ProductManagement />}
          {tabIndex === 4 && <InventoryManagement />}
          {tabIndex === 5 && <ActivityLog />}
          {tabIndex === 6 && <CategoryManagement />}
          {tabIndex === 7 && <SubcategoryManagement />}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
