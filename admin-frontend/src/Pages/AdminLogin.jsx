
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  // State for login message/feedback
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' }); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Login failed');
      }

      const { token } = await res.json();
      if (token) {
        localStorage.setItem('admin_jwt', token);
      }
      setLoginMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      // TODO: redirect to dashboard once it exists
    } catch (err) {
      setLoginMessage({ type: 'error', text: err.message || 'Invalid username or password.' });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Helper function to determine message styling
  const getMessageClasses = () => {
    if (loginMessage.type === 'success') {
      return 'bg-green-100 border-green-400 text-green-700';
    } else if (loginMessage.type === 'error') {
      return 'bg-red-100 border-red-400 text-red-700';
    }
    return 'hidden';
  };

  return (
    // Fullscreen container with no padding
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">

      
      {/* Background Circles (omitted for brevity) */}
      <div className="absolute top-0 right-0 w-90 h-90 bg-blue-600 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>

      <div className="absolute bottom-0 left-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-90 h-90 bg-gray-300 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>

      {/* Logo + Title */}
      <div className="z-10 text-center mb-8">
        <GraduationCap className="mx-auto h-12 w-12 text-blue-600 fill-blue-600 bg-white p-2 rounded-full shadow-lg" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Result Management System
        </h1>
        <p className="text-gray-500 mt-1">
          Faculty of Engineering <br />
          University of Ruhuna
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl z-10">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6 ">
          Login
        </h2>

        {/* Login Message Display */}
        <div className={`p-3 border rounded-lg mb-4 text-center ${getMessageClasses()}`}>
            {loginMessage.text}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Email Address
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;