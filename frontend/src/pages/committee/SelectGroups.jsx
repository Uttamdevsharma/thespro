import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAvailableProposalsQuery } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const SelectGroups = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { defenseBoardDraft } = location.state || {};
  const defenseType = defenseBoardDraft?.defenseType;

  const { data: availableProposals, isLoading } = useGetAvailableProposalsQuery(defenseType);

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
    if (selectedGroups.length === 0) {
      toast.error('Please select at least one group.');
      return;
    }
    const updatedDraft = { ...defenseBoardDraft, groups: selectedGroups };
    toast.success('Groups added successfully.');
    navigate('/committee/defense-schedule/create', { state: { defenseBoardDraft: updatedDraft } });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Select Groups</h1>

      <button
        onClick={handleAddGroups}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
      >
        Add Selected Groups
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Student IDs</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Name</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Title</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Type</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Supervisor</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Course Supervisor</th>
              <th className="py-3 px-4 text-center text-gray-700 font-medium">Select</th>
            </tr>
          </thead>
          <tbody>
            {availableProposals && availableProposals.map((proposal) => (
              <tr key={proposal._id} className="hover:bg-gray-50 border-b border-gray-200">
                <td className="py-2 px-4">{proposal.members.map(m => m.studentId).join(', ')}</td>
                <td className="py-2 px-4">{proposal.members.map(m => m.name).join(', ')}</td>
                <td className="py-2 px-4">{proposal.title}</td>
                <td className="py-2 px-4">{proposal.type}</td>
                <td className="py-2 px-4">{proposal.supervisorId.name}</td>
                <td className="py-2 px-4">{proposal.courseSupervisorId ? proposal.courseSupervisorId.name : '-'}</td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="checkbox"
                    value={proposal._id}
                    onChange={handleCheckboxChange}
                    checked={selectedGroups.includes(proposal._id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SelectGroups;
