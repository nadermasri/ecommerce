import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Menu, MenuItem, Avatar, Tooltip, Typography, Tabs, Tab } from '@mui/material';
import { Logout, Home, ShoppingCart, Inventory, ListAlt, History, Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { logout } from '../services/authService'; // Import logout function

import OrderManagement from './OrderManagement';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import InventoryManagement from './InventoryManagement';
import ActivityLog from './ActivityLog';
import DashboardHome from './DashboardHome'
import CategoryManagement from './CategoryManagement';
import SubcategoryManagement from './SubcategoryManagement';


function AdminDashboard() {
    const [tabIndex, setTabIndex] = React.useState(0);  // Manage the active tab
    const [sidebarOpen, setSidebarOpen] = React.useState(true);  // Toggle sidebar state
    const [anchorEl, setAnchorEl] = React.useState(null);  // For Super Admin menu
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is authenticated
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/'); // Redirect to login if not authenticated
        }
    }, [navigate]);


    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    // Handle super admin menu open
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle super admin menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout(); // Clear the auth token
        navigate('/'); // Redirect to login page after logout
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
                {/* Burger Menu Icon */}
                <Box sx={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1100,
                    cursor: 'pointer',
                }}>
                    <IconButton onClick={toggleSidebar} sx={{ color: '#fff', fontSize: '30px' }}>
                        <MenuIcon />
                    </IconButton>
                </Box>

                {/* Tabs for navigation */}
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
                    {/* Home tab with Home icon */}
                    <Tab icon={<Home />} label={sidebarOpen ? "Home" : null} />

                    {/* Users tab */}
                    <Tab icon={<AccountCircle />} label={sidebarOpen ? "Users" : null} />
                    
                    {/* Orders tab */}
                    <Tab icon={<ShoppingCart />} label={sidebarOpen ? "Orders" : null} />
                    
                    {/* Products tab */}
                    <Tab icon={<Inventory />} label={sidebarOpen ? "Products" : null} />
                    
                    {/* Inventory tab */}
                    <Tab icon={<ListAlt />} label={sidebarOpen ? "Inventory" : null} />
                    
                    {/* Logs tab */}
                    <Tab icon={<History />} label={sidebarOpen ? "Logs" : null} />

                    <Tab icon={<ListAlt />} label={sidebarOpen ? "Category Management" : null} />
                    <Tab icon={<ListAlt />} label={sidebarOpen ? "Subcategory Management" : null} />
                </Tabs>

                {/* Profile and Logout */}
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
                                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Super Admin
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>
                                    Web Developer
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Tooltip title="Logout" arrow>
                        <Button
                            fullWidth
                            startIcon={<Logout />}
                            onClick={handleLogout} // Trigger logout on button click
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

            {/* Main Content Area */}
            <Box sx={{
                flex: 1,
                backgroundColor: '#f4f6f8',
                padding: '30px',
                marginLeft: sidebarOpen ? '250px' : '78px',
                transition: 'margin-left 0.3s ease-in-out',
            }}>
                {/* Top-right Super Admin section */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    mb: 2,
                }}>
                    <Typography variant="body1" sx={{ mr: 1, fontWeight: 500 }}>Super Admin</Typography>
                    <IconButton onClick={handleMenuOpen}>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                            <AccountCircle />
                        </Avatar>
                    </IconButton>

                    {/* Menu for Super Admin options */}
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

                {/* Dashboard Content */}
                <Box sx={{
                    backgroundColor: '#fff',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}>
                    {/* Render DashboardHome on Home tab */}
                    {tabIndex === 0 && <DashboardHome setTabIndex={setTabIndex} />}  {/* Pass setTabIndex */}
                    {tabIndex === 1 && <UserManagement />}
                    {tabIndex === 2 && <OrderManagement />}
                    {tabIndex === 3 && <ProductManagement />}
                    {tabIndex === 4 && <InventoryManagement />}
                    {tabIndex === 5 && <ActivityLog />}
                    {/* Render Category Management form */}
                    {tabIndex === 6 && <CategoryManagement />}  {/* Add Category Form */}
                    
                    {/* Render Subcategory Management form */}
                    {tabIndex === 7 && <SubcategoryManagement />}  {/* Add Subcategory Form */}
                </Box>
            </Box>
        </Box>
    );
}

export default AdminDashboard;
