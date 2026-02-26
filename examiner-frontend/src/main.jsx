import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import ExaminerLogin from './pages/ExaminerLogin.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The first page the user sees */}
        <Route path="/login" element={<ExaminerLogin />} />
        
        {/* Your main dashboard logic */}
        <Route path="/dashboard" element={<App />} />
        
        {/* Redirect empty paths to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);