import React from 'react';
import { Outlet } from 'react-router-dom';
import ProfileIcon from '../../components/ProfileIcon';
import Sidebar from '../../components/Sidebar';

const CommitteeLayout = () => {
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
        <Sidebar role="committee" />

        {/* Main Content */}
        <main className="flex-1 p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CommitteeLayout;