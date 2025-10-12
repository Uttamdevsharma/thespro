import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../features/userSlice';
import NotificationBell from '../../components/NotificationBell';

const StudentLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    if (user) {
      setStudentName(user.name || 'Student');
    }
  }, [user]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userInfo');
      dispatch(logout());
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Logout failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-800">ThesPro</span>
            </div>
            <div className="flex items-center">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ml-4" // Added ml-4 for spacing
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <nav className="flex-grow">
            <ul>
              <li className="mb-2">
                <Link to="/student/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link to="/student/proposal" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Submit Proposal</Link>
              </li>
              <li className="mb-2">
                <Link to="/student/proposal-status" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Proposal Status</Link>
              </li>
              <li className="mb-2">
                <Link to="/student/chat" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Chat</Link>
              </li>
              <li className="mb-2">
                <Link to="/student/research-cell-info" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Research Cell Info</Link>
              </li>
              <li className="mb-2">
                <Link to="/student/profile" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Profile</Link>
              </li>
            </ul>
          </nav>
          {/* Logout button is already in header, removed from here */}
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;