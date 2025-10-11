import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const Notice = () => {
  const user = useSelector(selectUser);
  const [proposals, setProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDescription, setNoticeDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all proposals where the current user is the supervisor
        const { data } = await axios.get('http://localhost:5000/api/proposals/supervisor-proposals', config);
        const fetchedProposals = data.map(p => ({ id: p._id, ...p }));
        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals for notice: ", error);
        toast.error('Failed to fetch proposals.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user]);

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      toast.error('User not logged in.');
      return;
    }
    if (!selectedProposalId || !noticeTitle || !noticeDescription) {
      toast.error('Please fill all fields.');
      return;
    }

    try {
      const selectedProposal = proposals.find(p => p.id === selectedProposalId);
      if (!selectedProposal) {
        toast.error('Selected proposal not found.');
        return;
      }

      const noticeData = {
        proposalId: selectedProposalId,
        groupMembers: selectedProposal.members,
        supervisorId: user._id, // Use user._id from Redux store
        title: noticeTitle,
        description: noticeDescription,
      };

      await axios.post('http://localhost:5000/api/notices', noticeData, config);

      toast.success('Notice Sent Successfully!');
      setSelectedProposalId('');
      setNoticeTitle('');
      setNoticeDescription('');
    } catch (error) {
      console.error("Error sending notice: ", error);
      toast.error(`Failed to send notice: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Send Notice to Group</h1>
      <form onSubmit={handleSubmitNotice} className="space-y-4">
        <div>
          <label htmlFor="selectGroup" className="block text-sm font-medium text-gray-700">Select Group</label>
          <select
            id="selectGroup"
            value={selectedProposalId}
            onChange={(e) => setSelectedProposalId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a proposal/group</option>
            {proposals.map((proposal) => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.title} (Members: {proposal.members.length})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="noticeTitle" className="block text-sm font-medium text-gray-700">Notice Title</label>
          <input
            type="text"
            id="noticeTitle"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="noticeDescription" className="block text-sm font-medium text-gray-700">Notice Description</label>
          <textarea
            id="noticeDescription"
            value={noticeDescription}
            onChange={(e) => setNoticeDescription(e.target.value)}
            rows="5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send Notice
        </button>
      </form>
    </div>
  );
};

export default Notice;
