import React from 'react';
import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo + ThesPro Title */}
          <div className="flex items-center  space-x- select-none">
            <img
              src="/system-logo.png"
              alt="ThesPro Logo1"
              className="h-12 w-auto mt-1"
            />
            <span className="text-2xl sm:text-4xl font-bold text-[#50C878] tracking-wide">
              ThesPro
            </span>
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white bg-[#50C878] hover:bg-[#3f9d6b] text-base font-semibold shadow transition-all duration-300"
          >
            Login
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
              />
            </svg>
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
