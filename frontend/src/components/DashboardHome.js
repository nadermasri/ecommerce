// src/components/DashboardHome.js

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Divider,
    Tooltip,
    Snackbar,
    Alert
} from '@mui/material';
import {
    AccountCircle,
    ShoppingCart,
    Inventory,
    ListAlt,
    History,
    AddBox
} from '@mui/icons-material';
import {
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip as ChartTooltip,
    Legend,
    Line,
    ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

// Import services
import { fetchUsers, fetchActivityLogs } from '../services/userService';
import { getProducts } from '../services/productService';
import { getLowStockAlerts } from '../services/inventoryService';
import { fetchOrders } from '../services/orderService';

const DashboardHome = ({ setTabIndex }) => {
  const navigate = useNavigate();

  // Handle navigation with tab index for consistency
  const handleNavigate = (path, tabIndex) => {
      setTabIndex(tabIndex);
      navigate(path);
  };

  // States for data
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowInventory, setLowInventory] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Helper function to format month labels
  const getMonthLabel = (date) => {
      const options = { month: 'short', year: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
  };

  // Function to aggregate data by month
  const aggregateDataByMonth = (usersData, productsData, ordersData) => {
      const dataMap = {};

      // Aggregate Users
      usersData.forEach(user => {
          const month = new Date(user.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!dataMap[month]) {
              dataMap[month] = { name: month, Users: 0, Products: 0, Orders: 0 };
          }
          dataMap[month].Users += 1;
      });

      // Aggregate Products
      productsData.forEach(product => {
          const month = new Date(product.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!dataMap[month]) {
              dataMap[month] = { name: month, Users: 0, Products: 0, Orders: 0 };
          }
          dataMap[month].Products += 1;
      });

      // Aggregate Orders
      ordersData.forEach(order => {
          const month = new Date(order.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!dataMap[month]) {
              dataMap[month] = { name: month, Users: 0, Products: 0, Orders: 0 };
          }
          dataMap[month].Orders += 1;
      });

      // Convert the dataMap to an array and sort by date
      const aggregatedData = Object.values(dataMap).sort((a, b) => {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          return dateA - dateB;
      });

      return aggregatedData;
  };

  // Fetch data on mount
  useEffect(() => {
      const fetchData = async () => {
          try {
              setLoading(true);
              setError(null); // Clear any previous errors

              // Fetch users, products, orders, low stock alerts, and activity logs
              const [usersData, ordersData, productsData, lowStockData, activityData] = await Promise.all([
                  fetchUsers(),
                  fetchOrders(),
                  getProducts(),
                  getLowStockAlerts(),
                  fetchActivityLogs(),
              ]);

              // Set raw data
              setUsers(usersData);
              setOrders(ordersData);
              setProducts(productsData);
              setLowInventory(lowStockData.length);
              setActivityLogs(activityData);

              // Aggregate data for the chart
              const aggregatedChartData = aggregateDataByMonth(usersData, productsData, ordersData);
              setChartData(aggregatedChartData);

              setAlertMessage('Dashboard data loaded successfully.');
              setAlertSeverity('success');
              setAlertOpen(true);
          } catch (error) {
              console.error('Error fetching dashboard data:', error);
              setError('An error occurred while loading data.');
              setAlertMessage('An error occurred while loading data.');
              setAlertSeverity('error');
              setAlertOpen(true);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
  }, []);

  const handleCloseAlert = (event, reason) => {
      if (reason === 'clickaway') return;
      setAlertOpen(false);
  };

  return (
      <Box sx={{ padding: '20px', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
          {/* Snackbar for user feedback */}
          <Snackbar
              open={alertOpen}
              autoHideDuration={6000}
              onClose={handleCloseAlert}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
              <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                  {alertMessage}
              </Alert>
          </Snackbar>

          <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
              
              {/* Total Users Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={cardStyles('#1976d2')}>
                      <CardContent>
                          <Typography variant="h5">Total Users</Typography>
                          <Typography variant="h3">
                              {loading ? <CircularProgress size={24} color="inherit" /> : users.length}
                          </Typography>
                      </CardContent>
                      <IconButton>
                          <AccountCircle sx={{ fontSize: 50, color: '#fff' }} />
                      </IconButton>
                  </Card>
              </Grid>

              {/* Total Orders Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={cardStyles('#ff9800')}>
                      <CardContent>
                          <Typography variant="h5">Total Orders</Typography>
                          <Typography variant="h3">
                              {loading ? <CircularProgress size={24} color="inherit" /> : orders.length}
                          </Typography>
                      </CardContent>
                      <IconButton>
                          <ShoppingCart sx={{ fontSize: 50, color: '#fff' }} />
                      </IconButton>
                  </Card>
              </Grid>

              {/* Total Products Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={cardStyles('#4caf50')}>
                      <CardContent>
                          <Typography variant="h5">Total Products</Typography>
                          <Typography variant="h3">
                              {loading ? <CircularProgress size={24} color="inherit" /> : products.length}
                          </Typography>
                      </CardContent>
                      <IconButton>
                          <Inventory sx={{ fontSize: 50, color: '#fff' }} />
                      </IconButton>
                  </Card>
              </Grid>

              {/* Low Inventory Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={cardStyles('#9c27b0')}>
                      <CardContent>
                          <Typography variant="h5"> Inventory</Typography>
                          <Typography variant="h3">
                              {loading ? <CircularProgress size={24} color="inherit" /> : lowInventory}
                          </Typography>
                      </CardContent>
                      <IconButton>
                          <ListAlt sx={{ fontSize: 50, color: '#fff' }} />
                      </IconButton>
                  </Card>
              </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
              
              {/* Quick Actions Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={actionCardStyles}>
                      <CardContent>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
                          <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddBox />}
                              fullWidth
                              sx={{ marginBottom: '10px', borderRadius: '8px' }}
                              onClick={() => handleNavigate('/users', 1)}
                          >
                              Add New User
                          </Button>
                          <Button
                              variant="contained"
                              color="secondary"
                              fullWidth
                              sx={{ borderRadius: '8px' }}
                              onClick={() => handleNavigate('/products', 3)}
                          >
                              Add New Product
                          </Button>
                      </CardContent>
                  </Card>
              </Grid>

              {/* Recent Activities Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={actionCardStyles}>
                      <CardContent>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Recent Activities</Typography>
                          <Divider sx={{ marginBottom: '10px' }} />
                          <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                              {activityLogs.length > 0 ? (
                                  activityLogs.slice(-5).reverse().map((log, index) => (
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
              <Grid item xs={12} sm={12} md={6}>
                  <Card sx={actionCardStyles}>
                      <CardContent>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Users, Products & Orders Overview (Last 12 Months)</Typography>
                          <Box sx={{ paddingTop: '20px', height: '300px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData}>
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <ChartTooltip />
                                      <Legend />
                                      <Line type="monotone" dataKey="Users" stroke="#8884d8" name="Users" />
                                      <Line type="monotone" dataKey="Products" stroke="#82ca9d" name="Products" />
                                      <Line type="monotone" dataKey="Orders" stroke="#ffc658" name="Orders" />
                                  </LineChart>
                              </ResponsiveContainer>
                          </Box>
                      </CardContent>
                  </Card>
              </Grid>
          </Grid>

          {/* Error Message */}
          {error && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="error">{error}</Typography>
              </Box>
          )}
      </Box>
  );
};

// Separate card styles to enhance readability and reusability
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

export default DashboardHome;
