import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminLogin = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // ✅ Save JWT
      localStorage.setItem('admin_jwt', data.token);

      // ✅ Update auth state
      setIsLoggedIn(true);

      setLoginMessage({
        type: 'success',
        text: 'Login successful! Redirecting...',
      });

      // ✅ Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setLoginMessage({
        type: 'error',
        text: err.message || 'Invalid username or password',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const getMessageClasses = () => {
    if (loginMessage.type === 'success')
      return 'bg-green-100 border-green-400 text-green-700';
    if (loginMessage.type === 'error')
      return 'bg-red-100 border-red-400 text-red-700';
    return 'hidden';
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
      {/* Background Circles */}
      <div className="absolute top-0 right-0 w-90 h-90 bg-blue-600 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2" />

      <div className="absolute bottom-0 left-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-90 h-90 bg-gray-300 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3" />

      {/* Logo */}
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
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
          Login
        </h2>

        <div
          className={`p-3 border rounded-lg mb-4 text-center ${getMessageClasses()}`}
        >
          {loginMessage.text}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
