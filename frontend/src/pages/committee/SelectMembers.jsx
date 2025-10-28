import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetTeachersQuery } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const SelectMembers = () => {
  const { data: supervisors, isLoading } = useGetTeachersQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const { defenseBoardDraft } = location.state || {};

  const [selectedMembers, setSelectedMembers] = useState(defenseBoardDraft?.boardMembers || []);

  const handleCheckboxChange = (e) => {
    const memberId = e.target.value;
    if (e.target.checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    }
  };

  const handleAddMembers = () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member.');
      return;
    }
    const updatedDraft = { ...defenseBoardDraft, boardMembers: selectedMembers };
    toast.success('Board members added successfully.');
    navigate('/committee/defense-schedule/create', { state: { defenseBoardDraft: updatedDraft } });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Select Board Members</h1>

      <button
        onClick={handleAddMembers}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
      >
        Add Selected Members
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-center text-gray-700 font-medium">Select</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Supervisor Name</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Email</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Research Cell</th>
            </tr>
          </thead>
          <tbody>
            {supervisors && supervisors.map((supervisor) => (
              <tr key={supervisor._id} className="hover:bg-gray-50 border-b border-gray-200">
                <td className="py-2 px-4 text-center">
                  <input
                    type="checkbox"
                    value={supervisor._id}
                    onChange={handleCheckboxChange}
                    checked={selectedMembers.includes(supervisor._id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="py-2 px-4">{supervisor.name}</td>
                <td className="py-2 px-4">{supervisor.email}</td>
                <td className="py-2 px-4">{supervisor.researchCell?.name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SelectMembers;
