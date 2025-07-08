import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setName(data.name);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    const db = getFirestore();
    const storage = getStorage();
    let profilePictureURL = userData.profilePicture;

    if (profilePicture) {
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(storageRef, profilePicture);
      profilePictureURL = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, 'users', user.uid), {
      name,
      profilePicture: profilePictureURL,
    });

    setUserData({ ...userData, name, profilePicture: profilePictureURL });
    setShowProfileModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <div className="flex items-center">
          <button onClick={() => setShowProfileModal(true)} className="mr-4">
            <img src={userData?.profilePicture || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full" />
          </button>
          <button className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
          </button>
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Profile Picture</label>
              <input
                type="file"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowProfileModal(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleUpdateProfile} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;