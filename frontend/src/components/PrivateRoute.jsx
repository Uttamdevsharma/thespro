
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children, role }) => {
  const user = useSelector(selectUser);

  if (!user) {
    toast.error("Session expired or unauthorized access. Please log in again.");
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    toast.error("Unauthorized access. Please log in with appropriate credentials.");
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
