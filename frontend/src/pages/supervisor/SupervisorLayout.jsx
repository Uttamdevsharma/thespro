
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/userSlice';
import NotificationBell from '../../components/NotificationBell';
import ProfileIcon from '../../components/ProfileIcon';

const SupervisorLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-800">ThesPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ProfileIcon />
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
                <Link to="/supervisor/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Dashboard</Link>
              </li>
              <li className="mb-2">
                <Link to="/supervisor/pending-proposals" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Pending Proposals</Link>
              </li>
              <li className="mb-2">
                <Link to="/supervisor/chat" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Chat</Link>
              </li>
              <li className="mb-2">
                <Link to="/supervisor/notice" className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200">Notice</Link>
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