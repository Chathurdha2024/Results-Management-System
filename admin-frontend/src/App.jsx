import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminLogin from './Pages/AdminLogin.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Programs from './Pages/Programs.jsx';
import Exams from './Pages/Exams.jsx';
import Examiners from './Pages/Examiners.jsx';
import Results from './Pages/Results.jsx';
import Students from './Pages/Students.jsx';
import Reports from './Pages/Reports.jsx';

function App() {
  // 1. Initialize authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin_jwt');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE: Login */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <AdminLogin setIsLoggedIn={handleLogin} />
          } 
        />

        {/* PROTECTED ROUTES: Wrapped in AdminLayout */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        >
          {/* Nested Routes render inside the <Outlet /> of AdminLayout */}
          <Route index element={<Dashboard />} />
          <Route path="programs" element={<Programs />} />
          <Route path="exams" element={<Exams />} />
          <Route path="examiners" element={<Examiners />} />
          <Route path="results" element={<Results />} />
          <Route path="students" element={<Students />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch-all: Redirect to Home or Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;