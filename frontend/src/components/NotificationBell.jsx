import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useGetNoticesQuery, useMarkNoticeAsReadMutation } from '../features/apiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import NoticeDetailModal from './NoticeDetailModal';

import { useSocket } from '../contexts/SocketContext';

const NotificationBell = () => {
  const { user: userInfo } = useSelector((state) => state.user);
  const { data: notices, isLoading, refetch } = useGetNoticesQuery(userInfo?._id, {
    skip: !userInfo,
  });
  const [markNoticeAsRead] = useMarkNoticeAsReadMutation();
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('newNotice', (data) => {
        if (data.recipientId === userInfo?._id) {
          refetch();
          toast.info(`New notice: ${data.notice.title}`);
        }
      });

      return () => {
        socket.off('newNotice');
      };
    }
  }, [socket, userInfo, refetch]);

  useEffect(() => {
    if (notices && userInfo) {
      const count = notices.filter(notice => !notice.readBy.includes(userInfo._id)).length;
      setUnreadCount(count);
    }
  }, [notices, userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNoticeClick = async (notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
    setShowDropdown(false);

    if (!notice.readBy.includes(userInfo._id)) {
      try {
        await markNoticeAsRead(notice._id).unwrap();
        refetch(); // Refetch notices to update unread count
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none">
        <FaBell className="text-xl text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="py-1">
            {isLoading ? (
              <p className="text-gray-700 px-4 py-2">Loading notifications...</p>
            ) : notices && notices.length > 0 ? (
              notices.map((notice) => (
                <div
                  key={notice._id}
                  onClick={() => handleNoticeClick(notice)}
                  className={`block px-4 py-2 text-sm cursor-pointer ${notice.readBy.includes(userInfo._id) ? 'text-gray-500' : 'font-semibold text-gray-900'} hover:bg-gray-100`}
                >
                  {notice.title}
                </div>
              ))
            ) : (
              <p className="text-gray-700 px-4 py-2">No new notices.</p>
            )}
          </div>
        </div>
      )}

      {selectedNotice && (
        <NoticeDetailModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          notice={selectedNotice}
        />
      )}
    </div>
  );
};

export default NotificationBell;