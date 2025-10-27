import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const ResearchCellInfo = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      try {
        const { data: teachersData } = await axios.get('http://localhost:5005/api/users/supervisors', config);
        
        // Filter for teachers who are assigned to one or more cells
        const teachersWithCells = teachersData.filter(teacher => teacher.researchCells && teacher.researchCells.length > 0);

        setTeachers(teachersWithCells);
      } catch (error) {
        console.error("Error fetching research cell info: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Research Cell Information</h1>
      {teachers.length === 0 ? (
        <p>No teachers have been assigned to any research cells yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{teacher.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{teacher.email}</p>
              <div>
                <h3 className="text-md font-semibold mb-2">Assigned Cells:</h3>
                {teacher.researchCells.map((cell) => (
                  <div key={cell._id} className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                    {cell.title}
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

export default ResearchCellInfo;
