// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import CreateAdminForm from './components/CreateAdminForm';
import DashboardHome from './components/DashboardHome';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppRoutes() {
    const { isAuthenticated, loading } = React.useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    return (
        <Routes>
            {/* Login Route */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard/home" /> : <LoginForm />} />

            {/* Dashboard Route - AdminDashboard */}
            <Route
                path="/dashboard/*"
                element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />}
            >
                {/* Nested Routes */}
                <Route path="home" element={<DashboardHome />} />
                {/* Add other nested routes here */}
            </Route>

            {/* Sign Up and Create Admin Routes */}
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/createAdmin" element={<CreateAdminForm />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;