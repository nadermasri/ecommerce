import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import CreateAdminForm from './components/CreateAdminForm';
import DashboardHome from './components/DashboardHome'; // Import the new homepage component

function App() {
    const isAuthenticated = !!localStorage.getItem('authToken'); 

    return (
        <Router>
            <Routes>
                {/* Login Route */}
                <Route path="/" element={<LoginForm />} />
                
                {/* Dashboard Route - AdminDashboard */}
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />}
                >
                    {/* Default Route - Home page inside AdminDashboard */}
                    <Route path="/dashboard/home" element={<DashboardHome />} />  {/* Dashboard Home */}
                    {/* Add other routes inside the AdminDashboard as needed */}
                </Route>

                {/* Sign Up and Create Admin Routes */}
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/createAdmin" element={<CreateAdminForm />} />
            </Routes>
        </Router>
    );
}

export default App;
