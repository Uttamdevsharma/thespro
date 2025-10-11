
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">ThesPro</h1>
      <button
        onClick={handleLogout}
        className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
