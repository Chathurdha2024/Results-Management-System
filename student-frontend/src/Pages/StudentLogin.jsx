import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';

// Define the dummy credentials
const DUMMY_USERNAME = 'eg20224981';
const DUMMY_PASSWORD = 'password123';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerNo, setRegisterNo] = useState('');
  // State for login message/feedback
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' }); 

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset previous message
    setLoginMessage({ type: '', text: '' });

    // --- Dummy Login Logic ---
    if (registerNo === DUMMY_USERNAME && password === DUMMY_PASSWORD) {
      console.log('Login successful for:', registerNo);
      setLoginMessage({ type: 'success', text: 'Login Successful! Redirecting...' });
      // In a real application, you would store the token/session and redirect here.
      // Example: history.push('/dashboard');
      
    } else {
      console.log('Login failed for:',registerNo);
      setLoginMessage({ type: 'error', text: 'Invalid registerNo or password.' });
    }
    // -------------------------
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
          Student Login
        </h2>

        {/* Login Message Display */}
        <div className={`p-3 border rounded-lg mb-4 text-center ${getMessageClasses()}`}>
            {loginMessage.text}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="regusterNo" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Register No
            </label>
            <div className="relative">
              <input
                id="registerNo"
                type="text"
                placeholder="EG/xxxx/xxxx"
                required
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
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
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;