import React, { useState } from 'react';
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
    return <div className="p-6 bg-white rounded-lg shadow-md text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center py-10">
      <div className="bg-white w-full max-w-2xl shadow-lg rounded-2xl p-8 transition-all duration-300">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">
          📢 Send Notice to Student Group
        </h1>

        <form onSubmit={handleSubmitNotice} className="space-y-5">
          <div>
            <label htmlFor="selectGroup" className="block text-gray-700 font-medium mb-2">
              Select Group
            </label>
            <select
              id="selectGroup"
              value={selectedProposalId}
              onChange={(e) => setSelectedProposalId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
              required
            >
              <option value="">-- Select a Proposal or Group --</option>
              <option value="all">All Groups</option>
              {proposals?.map((proposal) => (
                <option key={proposal._id} value={proposal._id}>
                  {proposal.title} ({proposal.members.length} Members)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="noticeTitle" className="block text-gray-700 font-medium mb-2">
              Notice Title
            </label>
            <input
              type="text"
              id="noticeTitle"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="Enter notice title..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="noticeDescription" className="block text-gray-700 font-medium mb-2">
              Notice Description
            </label>
            <textarea
              id="noticeDescription"
              value={noticeDescription}
              onChange={(e) => setNoticeDescription(e.target.value)}
              rows="5"
              placeholder="Write your notice message here..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
              required
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
              Send Notice
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white w-full max-w-2xl mt-10 shadow-md rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📄 Sent Notices</h2>
        {sentNotices && sentNotices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {sentNotices.map((notice) => (
              <li key={notice._id} className="py-4">
                <h3 className="text-lg font-semibold text-indigo-700">{notice.title}</h3>
                <p className="text-gray-600 text-sm">{notice.description}</p>
                <p className="text-gray-500 text-xs mt-1">
                  Sent to {notice.recipients.length} users on{' '}
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No notices sent yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notice;
