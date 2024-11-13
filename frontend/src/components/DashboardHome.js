import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, IconButton, CircularProgress, Divider, Tooltip } from '@mui/material';
import { AccountCircle, ShoppingCart, Inventory, ListAlt, History, AddBox } from '@mui/icons-material';
import { LineChart, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, Legend, Line, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

// Import services
import { fetchUsers } from '../services/userService';
import { getProducts } from '../services/productService';
import { getLowStockAlerts } from '../services/inventoryService';
import { fetchActivityLogs } from '../services/userService'; // Assuming activity logs API
import { fetchOrders } from '../services/orderService'; // <-- Import fetchOrders

const DashboardHome = ({ setTabIndex }) => {
  const navigate = useNavigate();

  // Handle navigation
  const handleNavigate = (path, tabIndex) => {
    setTabIndex(tabIndex); // Update tabIndex to switch to the respective tab
    navigate(path); // Navigate to the respective page
  };

  // States for data
  const [users, setUsers] = useState(0);
  const [orders, setOrders] = useState(0);
  const [products, setProducts] = useState(0);
  const [lowInventory, setLowInventory] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users, products, low stock alerts, and activity logs
        const userData = await fetchUsers();
        const orderData = await fetchOrders(); // Fetch real orders data
        const productData = await getProducts();
        const lowStockData = await getLowStockAlerts();
        const activityData = await fetchActivityLogs();

        setUsers(userData.length); // Assuming user data has a length for total count
        setOrders(orderData.length); // Assuming order data has a length for total count
        setProducts(productData.length); // Assuming product data has a length for total count
        setLowInventory(lowStockData.length); // Assuming low stock data has a length for total count
        setActivityLogs(activityData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Updated function to change tab without navigation
  const handleNavigateToTab = (tabIndex) => {
    setTabIndex(tabIndex);
  };

  // Dummy data for charts (You can replace this with real data if available)
  const chartData = [
    { name: 'Jan', uv: 4000, pv: 2400 },
    { name: 'Feb', uv: 3000, pv: 1398 },
    { name: 'Mar', uv: 2000, pv: 9800 },
    { name: 'Apr', uv: 2780, pv: 3908 },
  ];

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      {/* Quick Stats Section */}
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#1976d2', color: '#fff', borderRadius: '12px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent>
              <Typography variant="h5">Total Users</Typography>
              <Typography variant="h3">{loading ? <CircularProgress size={24} /> : users}</Typography>
            </CardContent>
            <IconButton>
              <AccountCircle sx={{ fontSize: 50, color: '#fff' }} />
            </IconButton>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#ff9800', color: '#fff', borderRadius: '12px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent>
              <Typography variant="h5">Total Orders</Typography>
              <Typography variant="h3">{loading ? <CircularProgress size={24} /> : orders}</Typography>
            </CardContent>
            <IconButton>
              <ShoppingCart sx={{ fontSize: 50, color: '#fff' }} />
            </IconButton>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#4caf50', color: '#fff', borderRadius: '12px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent>
              <Typography variant="h5">Total Products</Typography>
              <Typography variant="h3">{loading ? <CircularProgress size={24} /> : products}</Typography>
            </CardContent>
            <IconButton>
              <Inventory sx={{ fontSize: 50, color: '#fff' }} />
            </IconButton>
          </Card>
        </Grid>

        {/* Low Inventory */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#9c27b0', color: '#fff', borderRadius: '12px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent>
              <Typography variant="h5">Low Inventory</Typography>
              <Typography variant="h3">{loading ? <CircularProgress size={24} /> : lowInventory}</Typography>
            </CardContent>
            <IconButton>
              <ListAlt sx={{ fontSize: 50, color: '#fff' }} />
            </IconButton>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions Section */}
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        {/* Quick Actions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff', boxShadow: 3, borderRadius: '12px', padding: '20px' }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBox />}
                fullWidth
                sx={{ marginBottom: '10px', borderRadius: '8px' }}
                onClick={() => handleNavigateToTab(1)}
              >
                Add New User
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ borderRadius: '8px' }}
                onClick={() => handleNavigateToTab(3)}
              >
                Add New Product
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff', boxShadow: 3, borderRadius: '12px', padding: '20px' }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Recent Activities</Typography>
              <Divider sx={{ marginBottom: '10px' }} />
              <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                {activityLogs.length > 0 ? (
                  activityLogs.map((log, index) => (
                    <Typography key={index} variant="body2" sx={{ marginBottom: '10px' }}>
                      - {log.action} by {log.admin_name}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">No recent activities available.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales Overview Chart */}
        <Grid item xs={12} sm={6} md={6}>
          <Card sx={{ backgroundColor: '#fff', boxShadow: 3, borderRadius: '12px', padding: '20px' }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Sales Overview (Last 3 Months)</Typography>
              <Box sx={{ paddingTop: '20px', height: '300px' }}>
                <LineChart width={600} height={300} data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                  <Bar dataKey="pv" fill="#82ca9d" />
                </LineChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
