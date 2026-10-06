import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
axios.defaults.baseURL = 'http://54.198.25.194:3000';
import './index.css'
import App from './App.jsx'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
