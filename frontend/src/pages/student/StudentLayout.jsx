import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import NotificationBell from '../../components/NotificationBell';
import ProfileIcon from '../../components/ProfileIcon';

const StudentLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [studentName, setStudentName] = useState('Student');
  const [activeMenu, setActiveMenu] = useState('/student/dashboard'); // default active

  useEffect(() => {
    if (user) {
      setStudentName(user.name || 'Student');
    }
  }, [user]);

  const menuItems = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/proposal', label: 'Submit Proposal' },
    { to: '/student/proposal-status', label: 'Proposal Status' },
    { to: '/student/chat', label: 'Chat' },
    { to: '/student/research-cell-info', label: 'Research Cell Info' },
    { to: '/student/profile', label: 'Profile' },
  ];

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
        <aside
          className="w-64 text-black p-4 flex flex-col"
          style={{ backgroundColor: 'rgb(224, 224, 224)' }}
        >
          <nav className="flex-grow">
            <ul>
              {menuItems.map((item) => (
                <li key={item.to} className="mb-2">
                  <Link
                    to={item.to}
                    onClick={() => setActiveMenu(item.to)}
                    className={`block py-2 px-4 rounded transition-colors duration-200
                      ${
                        activeMenu === item.to
                          ? 'bg-green-500 text-white' // active menu
                          : 'hover:bg-white hover:text-black' // hover effect
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
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

export default StudentLayout;
