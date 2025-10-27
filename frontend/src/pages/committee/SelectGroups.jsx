import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAvailableProposalsQuery } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const SelectGroups = () => {
  const { data: availableProposals, isLoading } = useGetAvailableProposalsQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const { defenseBoardDraft } = location.state || {};

  const [selectedGroups, setSelectedGroups] = useState(defenseBoardDraft?.groups || []);

  const handleCheckboxChange = (e) => {
    const groupId = e.target.value;
    if (e.target.checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  const handleAddGroups = () => {
    const updatedDraft = { ...defenseBoardDraft, groups: selectedGroups };
    toast.success('Groups added successfully.');
    navigate('/committee/defense-schedule/create', { state: { defenseBoardDraft: updatedDraft } });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select Groups</h1>
      <button onClick={handleAddGroups} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Add Selected Groups</button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Name</th>
            <th className="py-2">Title</th>
            <th className="py-2">Type</th>
            <th className="py-2">Supervisor</th>
            <th className="py-2">Course Supervisor</th>
            <th className="py-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {availableProposals && availableProposals.map(proposal => (
            <tr key={proposal._id}>
              <td>{proposal.members.map(m => m.studentId).join(', ')}</td>
              <td>{proposal.members.map(m => m.name).join(', ')}</td>
              <td>{proposal.title}</td>
              <td>{proposal.type}</td>
              <td>{proposal.supervisorId.name}</td>
              <td>{proposal.courseSupervisorId ? proposal.courseSupervisorId.name : '-'}</td>
              <td><input type="checkbox" value={proposal._id} onChange={handleCheckboxChange} checked={selectedGroups.includes(proposal._id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectGroups;
