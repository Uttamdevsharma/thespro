import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const SelectTeamMembers = () => {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const proposalData = location.state || {};

  const [allStudents, setAllStudents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState(proposalData?.members || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5005/api/users/students', config);
        setAllStudents(data);
      } catch (error) {
        toast.error('Failed to fetch students.');
        console.error(error);
      }
    };

    if (user && user.token) {
      fetchStudents();
    }
  }, [user]);

  const handleSelectMember = (member) => {
    if (selectedMembers.find(m => m._id === member._id)) {
      setSelectedMembers(selectedMembers.filter(m => m._id !== member._id));
    } else if (selectedMembers.length < 2) {
      setSelectedMembers([...selectedMembers, member]);
    } else {
      toast.error('You can select a maximum of 2 members.');
    }
  };

  const handleAddMembers = () => {
    navigate('/student/proposal', {
      state: {
        ...proposalData,
        members: selectedMembers,
      },
    });
  };

  const handleBack = () => {
    navigate('/student/proposal', {
      state: { ...proposalData },
    });
  };

  const filteredStudents = allStudents.filter(student =>
    student._id !== user.id && (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Select Team Members</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>
      <div className="space-y-2">
        {filteredStudents.map(student => (
          <div
            key={student._id}
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              selectedMembers.find(m => m._id === student._id)
                ? 'bg-green-100'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => handleSelectMember(student)}
          >
            <div>
              <p className="font-semibold text-gray-800">{student.name}</p>
              <p className="text-sm text-gray-600">{student.email} ({student.studentId})</p>
            </div>
            <input
              type="checkbox"
              checked={selectedMembers.some(m => m._id === student._id)}
              onChange={() => handleSelectMember(student)}
              className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={handleAddMembers}
          className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg shadow-md hover:from-green-500 hover:to-green-700"
        >
          Add Members
        </button>
      </div>
    </div>
  );
};

export default SelectTeamMembers;
