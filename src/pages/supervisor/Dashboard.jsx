import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState({ thesisGroups: 0, projectGroups: 0, totalGroups: 0, researchCells: '' });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const db = getFirestore();

      // Example Firestore queries, adjust collection names/fields as needed
      const thesisQuery = query(
        collection(db, 'groups'),
        where('supervisorId', '==', user.uid),
        where('type', '==', 'thesis')
      );
      const projectQuery = query(
        collection(db, 'groups'),
        where('supervisorId', '==', user.uid),
        where('type', '==', 'project')
      );

      const [thesisSnap, projectSnap] = await Promise.all([
        getDocs(thesisQuery),
        getDocs(projectQuery)
      ]);

      const thesisGroups = thesisSnap.size;
      const projectGroups = projectSnap.size;
      const totalGroups = thesisGroups + projectGroups;

      // Example: assuming user.researchCells is an array of strings
      const researchCells = Array.isArray(user.researchCells)
        ? user.researchCells.join(', ')
        : user.researchCells || '';

      setStats({ thesisGroups, projectGroups, totalGroups, researchCells });
    };

    fetchStats();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Supervisor Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">Thesis Groups</p>
          <p className="text-3xl">{stats.thesisGroups}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">Project Groups</p>
          <p className="text-3xl">{stats.projectGroups}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">Total Groups</p>
          <p className="text-3xl">{stats.totalGroups}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-lg font-semibold">Research Cells</p>
          <p className="text-xl">{stats.researchCells}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;