
import React, { useState, useEffect, useRef } from 'react';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProfileModal from './ProfileModal';

const ProfileIcon = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openModal = () => {
    setModalOpen(true);
    setDropdownOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="focus:outline-none">
        <FaUserCircle className="w-8 h-8 text-gray-600" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700">
            <p className="font-semibold">{user?.name}</p>
          </div>
          <div className="border-t border-gray-200"></div>
          <button
            onClick={openModal}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            View Profile
          </button>
          <div className="border-t border-gray-200"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt className="inline-block mr-2" />
            Logout
          </button>
        </div>
      )}

      <ProfileModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
};

export default ProfileIcon;
