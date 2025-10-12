import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import NotificationBell from '../../components/NotificationBell';
import ProfileIcon from '../../components/ProfileIcon';

const SupervisorLayout = () => {
  const [activeMenu, setActiveMenu] = useState('/supervisor/dashboard'); // default active

  const menuItems = [
    { to: '/supervisor/dashboard', label: 'Dashboard' },
    { to: '/supervisor/pending-proposals', label: 'Pending Proposals' },
    { to: '/supervisor/chat', label: 'Chat' },
    { to: '/supervisor/notice', label: 'Notice' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
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

            {/* Profile Icon */}
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <ProfileIcon  />
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

export default SupervisorLayout;
