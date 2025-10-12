import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import ProfileIcon from '../../components/ProfileIcon';

const CommitteeLayout = () => {
  const [activeMenu, setActiveMenu] = useState('/committee/dashboard'); // default active

  const menuItems = [
    { to: '/committee/dashboard', label: 'Dashboard' },
    { to: '/committee/all-students', label: 'All Students' },
    { to: '/committee/all-teachers', label: 'All Teachers' },
    { to: '/committee/research-cells', label: 'Research Cells' },
    { to: '/committee/cell-members', label: 'Cell Members' },
    { to: '/committee/committee-members', label: 'Committee Members' },
    { to: '/committee/notices', label: 'Notices' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className="w-64 text-black min-h-screen p-4"
          style={{ backgroundColor: 'rgb(224, 224, 224)' }}
        >
          <nav>
            <ul>
              {menuItems.map((item) => (
                <li key={item.to}>
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
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CommitteeLayout;
