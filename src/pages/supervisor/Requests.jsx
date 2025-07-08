import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Requests = () => {
  const user = useSelector(selectUser);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [denyMessage, setDenyMessage] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;
      const db = getFirestore();
      const q = query(collection(db, 'proposals'), where('supervisor', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const proposalsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProposals(proposalsList);
    };

    fetchProposals();
  }, [user]);

  const handleApprove = async () => {
    if (!selectedProposal) return;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, 'proposals', selectedProposal.id), {
        status: 'Approved',
      });
      setProposals(
        proposals.map((p) =>
          p.id === selectedProposal.id ? { ...p, status: 'Approved' } : p
        )
      );
      setSelectedProposal(null);
    } catch (error) {
      console.error("Error approving proposal: ", error);
    }
  };

  const handleDeny = async () => {
    if (!selectedProposal) return;
    const db = getFirestore();
    try {
      await updateDoc(doc(db, 'proposals', selectedProposal.id), {
        status: 'Denied',
        denyMessage,
      });
      setProposals(
        proposals.map((p) =>
          p.id === selectedProposal.id ? { ...p, status: 'Denied' } : p
        )
      );
      setSelectedProposal(null);
      setDenyMessage('');
    } catch (error) {
      console.error("Error denying proposal: ", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Group Proposals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} onClick={() => setSelectedProposal(proposal)} className="bg-white p-4 rounded-lg shadow cursor-pointer">
            <p className="text-lg font-semibold">{proposal.title}</p>
            <p className="text-sm text-gray-500">Type: {proposal.type}</p>
            <p className={`text-sm font-bold ${proposal.status === 'Pending' ? 'text-yellow-500' : proposal.status === 'Approved' ? 'text-green-500' : 'text-red-500'}`}>
              Status: {proposal.status}
            </p>
          </div>
        ))}
      </div>

      {selectedProposal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">{selectedProposal.title}</h2>
            <p className="mb-2"><strong>Research Cell:</strong> {selectedProposal.researchCell}</p>
            <p className="mb-4"><strong>Group Members:</strong> {selectedProposal.members.join(', ')}</p>
            {selectedProposal.status === 'Pending' && (
              <div className="flex justify-end">
                <button onClick={() => setSelectedProposal(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                  Cancel
                </button>
                <button onClick={handleApprove} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
                  Approve
                </button>
                <button onClick={() => setDenyMessage(' ')} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Deny
                </button>
              </div>
            )}
            {denyMessage && (
              <div className="mt-4">
                <textarea
                  value={denyMessage}
                  onChange={(e) => setDenyMessage(e.target.value)}
                  placeholder="Reason for denial"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
                <button onClick={handleDeny} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2">
                  Send Denial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;