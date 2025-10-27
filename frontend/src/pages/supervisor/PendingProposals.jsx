import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';
import { useUpdateProposalStatusMutation, useGetSupervisorPendingProposalsQuery } from '../../features/apiSlice';

const PendingProposals = () => {
  const user = useSelector(selectUser);
  const { data: proposals, isLoading } = useGetSupervisorPendingProposalsQuery();
  const [expandedProposalId, setExpandedProposalId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInputFor, setShowFeedbackInputFor] = useState(null);
  const [showAcceptanceModalFor, setShowAcceptanceModalFor] = useState(null);
  const [acceptanceOption, setAcceptanceOption] = useState('supervisor_only');

  const [updateProposalStatus, { isLoading: isUpdating }] = useUpdateProposalStatusMutation();

  const handleStatusChange = async (proposalId, newStatus, acceptanceOption) => {
    try {
      await updateProposalStatus({ id: proposalId, status: newStatus, feedback, acceptanceOption }).unwrap();
      if (newStatus === 'Approved') {
        toast.success('Proposal approved successfully and group assigned correctly.');
      } else {
        toast.success(`Proposal ${newStatus} successfully!`);
      }
      setExpandedProposalId(null);
      setFeedback('');
      setShowFeedbackInputFor(null);
      setShowAcceptanceModalFor(null);
    } catch (error) {
      console.error(`Error updating proposal status to ${newStatus}: `, error);
      toast.error(`Failed to update proposal status: ${error.data?.message || error.message}`);
    }
  };

  const handleApproveClick = (proposalId) => {
    setShowAcceptanceModalFor(proposalId);
  };

  const handleAcceptance = () => {
    handleStatusChange(showAcceptanceModalFor, 'Approved', acceptanceOption);
  };

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading pending proposals...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Pending Proposals</h1>
      {!proposals || proposals.length === 0 ? (
        <p>No pending proposals found.</p>
      ) : (
        <div className="space-y-4">
          {proposals && proposals.map((proposal) => (
            <div key={proposal._id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="cursor-pointer hover:bg-gray-50 transition-colors p-2" onClick={() => setExpandedProposalId(expandedProposalId === proposal._id ? null : proposal._id)}>
                <h2 className="text-xl font-semibold text-gray-800">{proposal.title || 'Project title here'}</h2>
                <p className="text-gray-600 text-sm">Research Cell: {proposal.researchCellId.title || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Submitted By: {proposal.createdBy.name || 'N/A'}</p>
              </div>

              {expandedProposalId === proposal._id && (
                <div className="mt-4 p-2 border-t border-gray-200">
                  <p className="text-gray-700 mb-2"><strong>Submitted By:</strong> {proposal.createdBy.name || 'N/A'} - {proposal.createdBy.studentId}</p>
                  <p className="text-gray-700 mb-2"><strong>Research Cell:</strong> {proposal.researchCellId.title || 'N/A'}</p>
                  <p className="text-gray-700 mb-4">
                    <strong>Group Members:</strong>
                    {proposal.members.map((member, index) => (
                      <span key={member._id} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 mr-1">
                        {member.name || 'Unknown'} - {member.studentId} (CGPA: {member.currentCGPA})
                      </span>
                    ))}
                  </p>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleApproveClick(proposal._id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowFeedbackInputFor(proposal._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Deny
                    </button>
                  </div>

                  {showFeedbackInputFor === proposal._id && (
                    <div className="mt-4">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="3"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Provide feedback for denial..."
                      ></textarea>
                      <button
                        onClick={() => handleStatusChange(proposal._id, 'Not Approved')}
                        disabled={!feedback}
                        className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm disabled:bg-gray-400"
                      >
                        Confirm Deny
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAcceptanceModalFor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Acceptance Options</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="radio"
                  id="supervisor_only"
                  name="acceptanceOption"
                  value="supervisor_only"
                  checked={acceptanceOption === 'supervisor_only'}
                  onChange={() => setAcceptanceOption('supervisor_only')}
                  disabled={user.currentGroupCount >= 5}
                />
                <label htmlFor="supervisor_only" className="ml-2">Keep the group under my supervision only</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="supervisor_and_course_supervisor"
                  name="acceptanceOption"
                  value="supervisor_and_course_supervisor"
                  checked={acceptanceOption === 'supervisor_and_course_supervisor' || user.currentGroupCount >= 5}
                  onChange={() => setAcceptanceOption('supervisor_and_course_supervisor')}
                />
                <label htmlFor="supervisor_and_course_supervisor" className="ml-2">Keep the group under my supervision + my assigned course supervisor</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleAcceptance}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowAcceptanceModalFor(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProposals;