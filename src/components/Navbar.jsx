
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import { logout } from '../features/userSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        dispatch(logout());
        navigate('/');
      })
      .catch((error) => {
        console.error(error);
      });
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
