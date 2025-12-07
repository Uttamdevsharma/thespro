import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetMySupervisionsQuery, useGetEvaluationsByProposalQuery, useSubmitOrUpdateEvaluationMutation } from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { useLocation } from 'react-router-dom';

const MySupervisions = () => {
  const user = useSelector(selectUser);
  const location = useLocation(); // Get current location object
  const { data: proposals, isLoading, isError, error, refetch: refetchProposals } = useGetMySupervisionsQuery();
  const [filter, setFilter] = useState('all');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const { data: existingEvaluations, refetch } = useGetEvaluationsByProposalQuery(selectedProposal?._id, {
    skip: !selectedProposal,
  });

  // This useEffect will run when the component mounts or when the location changes,
  // ensuring data is refetched and state is reset.
  useEffect(() => {
    refetchProposals(); // Force a refetch of the proposals
    setSelectedProposal(null); // Reset selected proposal
    setFilter('all'); // Reset filter
  }, [location.pathname, refetchProposals]);

  useEffect(() => {
    if (selectedProposal) {
      refetch();
    }
  }, [selectedProposal, refetch]);

  const filteredProposals = proposals?.filter(p => {
    if (filter === 'all') return p.supervisorId === user._id; // Show all groups where the supervisor is the primary supervisor
    if (filter === 'primary') return p.supervisorId === user._id; // Show only groups where the supervisor is the primary supervisor
    if (filter === 'co') return p.supervisorId === user._id && p.coSupervisors && p.coSupervisors.length > 0; // Show groups where supervisor is primary AND a co-supervisor is assigned
    return true;
  });

  const handleSelectProposal = (proposal) => {
    setSelectedProposal(proposal);
  };

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Supervisions</h1>
      
      <div className="mb-4">
        <span className="mr-4">Filter by:</span>
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter('primary')} className={`px-3 py-1 rounded mx-2 ${filter === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Primary Supervision</button>
        <button onClick={() => setFilter('co')} className={`px-3 py-1 rounded ${filter === 'co' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Co-Supervision</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-2">My Groups</h2>
          <div className="space-y-2">
            {filteredProposals && filteredProposals.length > 0 ? (
              filteredProposals.map(proposal => (
                <div key={proposal._id} onClick={() => handleSelectProposal(proposal)}
                  className={`p-3 rounded cursor-pointer ${selectedProposal?._id === proposal._id ? 'bg-blue-200 shadow-md' : 'bg-white shadow'}`}>
                  <p className="font-bold">{proposal.title}</p>
                  <p className="text-sm text-gray-600">{proposal.members.length} members</p>
                </div>
              ))
            ) : (
              <p>No groups found for the selected filter.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedProposal ? (
            <StudentEvaluationPanel 
              proposal={selectedProposal} 
              existingEvaluations={existingEvaluations}
              supervisorId={user._id}
            />
          ) : (
            <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center h-full">
              <p className="text-gray-500">Select a group to view students and manage evaluations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentEvaluationPanel = ({ proposal, existingEvaluations, supervisorId }) => {
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const [defenseType, setDefenseType] = useState('pre-defense');
    const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitOrUpdateEvaluationMutation();
  
    useEffect(() => {
        const initialMarks = {};
        const initialComments = {};
        if (existingEvaluations) {
            existingEvaluations.forEach(evalGroup => {
                evalGroup.evaluations.forEach(evaluation => {
                    if (evaluation.evaluator._id === supervisorId && evaluation.defenseType === defenseType) {
                        initialMarks[evalGroup.student._id] = evaluation.marks;
                        initialComments[evalGroup.student._id] = evaluation.comments || '';
                    }
                });
            });
        }
        setMarks(initialMarks);
        setComments(initialComments);
    }, [existingEvaluations, defenseType, supervisorId]);


    const handleMarkChange = (studentId, value) => {
      setMarks(prev => ({ ...prev, [studentId]: value }));
    };
  
    const handleCommentChange = (studentId, value) => {
      setComments(prev => ({ ...prev, [studentId]: value }));
    };
  
    const handleSubmit = async (studentId) => {
      const mark = marks[studentId];
      const maxMark = defenseType === 'pre-defense' ? 20 : 40;
      if (mark === undefined || mark < 0 || mark > maxMark) {
        alert(`Marks must be between 0 and ${maxMark}.`);
        return;
      }
  
      try {
        await submitEvaluation({
          studentId,
          proposalId: proposal._id,
          defenseType,
          evaluationType: 'supervisor',
          marks: mark,
          comments: comments[studentId] || '',
        }).unwrap();
        alert('Evaluation submitted successfully!');
      } catch (err) {
        alert(`Failed to submit evaluation: ${err.data?.message || 'Server error'}`);
      }
    };
  
    const maxMark = defenseType === 'pre-defense' ? 20 : 40;

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Students in "{proposal.title}"</h2>
        <div className="mb-4">
          <span className="mr-4">Evaluation Type:</span>
          <select value={defenseType} onChange={(e) => setDefenseType(e.target.value)} className="p-2 border rounded">
            <option value="pre-defense">Pre-Defense</option>
            <option value="final-defense">Final Defense</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {proposal.members.map(student => (
            <div key={student._id} className="p-3 border rounded-md">
              <p className="font-bold">{student.name} ({student.email})</p>
              <div className="mt-2 flex items-center gap-4">
                <label>Marks (out of {maxMark}):</label>
                <input
                  type="number"
                  value={marks[student._id] || ''}
                  onChange={(e) => handleMarkChange(student._id, e.target.value)}
                  className="p-1 border rounded w-24"
                  max={maxMark}
                  min="0"
                />
              </div>
              <div className="mt-2 flex items-center gap-4">
                <label>Comment:</label>
                <input
                  type="text"
                  value={comments[student._id] || ''}
                  onChange={(e) => handleCommentChange(student._id, e.target.value)}
                  className="p-1 border rounded w-full"
                  placeholder="Optional feedback"
                />
              </div>
              <button
                onClick={() => handleSubmit(student._id)}
                className="mt-3 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Save Evaluation'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
};
  
export default MySupervisions;