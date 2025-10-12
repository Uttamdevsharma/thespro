import React, { useState } from 'react';
import { useCreateNoticeMutation, useGetNoticesQuery, useDeleteNoticeMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const NoticeManagement = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [noticeFile, setNoticeFile] = useState(null);
  const [sendTo, setSendTo] = useState('all');

  const [createNotice] = useCreateNoticeMutation();
  const { data: notices, isLoading, refetch } = useGetNoticesQuery();
  const [deleteNotice] = useDeleteNoticeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('sendTo', sendTo);
    if (noticeFile) {
      formData.append('noticeFile', noticeFile);
    }

    try {
      await createNotice(formData).unwrap();
      toast.success('Notice created successfully!');
      setTitle('');
      setDescription('');
      setNoticeFile(null);
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
        toast.success('Notice deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Notices</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Notice</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              rows="5"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="noticeFile" className="block text-gray-700 text-sm font-bold mb-2">Attachment (Optional)</label>
            <input
              type="file"
              id="noticeFile"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              onChange={(e) => setNoticeFile(e.target.files[0])}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sendTo" className="block text-gray-700 text-sm font-bold mb-2">Send To</label>
            <select
              id="sendTo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
            >
              <option value="all">Both Students and Supervisors</option>
              <option value="students">Students Only</option>
              <option value="supervisors">Supervisors Only</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Notice
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Notices</h2>
        {isLoading ? (
          <p>Loading notices...</p>
        ) : notices && notices.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notices.map((notice) => (
              <li key={notice._id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{notice.title}</h3>
                  <p className="text-gray-600 text-sm">Sent to: {notice.sendTo}</p>
                  <p className="text-gray-600 text-sm">Created by: {notice.sender?.name || 'Unknown'} on {new Date(notice.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDelete(notice._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notices found.</p>
        )}
      </div>
    </div>
  );
};

export default NoticeManagement;