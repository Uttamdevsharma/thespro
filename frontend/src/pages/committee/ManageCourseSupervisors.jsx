import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';
import DefenseSchedule from './DefenseSchedule'; // Import DefenseSchedule component
import AllDefenseBoards from './AllDefenseBoards'; // Import AllDefenseBoards component


const ManageCourseSupervisors = () => {
  const user = useSelector(selectUser);
  const [supervisors, setSupervisors] = useState([]);
  const [mainSupervisors, setMainSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isCourseSupervisor, setIsCourseSupervisor] = useState(false);
  const [selectedMainSupervisor, setSelectedMainSupervisor] = useState('');

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user || !user.token) return;
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      try {
const { data } = await axios.get('http://localhost:5005/api/users/supervisors/all', config);
        setSupervisors(data);
        const assignedMainSupervisors = data.filter(s => s.isCourseSupervisor).map(s => s.mainSupervisor).filter(Boolean);
        setMainSupervisors(data.filter(s => !s.isCourseSupervisor && !assignedMainSupervisors.includes(s._id)));
      } catch (error) {
        toast.error('Failed to fetch supervisors.');
        console.error(error);
      }
    };
    fetchSupervisors();
  }, [user]);

  const handleSupervisorSelect = (e) => {
    const supervisorId = e.target.value;
    setSelectedSupervisor(supervisorId);
    const supervisor = supervisors.find(s => s._id === supervisorId);
    if (supervisor) {
      setIsCourseSupervisor(supervisor.isCourseSupervisor);
      setSelectedMainSupervisor(supervisor.mainSupervisor || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) return toast.error('User not logged in.');
    if (!selectedSupervisor) return toast.error('Please select a supervisor.');

    const config = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    };

    try {
      await axios.put(
        `http://localhost:5005/api/users/supervisors/${selectedSupervisor}/assign-course-supervisor`,
        { isCourseSupervisor, mainSupervisor: selectedMainSupervisor || null },
        config
      );
      toast.success('Supervisor role updated successfully!');
      // Refresh data
      const { data } = await axios.get('http://localhost:5005/api/users/supervisors/all', config);
      setSupervisors(data);
      const assignedMainSupervisors = data.filter(s => s.isCourseSupervisor).map(s => s.mainSupervisor).filter(Boolean);
      setMainSupervisors(data.filter(s => !s.isCourseSupervisor && !assignedMainSupervisors.includes(s._id)));
      setSelectedSupervisor('');
      setIsCourseSupervisor(false);
      setSelectedMainSupervisor('');
    } catch (error) {
      toast.error(`Failed to update supervisor role: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Course Supervisors</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="supervisorSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Select Supervisor
          </label>
          <select
            id="supervisorSelect"
            value={selectedSupervisor}
            onChange={handleSupervisorSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">-- Select a Supervisor --</option>
            {supervisors.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {selectedSupervisor && (
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={isCourseSupervisor}
                onChange={(e) => setIsCourseSupervisor(e.target.checked)}
              />
              <span className="ml-2 text-gray-700">Is Course Supervisor</span>
            </label>
          </div>
        )}

        {isCourseSupervisor && selectedSupervisor && (
          <div className="mb-4">
            <label htmlFor="mainSupervisorSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Main Supervisor
            </label>
            <select
              id="mainSupervisorSelect"
              value={selectedMainSupervisor}
              onChange={(e) => setSelectedMainSupervisor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">-- Select Main Supervisor --</option>
              {mainSupervisors
                .filter(s => s._id !== selectedSupervisor)
                .map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          Update Role
        </button>
      </form>

      <h2 className="text-xl font-bold mb-3">Current Course Supervisor Mappings</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {supervisors.filter(s => s.isCourseSupervisor).length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {supervisors.filter(s => s.isCourseSupervisor).map(cs => (
              <li key={cs._id} className="py-3">
                <p className="font-semibold">{cs.name} (Course Supervisor)</p>
                {cs.mainSupervisor && (
                  <p className="text-sm text-gray-600 ml-4">
                    Under: {supervisors.find(s => s._id === cs.mainSupervisor)?.name || 'N/A'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No course supervisors assigned yet.</p>
        )}
      </div>

      
    </div>
  );
};

export default ManageCourseSupervisors;
