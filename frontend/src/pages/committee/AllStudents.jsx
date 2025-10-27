import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const AllStudents = () => {
  const [students, setStudents] = useState([]);
  const user = useSelector(selectUser);

  const fetchStudents = async () => {
    if (!user || !user.token) {
      console.error('User not authenticated.');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.get('http://localhost:5005/api/users/students', config);
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Student</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">{student.name}</p>
              <p className="text-sm text-gray-400">{student.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllStudents;