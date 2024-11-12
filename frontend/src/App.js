//authentic_lebanese_sentiment_shop/frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import CreateAdminForm from './components/CreateAdminForm';

function App() {
    const isAuthenticated = !!localStorage.getItem('authToken'); 

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />}
                />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/createAdmin" element={<CreateAdminForm />} />
            </Routes>
        </Router>
    );
}

export default App;
