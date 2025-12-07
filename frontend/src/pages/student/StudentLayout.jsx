import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import NotificationBell from '../../components/NotificationBell';
import ProfileIcon from '../../components/ProfileIcon';
import Sidebar from '../../components/Sidebar';

const StudentLayout = () => {
  const user = useSelector(selectUser);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    if (user) {
      setStudentName(user.name || 'Student');
    }
  }, [user]);

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
              <ProfileIcon />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        {/* Sidebar */}
        <Sidebar role="student" />

        {/* Main Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
