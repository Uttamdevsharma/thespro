import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const studentName = user?.name || user?.email || 'Student'; // Get name from Redux user object

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
