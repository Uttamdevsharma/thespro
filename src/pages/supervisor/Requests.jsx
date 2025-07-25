import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const Requests = () => {
  const user = useSelector(selectUser);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentNames, setStudentNames] = useState({});
  const [cellNames, setCellNames] = useState({});
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchProposals = async () => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    try {
      // Fetch all users (students) to map UIDs to names
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const namesMap = {};
      usersSnapshot.forEach(doc => {
        namesMap[doc.id] = doc.data().name;
      });
      setStudentNames(namesMap);

      // Fetch all research cells to map IDs to titles
      const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
      const cellMap = {};
      cellsSnapshot.forEach(doc => {
        cellMap[doc.id] = doc.data().title;
      });
      setCellNames(cellMap);

      // Query proposals assigned to the current supervisor with 'Pending' status
      const q = query(
        collection(db, 'proposals'),
        where('supervisorId', '==', user.uid),
        where('status', '==', 'Pending')
      );
      const querySnapshot = await getDocs(q);
      const fetchedProposals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(fetchedProposals);
    } catch (error) {
      console.error("Error fetching pending proposals: ", error);
      toast.error('Failed to fetch pending proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedProposal) return;

    const db = getFirestore();
    const proposalRef = doc(db, 'proposals', selectedProposal.id);
    try {
      await updateDoc(proposalRef, {
        status: newStatus,
        feedback: feedback,
        reviewedAt: serverTimestamp(), // Use serverTimestamp for approval/denial time
      });
      toast.success(`Proposal ${newStatus} successfully!`);
      setSelectedProposal(null); // Close modal
      setFeedback(''); // Clear feedback
      fetchProposals(); // Re-fetch proposals to update the list
    } catch (error) {
      console.error(`Error updating proposal status to ${newStatus}: `, error);
      toast.error(`Failed to update proposal status: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading pending proposals...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Pending Proposals</h1>
      {proposals.length === 0 ? (
        <p>No pending proposals found.</p>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedProposal(proposal)}>
              <h2 className="text-xl font-semibold text-gray-800">{proposal.title}</h2>
              <p className="text-gray-600 text-sm mb-2">Research Cell: {cellNames[proposal.researchCellId] || 'N/A'}</p>
              <p className="text-gray-600 text-sm mb-2">Submitted By: {studentNames[proposal.createdBy] || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      {selectedProposal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Proposal Details: {selectedProposal.title}</h2>
            <p className="text-gray-700 mb-4"><strong>Abstract:</strong> {selectedProposal.abstract}</p>
            <p className="text-gray-700 mb-2"><strong>Submitted By:</strong> {studentNames[selectedProposal.createdBy] || 'N/A'}</p>
            <p className="text-gray-700 mb-2"><strong>Research Cell:</strong> {cellNames[selectedProposal.researchCellId] || 'N/A'}</p>
            <p className="text-gray-700 mb-4">
              <strong>Group Members:</strong> 
              {selectedProposal.members.map((memberId, index) => (
                <span key={memberId} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 mr-1">
                  {studentNames[memberId] || 'Unknown'}{index < selectedProposal.members.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>

            <div className="mt-4">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Feedback</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => handleStatusChange('Approved')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange('Denied')}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Deny
              </button>
              <button
                onClick={() => setSelectedProposal(null)}
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

export default Requests;