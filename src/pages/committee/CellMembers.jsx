import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const CellMembers = () => {
  const [teachers, setTeachers] = useState([]);
  const [cells, setCells] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      try {
        

        const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
        const cellsMap = {};
        cellsSnapshot.forEach((doc) => {
          cellsMap[doc.id] = doc.data().title;
        });
        setCells(cellsMap);

        
        const teachersQuery = query(collection(db, 'users'), where('role', '==', 'supervisor'));
        const teachersSnapshot = await getDocs(teachersQuery);
        
        const teachersList = teachersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            let researchCells = data.researchCells || [];

            
            if (data.researchCell && researchCells.length === 0) {
              researchCells = [data.researchCell];
            }
            return { id: doc.id, ...data, researchCells: researchCells };
          })
          
          .filter(teacher => teacher.researchCells && teacher.researchCells.length > 0);

        setTeachers(teachersList);
      } catch (error) {
        console.error("Error fetching cell members: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Cell Members</h1>
      {teachers.length === 0 ? (
        <p>No teachers have been assigned to any research cells yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{teacher.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{teacher.email}</p>
              <div>
                <h3 className="text-md font-semibold mb-2">Assigned Cells:</h3>
                {teacher.researchCells.map((cellId) => (
                  <div key={cellId} className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                    {cells[cellId] || 'Unknown Cell'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CellMembers;