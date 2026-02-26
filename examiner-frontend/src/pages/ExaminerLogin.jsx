import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const ExaminerLogin = () => {
  const [registerNo, setRegisterNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate(); // 2. Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage({ type: '', text: '' });
    setLoading(true);

    // Simulated hardcoded login logic
    setTimeout(() => {
      if (registerNo === 'examiner@portal.com' && password === 'admin123') {
        setLoginMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        
        // Setting dummy data to localStorage
        localStorage.setItem('token', 'dummy-examiner-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Examiner User', role: 'examiner' }));

        // Navigate to Dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1000);
      } else {
        setLoginMessage({ type: 'error', text: 'Invalid email or password.' });
        setLoading(false);
      }
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getMessageClasses = () => {
    if (loginMessage.type === 'success') return 'bg-green-100 border-green-400 text-green-700';
    if (loginMessage.type === 'error') return 'bg-red-100 border-red-400 text-red-700';
    return 'hidden';
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-90 h-90 bg-blue-600 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-120 h-120 bg-gray-200 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-90 h-90 bg-gray-300 rounded-full opacity-60 transform -translate-x-1/3 translate-y-1/3"></div>

      <div className="z-10 text-center mb-8">
        <GraduationCap className="mx-auto h-12 w-12 text-blue-600 fill-blue-600 bg-white p-2 rounded-full shadow-lg" />
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Result Management System</h1>
        <p className="text-gray-500 mt-1">Examiner Portal</p>
      </div>

      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-2xl z-10">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Examiner Login</h2>
        <div className={`p-3 border rounded-lg mb-4 text-center text-sm ${getMessageClasses()}`}>
            {loginMessage.text}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 text-left">Email</label>
            <div className="relative">
              <input
                id="email"
                type="text"
                placeholder="Enter email"
                required
                value={registerNo}
                onChange={(e) => setRegisterNo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 text-left">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
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
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExaminerLogin;