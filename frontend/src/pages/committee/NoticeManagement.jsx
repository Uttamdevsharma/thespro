import React, { useState } from 'react';
import {
  useCreateCommitteeNoticeMutation,
  useGetCommitteeSentNoticesQuery,
  useDeleteNoticeMutation,
} from '../../features/apiSlice';
import { toast } from 'react-toastify';

const NoticeManagement = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sendTo, setSendTo] = useState('all');

  const [createCommitteeNotice] = useCreateCommitteeNoticeMutation();
  const { data: notices, isLoading, refetch } = useGetCommitteeSentNoticesQuery();
  const [deleteNotice] = useDeleteNoticeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCommitteeNotice({ title, description, sendTo }).unwrap();
      toast.success('✅ Notice created successfully!');
      setTitle('');
      setDescription('');
      setSendTo('all');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await deleteNotice(id).unwrap();
        toast.success('🗑️ Notice deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-10 px-4 flex flex-col items-center">
      {/* Create Notice Section */}
      <div className="bg-white w-full max-w-3xl shadow-lg rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          📝 Create New Notice
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
              Notice Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
              Notice Description
            </label>
            <textarea
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the notice details..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="sendTo" className="block text-gray-700 font-semibold mb-2">
              Send Notice To
            </label>
            <select
              id="sendTo"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all"
            >
              <option value="all">All (Students & Supervisors)</option>
              <option value="supervisor">Supervisors Only</option>
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow-md transition-all transform hover:scale-105"
            >
              Create Notice
            </button>
          </div>
        </form>
      </div>

      {/* Existing Notices Section */}
      <div className="bg-white w-full max-w-3xl shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📄 Existing Notices</h2>

        {isLoading ? (
          <p className="text-center text-gray-600">Loading notices...</p>
        ) : notices && notices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notices.map((notice) => (
              <li
                key={notice._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="mb-3 sm:mb-0">
                  <h3 className="text-lg font-semibold text-indigo-700">{notice.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Sent to <span className="font-medium">{notice.recipients.length}</span> users
                  </p>
                  <p className="text-gray-500 text-xs">
                    By {notice.sender?.name || 'Unknown'} on{' '}
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(notice._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-lg shadow-sm transition-all transform hover:scale-105 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">No notices found.</p>
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;
