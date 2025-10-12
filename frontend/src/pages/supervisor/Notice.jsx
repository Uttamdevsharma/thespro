import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';
import {
  useGetSupervisorSentNoticesQuery,
  useSendNoticeToGroupMutation,
  useGetProposalsBySupervisorQuery
} from '../../features/apiSlice';

const Notice = () => {
  const user = useSelector(selectUser);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDescription, setNoticeDescription] = useState('');

  const { data: proposals, isLoading: proposalsLoading } = useGetProposalsBySupervisorQuery(user?._id, { skip: !user });
  const { data: sentNotices, isLoading: noticesLoading, refetch } = useGetSupervisorSentNoticesQuery();
  const [sendNoticeToGroup] = useSendNoticeToGroupMutation();

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    if (!selectedProposalId || !noticeTitle || !noticeDescription) {
      toast.error('Please fill all fields.');
      return;
    }

    try {
      await sendNoticeToGroup({ groupId: selectedProposalId, title: noticeTitle, description: noticeDescription }).unwrap();
      toast.success('Notice Sent Successfully!');
      setSelectedProposalId('');
      setNoticeTitle('');
      setNoticeDescription('');
      refetch();
    } catch (error) {
      console.error("Error sending notice: ", error);
      toast.error(`Failed to send notice: ${error.response?.data?.message || error.message}`);
    }
  };

  if (proposalsLoading || noticesLoading) {
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
            <option value="all">All Groups</option>
            {proposals?.map((proposal) => (
              <option key={proposal._id} value={proposal._id}>
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Sent Notices</h2>
        {sentNotices && sentNotices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sentNotices.map((notice) => (
              <li key={notice._id} className="py-4">
                <h3 className="text-lg font-medium">{notice.title}</h3>
                <p className="text-gray-600 text-sm">Sent to: {notice.recipients.length} users</p>
                <p className="text-gray-600 text-sm">on {new Date(notice.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notices sent yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notice;