// components/DashboardHome.js

import React, { useState, useEffect, useContext } from 'react';
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

// Import services
import { fetchUsers, fetchActivityLogs } from '../../services/userService';
import { getProducts } from '../../services/productService';
import { getLowStockAlerts } from '../../services/inventoryService';
import { fetchOrders } from '../../services/orderService';

// Import AuthContext
import { AuthContext } from '../../context/AuthContext';

const DashboardHome = ({ setTabIndex, tabLabelToIndex }) => {
  const { user } = useContext(AuthContext);

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

              let usersData = [];
              let ordersData = [];
              let productsData = [];
              let lowStockData = [];
              let activityData = [];

              if (user.role === 'SuperAdmin') {
                  [usersData, ordersData, productsData, lowStockData, activityData] = await Promise.all([
                      fetchUsers(),
                      fetchOrders(),
                      getProducts(),
                      getLowStockAlerts(),
                      fetchActivityLogs(),
                  ]);
              } else {
                  const promises = [];
                  if (user.role === 'ProductManager') {
                      promises.push(getProducts());
                  }
                  if (user.role === 'InventoryManager') {
                      promises.push(getLowStockAlerts());
                  }
                  if (user.role === 'OrderManager') {
                      promises.push(fetchOrders());
                  }
                  const results = await Promise.all(promises);

                  // Assign results based on the order of promises
                  let resultIndex = 0;
                  if (user.role === 'ProductManager') {
                      productsData = results[resultIndex++];
                  }
                  if (user.role === 'InventoryManager') {
                      lowStockData = results[resultIndex++];
                  }
                  if (user.role === 'OrderManager') {
                      ordersData = results[resultIndex++];
                  }
              }

              setUsers(usersData);
              setOrders(ordersData);
              setProducts(productsData);
              setLowInventory(lowStockData.length);
              setActivityLogs(activityData);

              // Aggregate data if necessary
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
  }, [user.role]);

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
              {user.role === 'SuperAdmin' && (
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
              )}

              {/* Total Orders Card */}
              {['SuperAdmin', 'OrderManager'].includes(user.role) && (
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
              )}

              {/* Total Products Card */}
              {['SuperAdmin', 'ProductManager'].includes(user.role) && (
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
              )}

              {/* Low Inventory Card */}
              {['SuperAdmin', 'InventoryManager'].includes(user.role) && (
                  <Grid item xs={12} sm={6} md={3}>
                      <Card sx={cardStyles('#9c27b0')}>
                          <CardContent>
                              <Typography variant="h5">Low Inventory</Typography>
                              <Typography variant="h3">
                                  {loading ? <CircularProgress size={24} color="inherit" /> : lowInventory}
                              </Typography>
                          </CardContent>
                          <IconButton>
                              <ListAlt sx={{ fontSize: 50, color: '#fff' }} />
                          </IconButton>
                      </Card>
                  </Grid>
              )}
          </Grid>

          <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
              {/* Quick Actions Card */}
              <Grid item xs={12} sm={6} md={3}>
                  <Card sx={actionCardStyles}>
                      <CardContent>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Quick Actions</Typography>
                          {user.role === 'SuperAdmin' && (
                              <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<AddBox />}
                                  fullWidth
                                  sx={{ marginBottom: '10px', borderRadius: '8px' }}
                                  onClick={() => setTabIndex(tabLabelToIndex['Users'])}
                              >
                                  Add New User
                              </Button>
                          )}
                          {['SuperAdmin', 'ProductManager'].includes(user.role) && (
                              <Button
                                  variant="contained"
                                  color="secondary"
                                  fullWidth
                                  sx={{ borderRadius: '8px' }}
                                  onClick={() => setTabIndex(tabLabelToIndex['Products'])}
                              >
                                  Add New Product
                              </Button>
                          )}
                          {['SuperAdmin', 'OrderManager'].includes(user.role) && (
                              <Button
                                  variant="contained"
                                  color="success"
                                  fullWidth
                                  sx={{ marginTop: '10px', borderRadius: '8px' }}
                                  onClick={() => setTabIndex(tabLabelToIndex['Orders'])}
                              >
                                  View Orders
                              </Button>
                          )}
                          {['SuperAdmin', 'InventoryManager'].includes(user.role) && (
                              <Button
                                  variant="contained"
                                  color="warning"
                                  fullWidth
                                  sx={{ marginTop: '10px', borderRadius: '8px' }}
                                  onClick={() => setTabIndex(tabLabelToIndex['Inventory'])}
                              >
                                  Check Inventory
                              </Button>
                          )}
                      </CardContent>
                  </Card>
              </Grid>

              {/* Recent Activities Card */}
              {user.role === 'SuperAdmin' && (
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
              )}

              {/* Sales Overview Chart */}
              {(user.role === 'SuperAdmin' || user.role === 'ProductManager' || user.role === 'OrderManager') && (
                  <Grid item xs={12} sm={12} md={6}>
                      <Card sx={actionCardStyles}>
                          <CardContent>
                              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Overview (Last 12 Months)</Typography>
                              <Box sx={{ paddingTop: '20px', height: '300px' }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={chartData}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis dataKey="name" />
                                          <YAxis />
                                          <ChartTooltip />
                                          <Legend />
                                          {user.role === 'SuperAdmin' && (
                                              <Line type="monotone" dataKey="Users" stroke="#8884d8" name="Users" />
                                          )}
                                          {['SuperAdmin', 'ProductManager'].includes(user.role) && (
                                              <Line type="monotone" dataKey="Products" stroke="#82ca9d" name="Products" />
                                          )}
                                          {['SuperAdmin', 'OrderManager'].includes(user.role) && (
                                              <Line type="monotone" dataKey="Orders" stroke="#ffc658" name="Orders" />
                                          )}
                                      </LineChart>
                                  </ResponsiveContainer>
                              </Box>
                          </CardContent>
                      </Card>
                  </Grid>
              )}
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

// Card styles remain the same
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
