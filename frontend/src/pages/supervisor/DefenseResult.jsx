import React, { useState } from 'react';
import { useGetProposalsBySupervisorQuery } from '../../features/apiSlice';

const DefenseResult = () => {
  const [filter, setFilter] = useState('all');
  const { data: proposals, isLoading, isError, error } = useGetProposalsBySupervisorQuery({ filter });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Defense Result</h1>

      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded-md">
          <option value="all">All groups</option>
          <option value="my-supervision">Under my supervision</option>
          <option value="my-supervision-with-course">Under my supervision with course supervisor</option>
          <option value="my-course-supervision">Under my course supervision</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading proposals...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Group ID</th>
              <th className="py-2">Group Name</th>
              <th className="py-2">Title</th>
              <th className="py-2">Type</th>
              <th className="py-2">Members</th>
              <th className="py-2">Comments</th>
            </tr>
          </thead>
          <tbody>
            {proposals && proposals.map((proposal) => (
              <tr key={proposal._id} className="text-center">
                <td className="py-2">{proposal.groupId}</td>
                <td className="py-2">{proposal.title}</td>
                <td className="py-2">{proposal.proposalType}</td>
                <td className="py-2">{proposal.members.map(m => m.name).join(', ')}</td>
                {/* Comments are not available in the proposal model, so this will be empty */}
                <td className="py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DefenseResult;
