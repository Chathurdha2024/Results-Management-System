import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';

function App() {
  // Initialize state based on localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    // 1. Update State
    setIsLoggedIn(false);
    // 2. Clear Local Storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_jwt'); // Clear the token as well if you use one
  };

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <AdminLogin setIsLoggedIn={handleLogin} />
          } 
        />

        {/* Dashboard - Pass handleLogout as a prop called 'onLogout' */}
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn ? 
            <AdminDashboard onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          }
        />

        {/* Default Redirects */}
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;