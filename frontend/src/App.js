// src/App.js

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import { useContext } from 'react';

// Importing Components
import CustomerLayout from './components/Customer/CustomerLayout';
import Homepage from './components/Customer/Homepage';
import Products from './components/Customer/Products';
import Categories from './components/Customer/Categories';
import Promotions from './components/Customer/Promotions';
import ProductDetail from './components/Customer/ProductDetail';
import Cart from './components/Customer/Cart';
import Profile from './components/Customer/Profile';
import Orders from './components/Customer/Orders';
import Checkout from './components/Customer/Checkout';
import UserLogin from './components/Shared/UserLogin';
import Footer from './components/Customer/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

// Import CSS assets
import './assets/css/variables.css'; // Import CSS variables
import './assets/css/customNavbar.css'; // Import custom Navbar CSS

// Lazy loading Admin components
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const DashboardHome = lazy(() => import('./components/Admin/DashboardHome'));
const AdminLogin = lazy(() => import('./components/Shared/AdminLogin')); // Ensure the path is correct
const SignUpForm = lazy(() => import('./components/Admin/SignUpForm'));
const CreateAdminForm = lazy(() => import('./components/Admin/CreateAdminForm'));

function AppRoutes() {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        // Display a loading spinner while checking authentication
        return (
            <Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </div>
            }>
                <div>Loading...</div>
            </Suspense>
        );
    }

    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </div>
        }>
            <Routes>
                {/* Redirect root to /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />

                {/* Customer Routes wrapped with CustomerLayout */}
                <Route element={<CustomerLayout />}>
                    <Route path="/home" element={<Homepage />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:productId" element={<ProductDetail />} />
                    <Route path="/categories/:categoryId" element={<Categories />} />
                    <Route path="/promotions" element={<Promotions />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} />
                    <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" replace />} />
                    <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" replace />} />
                    <Route path="/login" element={<UserLogin />} />
                    <Route path="/signup" element={<SignUpForm />} />
                    <Route path="/createAdmin" element={<CreateAdminForm />} />
                </Route>

                {/* Admin Routes Protected by ProtectedRoute */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute requiredRole="SuperAdmin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                >
                    <Route path="home" element={<DashboardHome />} />
                    {/* Add other nested admin routes here */}
                </Route>

                {/* Admin Login Route */}
                <Route
                    path="/admin/login"
                    element={
                        !isAuthenticated ? (
                            <AdminLogin />
                        ) : user?.role === 'SuperAdmin' ? (
                            <Navigate to="/admin/home" replace />
                        ) : (
                            <Navigate to="/home" replace />
                        )
                    }
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </Suspense>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <ErrorBoundary>
                    <AppRoutes />
                </ErrorBoundary>
            </Router>
        </AuthProvider>
    );
}

export default App;
