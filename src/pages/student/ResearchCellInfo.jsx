import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const ResearchCellInfo = () => {
  const user = useSelector(selectUser);
  const [assignedCell, setAssignedCell] = useState(null);
  const [assignedSupervisor, setAssignedSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      const db = getFirestore();
      try {
        // Fetch current user's data to get assigned research cell and supervisor
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Fetch Research Cell Info
          if (userData.assignedResearchCellId) { // Assuming assignedResearchCellId is the field name
            const cellDocRef = doc(db, 'researchCells', userData.assignedResearchCellId);
            const cellDocSnap = await getDoc(cellDocRef);
            if (cellDocSnap.exists()) {
              setAssignedCell(cellDocSnap.data());
            } else {
              console.log("Research cell document not found for ID:", userData.assignedResearchCellId);
            }
          }

          // Fetch Supervisor Info
          if (userData.assignedSupervisorId) { // Assuming assignedSupervisorId is the field name
            const supervisorDocRef = doc(db, 'users', userData.assignedSupervisorId);
            const supervisorDocSnap = await getDoc(supervisorDocRef);
            if (supervisorDocSnap.exists()) {
              setAssignedSupervisor(supervisorDocSnap.data());
            } else {
              console.log("Supervisor document not found for ID:", userData.assignedSupervisorId);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching research cell info: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading information...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Research Cell Information</h1>
      
      {assignedCell ? (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Assigned Research Cell:</h2>
          <p className="text-lg text-gray-700">{assignedCell.title}</p>
          <p className="text-gray-600">{assignedCell.description}</p>
        </div>
      ) : (
        <p className="mb-4">No research cell assigned yet.</p>
      )}

      {assignedSupervisor ? (
        <div>
          <h2 className="text-xl font-semibold">Assigned Supervisor:</h2>
          <p className="text-lg text-gray-700">{assignedSupervisor.name}</p>
          <p className="text-gray-600">{assignedSupervisor.email}</p>
        </div>
      ) : (
        <p>No supervisor assigned yet.</p>
      )}

      {!assignedCell && !assignedSupervisor && (
        <p>No research cell or supervisor information available.</p>
      )}
    </div>
  );
};

export default ResearchCellInfo;