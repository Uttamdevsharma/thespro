import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [currentCGPA, setCurrentCGPA] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5005/api/auth/register', {
        name,
        email,
        password,
        studentId,
        department,
        currentCGPA,
        role: 'student', // Default role
        profilePicture: '',
      });
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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

      {/* Register Form Section */}
      <div className="flex-grow flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            Student Registration
          </h2>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
                required
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="studentId">
                Student ID
              </label>
              <input
                id="studentId"
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="department">
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
              >
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="BBA">BBA</option>
                <option value="Textile">Textile</option>
              </select>
            </div>

            {/* Current CGPA */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="currentCGPA">
                Current CGPA
              </label>
              <input
                id="currentCGPA"
                type="number"
                placeholder="Enter your current CGPA"
                value={currentCGPA}
                onChange={(e) => setCurrentCGPA(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700 shadow-sm"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-lg shadow-md hover:from-green-500 hover:to-green-700 transition-colors duration-200"
            >
              Register
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <a
              href="/login"
              className="text-green-600 hover:text-green-800 font-semibold"
            >
              Already have an account?
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

export default Register;
