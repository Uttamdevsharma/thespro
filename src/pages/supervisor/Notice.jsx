import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Notice = () => {
  const user = useSelector(selectUser);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      const db = getFirestore();
      const q = query(collection(db, 'proposals'), where('supervisor', '==', user.uid), where('status', '==', 'Approved'));
      const querySnapshot = await getDocs(q);
      const groupsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupsList);
    };

    fetchGroups();
  }, [user]);

  const handleSelectGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSendNotice = async () => {
    if (!notice || selectedGroups.length === 0) return;
    const db = getFirestore();
    try {
      await addDoc(collection(db, 'notices'), {
        notice,
        groups: selectedGroups,
        supervisor: user.uid,
        createdAt: new Date(),
      });
      setNotice('');
      setSelectedGroups([]);
    } catch (error) {
      console.error("Error sending notice: ", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Send Notice</h1>
      <div className="mb-4">
        <textarea
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          placeholder="Write your notice here..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
        ></textarea>
      </div>
      <h2 className="text-xl font-bold mb-2">Select Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center">
            <input
              type="checkbox"
              id={group.id}
              checked={selectedGroups.includes(group.id)}
              onChange={() => handleSelectGroup(group.id)}
              className="mr-2"
            />
            <label htmlFor={group.id}>{group.title}</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleSendNotice}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Send Notice
      </button>
    </div>
  );
};

export default Notice;