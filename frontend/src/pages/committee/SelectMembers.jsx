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
    const updatedDraft = { ...defenseBoardDraft, boardMembers: selectedMembers };
    toast.success('Board members added successfully.');
    navigate('/committee/defense-schedule/create', { state: { defenseBoardDraft: updatedDraft } });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Select Board Members</h1>
      <button onClick={handleAddMembers} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Add Selected Members</button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Select</th>
            <th className="py-2">Supervisor Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Cell</th>
          </tr>
        </thead>
        <tbody>
          {supervisors && supervisors.map(supervisor => (
            <tr key={supervisor._id}>
              <td><input type="checkbox" value={supervisor._id} onChange={handleCheckboxChange} checked={selectedMembers.includes(supervisor._id)} /></td>
              <td>{supervisor.name}</td>
              <td>{supervisor.email}</td>
              <td>{supervisor.researchCell?.name || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectMembers;
