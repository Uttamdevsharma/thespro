import React from 'react';

const NoticeDetailModal = ({ showModal, onClose, notice }) => {
  if (!showModal || !notice) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-8 border w-full max-w-lg md:max-w-xl lg:max-w-2xl shadow-lg rounded-md bg-white transform transition-all duration-300 ease-out scale-100 opacity-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h3>
        <div className="mt-2 text-gray-700 mb-4">
          <p className="whitespace-pre-wrap">{notice.description}</p>
        </div>
        {notice.file && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800">Attachment:</p>
            <a
              href={`http://localhost:5000${notice.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Download Attachment
            </a>
          </div>
        )}
        <div className="text-sm text-gray-500 mb-4">
          <p>Sent to: {notice.sendTo}</p>
          <p>Created by: {notice.sender?.name || 'Unknown'} on {new Date(notice.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;