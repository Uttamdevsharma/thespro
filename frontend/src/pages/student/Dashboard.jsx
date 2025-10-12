import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import { useGetStudentProposalsQuery, useGetNoticesQuery } from '../../features/apiSlice';
import ProgressBar from '../../components/ProgressBar';
import NoticeItem from '../../components/NoticeItem';

const Dashboard = () => {
  const user = useSelector(selectUser);
  const { data: proposals, isLoading: proposalsLoading } = useGetStudentProposalsQuery(user?._id, { skip: !user });
  const { data: notices, isLoading: noticesLoading } = useGetNoticesQuery(user?._id, { skip: !user });

  const studentName = user?.name || user?.email || 'Student';

  const latestProposal = proposals?.[0];

  const committeeNotices = notices ? notices.filter(notice => notice.sender.role === 'committee') : [];
  const supervisorNotices = notices ? notices.filter(notice => notice.sender.role === 'supervisor') : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Hi {studentName}, welcome back to ThesPro!
        </h1>
        <p className="text-lg text-gray-500">
          Here is an overview of your current proposal and recent notices.
        </p>
      </div>

      {proposalsLoading ? (
        <p>Loading proposal status...</p>
      ) : latestProposal ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Proposal Status</h2>
          <ProgressBar status={latestProposal.status} />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg text-gray-500">
            You have not submitted any proposals yet. Let’s start your academic journey!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Committee Notices</h2>
          {noticesLoading ? (
            <p>Loading notices...</p>
          ) : committeeNotices && committeeNotices.length > 0 ? (
            <div>
              {committeeNotices.map(notice => (
                <NoticeItem key={notice._id} notice={notice} />
              ))}
            </div>
          ) : (
            <p>No new notices from the committee.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Supervisor Notices</h2>
          {noticesLoading ? (
            <p>Loading notices...</p>
          ) : supervisorNotices && supervisorNotices.length > 0 ? (
            <div>
              {supervisorNotices.map(notice => (
                <NoticeItem key={notice._id} notice={notice} />
              ))}
            </div>
          ) : (
            <p>No new notices from your supervisor.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;