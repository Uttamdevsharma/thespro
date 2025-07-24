import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [studentName, setStudentName] = useState('Student'); // Default name

  useEffect(() => {
    const fetchStudentName = async () => {
      if (user && user.uid) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setStudentName(userDocSnap.data().name || 'Student');
        }
      }
    };
    fetchStudentName();
  }, [user]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Hi {studentName}, welcome back to ThesPro!
      </h1>
      <p className="text-lg text-gray-500">
        Let’s start your academic journey. Propose your topic to get started!
      </p>
    </div>
  );
};

export default Dashboard;
