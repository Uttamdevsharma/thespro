import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      dispatch(login(data));
      const userRole = data.role ? data.role.toLowerCase() : '';
      switch (userRole) {
        case 'committee':
          navigate('/committee/dashboard');
          break;
        case 'supervisor':
          navigate('/supervisor/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo + ThesPro */}
            <div className="flex items-center space-x-2 select-none">
              <img
                src="/system-logo.png"
                alt="ThesPro Logo"
                className="h-12 w-auto"
              />
              <span className="text-2xl sm:text-3xl font-bold text-[#50C878] tracking-wide">
                ThesPro
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form Section */}
      <div className="flex-grow flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-semibold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 transition-colors duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <a
              href="/register"
              className="text-green-600 hover:text-green-800 font-semibold"
            >
              Create an Account
            </a>
            <a
              href="/"
              className="text-green-600 hover:text-green-800 font-semibold"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
