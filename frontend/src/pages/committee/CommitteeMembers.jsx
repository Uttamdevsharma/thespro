import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';

const CommitteeMembers = () => {
  const [members, setMembers] = useState([]);
  const user = useSelector(selectUser);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || !user.token) return;
      try {
        const { data } = await axios.get('http://localhost:5000/api/users/committee-members', config);
        const membersList = data.map((member) => ({
          id: member._id,
          ...member,
        }));
        setMembers(membersList);
      } catch (error) {
        console.error('Failed to fetch committee members:', error);
      }
    };

    fetchMembers();
  }, [user]);

  return (
    
    <div>
      <h1 className="text-2xl font-bold mb-4">Committee Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">{member.name}</p>
            <p className="text-sm text-gray-400">{member.email}</p>

          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitteeMembers;