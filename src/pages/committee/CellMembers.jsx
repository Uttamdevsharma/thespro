import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const CellMembers = () => {
  const [teachers, setTeachers] = useState([]);
  const [cells, setCells] = useState({});
  
  useEffect(() => {
    
    const fetchCells = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'researchCells'));
      const cellsMap = {};
      querySnapshot.docs.forEach((doc) => {
        cellsMap[doc.id] = doc.data().title;
      });
      setCells(cellsMap);
    };

    const fetchTeachers = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'supervisor'), where('researchCell', '!=', null));
      const querySnapshot = await getDocs(q);
      const teachersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeachers(teachersList);
    };

    fetchCells();
    fetchTeachers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cell Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">{teacher.name}</p>
              <p className="text-sm text-gray-500">{teacher.email}</p>
              <p className="text-sm text-gray-500">
                Cell: {cells[teacher.researchCell] ? cells[teacher.researchCell] : 'N/A'}
              </p>
            </div>
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CellMembers;