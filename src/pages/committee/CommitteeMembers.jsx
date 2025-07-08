import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const CommitteeMembers = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'committee'));
      const querySnapshot = await getDocs(q);
      const membersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersList);
    };

    fetchMembers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Committee Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">{member.name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitteeMembers;