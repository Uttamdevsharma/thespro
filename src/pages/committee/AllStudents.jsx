import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const AllStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const querySnapshot = await getDocs(q);
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
    };

    fetchStudents();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Students</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <div key={student.id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">{student.name}</p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllStudents;