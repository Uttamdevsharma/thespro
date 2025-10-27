import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const ResearchCells = () => {
  const [cells, setCells] = useState([]);
  const [supervisors, setSupervisors] = useState([]); // New state for supervisors
  const [formData, setFormData] = useState({ title: '', description: '' });
  const user = useSelector(selectUser);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  const fetchCellsAndSupervisors = async () => {
    if (!user || !user.token) return;
    try {
      const { data: cellsData } = await axios.get('http://localhost:5005/api/researchcells', config);
      const cellsList = cellsData.map((cell) => ({
        id: cell._id,
        ...cell,
      }));
      setCells(cellsList);

      const { data: supervisorsData } = await axios.get('http://localhost:5005/api/users/supervisors', config);
      setSupervisors(supervisorsData);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data.');
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchCellsAndSupervisors();
    }
  }, [user]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCell = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      toast.error('User not authenticated.');
      return;
    }
    try {
      await axios.post('http://localhost:5005/api/researchcells', formData, config);
      fetchCellsAndSupervisors(); // Re-fetch all data
      setFormData({ title: '', description: '' });
      toast.success('Research Cell Added.');
    } catch (error) {
      console.error("Error adding research cell: ", error);
      toast.error(`Failed to add research cell: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Research Cells</h1>

      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-4">Add New Research Cell</h2>
        <form onSubmit={handleAddCell} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="title"
            placeholder="Category Title"
            value={formData.title}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleFormChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline col-span-full"
          >
            Add Cell
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cells.map((cell) => {
          // Filter supervisors assigned to this cell
          const assignedSupervisors = supervisors.filter(supervisor => 
            supervisor.researchCells && supervisor.researchCells.includes(cell.id)
          );

          return (
            <div key={cell.id} className="bg-white p-4 rounded-lg shadow">
              <p className="text-xl font-bold">{cell.title}</p>
              <p className="text-sm text-gray-500">{cell.description}</p>
              {assignedSupervisors.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium">Assigned Supervisors:</h3>
                  {assignedSupervisors.map(supervisor => (
                    <span key={supervisor.id} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mt-1">
                      {supervisor.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchCells;