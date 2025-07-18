import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const ProposalStatus = () => {
  const user = useSelector(selectUser);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentNames, setStudentNames] = useState({});
  const [cellNames, setCellNames] = useState({});
  const [supervisorNames, setSupervisorNames] = useState({});

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      const db = getFirestore();
      try {
        // Fetch all users (students and supervisors) to map UIDs to names
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const namesMap = {};
        usersSnapshot.forEach(doc => {
          namesMap[doc.id] = doc.data().name;
        });
        setStudentNames(namesMap);
        setSupervisorNames(namesMap);

        // Fetch all research cells to map IDs to titles
        const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
        const cellMap = {};
        cellsSnapshot.forEach(doc => {
          cellMap[doc.id] = doc.data().title;
        });
        setCellNames(cellMap);

        // Query proposals where the current user is either the creator or a member
        const allProposalsSnapshot = await getDocs(collection(db, 'proposals'));
        const fetchedProposals = allProposalsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(proposal => proposal.createdBy === user.uid || (proposal.members && proposal.members.includes(user.uid)));
        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user]);

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading proposals...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Proposal Status</h1>
      {proposals.length === 0 ? (
        <p>No proposals found. Submit a new proposal to get started!</p>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">{proposal.title}</h2>
              <p className="text-gray-600 text-sm mb-2">Type: {proposal.type}</p>
              <p className="text-gray-600 text-sm mb-2">Research Cell: {cellNames[proposal.researchCellId] || 'N/A'}</p>
              <p className="text-gray-600 text-sm mb-2">Supervisor: {supervisorNames[proposal.supervisorId] || 'N/A'}</p>
              <p className="text-gray-600 text-sm mb-2">
                Group Members: 
                {proposal.members.map((memberId, index) => (
                  <span key={memberId} className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs font-medium text-gray-700 mr-1">
                    {studentNames[memberId] || 'Unknown'}{index < proposal.members.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
              <p className={`text-lg font-bold ${proposal.status === 'Approved' ? 'text-green-600' : proposal.status === 'Denied' ? 'text-red-600' : 'text-yellow-600'}`}>
                Status: {proposal.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalStatus;