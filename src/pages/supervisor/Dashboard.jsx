import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [proposals, setProposals] = useState([]);
  const [researchCells, setResearchCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentNames, setStudentNames] = useState({});
  const [cellDetails, setCellDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', items: [] });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      const db = getFirestore();
      try {
        // Fetch all users to map UIDs to names
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const namesMap = {};
        usersSnapshot.forEach(d => {
          namesMap[d.id] = d.data().name;
        });
        setStudentNames(namesMap);

        // Fetch all research cells to map IDs to titles and descriptions
        const cellsSnapshot = await getDocs(collection(db, 'researchCells'));
        const detailsMap = {};
        cellsSnapshot.forEach(d => {
          detailsMap[d.id] = d.data();
        });
        setCellDetails(detailsMap);

        // Fetch proposals assigned to the current supervisor
        const proposalsQuery = query(
          collection(db, 'proposals'),
          where('supervisorId', '==', user.uid)
        );
        const proposalsSnapshot = await getDocs(proposalsQuery);
        setProposals(proposalsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch supervisor's own research cell assignments
        const supervisorDocSnap = await getDoc(doc(db, 'users', user.uid));
        if (supervisorDocSnap.exists()) {
          const supervisorData = supervisorDocSnap.data();
          let assignedCells = supervisorData.researchCells || [];
          if (supervisorData.researchCell && !Array.isArray(assignedCells)) { // Handle old singular field
            assignedCells = [supervisorData.researchCell];
          }
          setResearchCells(assignedCells);
        }

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const thesisGroups = proposals.filter(p => p.type === 'Thesis').length;
  const projectGroups = proposals.filter(p => p.type === 'Project').length;
  const totalGroups = proposals.length;

  const handleCardClick = (type) => {
    let items = [];
    let title = '';

    if (type === 'thesis') {
      title = 'Thesis Groups';
      items = proposals.filter(p => p.type === 'Thesis').map(p => ({
        title: p.title,
        members: p.members.map(m => studentNames[m] || 'Unknown').join(', '),
      }));
    } else if (type === 'project') {
      title = 'Project Groups';
      items = proposals.filter(p => p.type === 'Project').map(p => ({
        title: p.title,
        members: p.members.map(m => studentNames[m] || 'Unknown').join(', '),
      }));
    } else if (type === 'total') {
      title = 'All Groups';
      items = proposals.map(p => ({
        title: p.title,
        type: p.type,
        members: p.members.map(m => studentNames[m] || 'Unknown').join(', '),
      }));
    } else if (type === 'researchCells') {
      title = 'Assigned Research Cells';
      items = researchCells.map(cellId => ({
        title: cellDetails[cellId]?.title || 'Unknown Cell',
        description: cellDetails[cellId]?.description || 'No description',
      }));
    }

    setModalContent({ title, items });
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg shadow cursor-pointer hover:bg-blue-200 transition-colors" onClick={() => handleCardClick('thesis')}>
          <p className="text-lg font-semibold text-blue-800">Thesis Groups</p>
          <p className="text-3xl font-bold text-blue-900">{thesisGroups}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow cursor-pointer hover:bg-green-200 transition-colors" onClick={() => handleCardClick('project')}>
          <p className="text-lg font-semibold text-green-800">Project Groups</p>
          <p className="text-3xl font-bold text-green-900">{projectGroups}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow cursor-pointer hover:bg-purple-200 transition-colors" onClick={() => handleCardClick('total')}>
          <p className="text-lg font-semibold text-purple-800">Total Groups</p>
          <p className="text-3xl font-bold text-purple-900">{totalGroups}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow cursor-pointer hover:bg-yellow-200 transition-colors" onClick={() => handleCardClick('researchCells')}>
          <p className="text-lg font-semibold text-yellow-800">Research Cells</p>
          <p className="text-3xl font-bold text-yellow-900">{researchCells.length}</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{modalContent.title}</h2>
            {modalContent.items.length === 0 ? (
              <p>No items to display.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {modalContent.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 p-3 rounded-md">
                    <p className="font-semibold">{item.title}</p>
                    {item.type && <p className="text-sm text-gray-600">Type: {item.type}</p>}
                    {item.members && <p className="text-sm text-gray-600">Members: {item.members}</p>}
                    {item.description && <p className="text-sm text-gray-600">Description: {item.description}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
