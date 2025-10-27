import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetPendingProposalsByCellQuery, useForwardProposalMutation, useRejectProposalMutation } from '../../features/apiSlice';

const CommitteePendingProposals = () => {
  const { data: proposalsByCell, isLoading } = useGetPendingProposalsByCellQuery();
  const [forwardProposal] = useForwardProposalMutation();
  const [rejectProposal] = useRejectProposalMutation();
  const [selectedCell, setSelectedCell] = useState(null);

  const handleCellClick = (cell) => {
    setSelectedCell(cell);
  };

  const handleForward = async (proposalId) => {
    try {
      await forwardProposal(proposalId).unwrap();
      toast.success('Proposal forwarded to supervisor!');
      setSelectedCell(null); // Go back to cell list
    } catch (error) {
      toast.error(`Failed to forward proposal: ${error.data?.message || error.message}`);
    }
  };

  const handleReject = async (proposalId) => {
    const feedback = prompt('Enter feedback for rejection:');
    if (!feedback) return toast.error('Feedback is required to reject a proposal.');

    try {
      await rejectProposal({ id: proposalId, feedback }).unwrap();
      toast.success('Proposal rejected!');
      setSelectedCell(null); // Go back to cell list
    } catch (error) {
      toast.error(`Failed to reject proposal: ${error.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (selectedCell) {
    return (
      <div className="p-6">
        <button onClick={() => setSelectedCell(null)} className="mb-4 bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        <h1 className="text-2xl font-bold mb-4">{selectedCell.researchCell.title}</h1>
        <div className="space-y-4">
          {selectedCell.proposals.map((proposal) => (
            <div key={proposal._id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{proposal.title}</h2>
              <p className="text-gray-700 mb-4">{proposal.abstract}</p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Submitted by:</span> {proposal.createdBy.name} - {proposal.createdBy.studentId}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold">Research Cell:</span> {selectedCell.researchCell.title}
              </p>
              <div className="mt-3">
                <p className="font-semibold text-gray-700">Group Members:</p>
                <ul className="list-disc list-inside ml-4">
                  {proposal.members.map((member) => (
                    <li key={member._id} className="text-sm text-gray-600">
                      {member.name} - {member.studentId} (CGPA: {member.currentCGPA})
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                  onClick={() => handleForward(proposal._id)}
                >
                  Forward to Supervisor
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
                  onClick={() => handleReject(proposal._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Proposals by Research Cell</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposalsByCell && proposalsByCell.map((cell) => (
          <div
            key={cell.researchCell._id}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
            onClick={() => handleCellClick(cell)}
          >
            <h2 className="text-xl font-semibold">{cell.researchCell.title}</h2>
            <p className="text-gray-600">{cell.count} pending proposals</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitteePendingProposals;
