import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const user = useSelector(selectUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureURL, setProfilePictureURL] = useState('');
  const [loading, setLoading] = useState(true);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setName(data.name || '');
        setEmail(data.email || '');
        setProfilePictureURL(data.profilePicture || '');
      } catch (error) {
        console.error("Error fetching user data: ", error);
        toast.error('Failed to fetch user data.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user || !user.token) {
      toast.error('No user logged in.');
      setLoading(false);
      return;
    }

    try {
      // Update name
      await axios.put('http://localhost:5000/api/users/profile', { name }, config);

      // Update password if newPassword is provided
      if (newPassword) {
        if (!currentPassword) {
          toast.error('Please enter your current password to update the new password.');
          setLoading(false);
          return;
        }
        await axios.put('http://localhost:5000/api/users/update-password', { currentPassword, newPassword }, config);
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }

      // Update profile picture
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        await axios.post('http://localhost:5000/api/users/profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.token}`,
          },
        });
        // After successful upload, re-fetch user data to get the updated URL
        const { data: updatedUserData } = await axios.get('http://localhost:5000/api/users/profile', config);
        setProfilePictureURL(updatedUserData.profilePicture || '');
        toast.success('Profile picture updated successfully!');
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast.error(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading profile...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled // Email is usually not directly editable via profile page
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter current password to change new password"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Leave blank if not changing password"
          />
        </div>
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input
            type="file"
            id="profilePicture"
            onChange={(e) => setProfilePicture(e.target.files[0])}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {profilePictureURL && (
            <img src={profilePictureURL} alt="Profile" className="mt-2 w-20 h-20 rounded-full object-cover" />
          )}
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;