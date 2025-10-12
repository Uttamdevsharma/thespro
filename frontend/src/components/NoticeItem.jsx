
import React, { useState } from 'react';
import { FaRegBell } from 'react-icons/fa';

const NoticeItem = ({ notice }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-3">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <FaRegBell className="text-gray-500 mr-3" />
          <h4 className="font-semibold text-gray-800">{notice.title}</h4>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(notice.createdAt).toLocaleDateString()}
        </span>
      </div>
      {isOpen && (
        <div className="mt-2 pl-8 text-gray-600">
          <p>{notice.description}</p>
        </div>
      )}
    </div>
  );
};

export default NoticeItem;
