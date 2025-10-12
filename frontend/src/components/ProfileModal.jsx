
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProfileModal = ({ isOpen, onClose }) => {
  const user = useSelector(selectUser);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== retypePassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(
        '/api/users/update-password',
        { currentPassword, newPassword },
        config
      );

      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setRetypePassword('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="mb-4">
          <p><strong>Full Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          {user?.role === 'student' && <p><strong>Student ID:</strong> {user?.studentId}</p>}
        </div>

        {!showChangePassword && (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Change Password
          </button>
        )}

        {showChangePassword && (
          <form onSubmit={handleChangePassword}>
            <h3 className="text-xl font-bold mb-2">Change Password</h3>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Retype New Password"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
              >
                Change Password
              </button>
            </div>
          </form>
        )}

        <button
          onClick={onClose}
          className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
