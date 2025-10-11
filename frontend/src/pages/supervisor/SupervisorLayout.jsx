import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../../features/userSlice';

const SupervisorLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [supervisorName, setSupervisorName] = useState('Supervisor');

  useEffect(() => {
    if (user) {
      setSupervisorName(user.name || 'Supervisor');
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
      <header className="bg-white shadow-md sticky top-0 z-40 border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">ThesPro</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline px-4 py-2 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col shadow-lg">
          <nav className="flex-grow">
            <ul>
              <li className="mb-2">
                <Link to="/supervisor/dashboard" className="block py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link to="/supervisor/requests" className="block py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">Requests</Link>
              </li>
              <li className="mb-2">
                <Link to="/supervisor/notice" className="block py-2 px-4 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">Notice</Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;