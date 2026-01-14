import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetDefenseBoardByIdQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ArrowLeft, FileText } from 'lucide-react';

const DefenseBoardDetail = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const { data: boardDetails, isLoading, isError, error } = useGetDefenseBoardByIdQuery(boardId);

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-500">Error: {error?.data?.message || error?.error}</div>;
  if (!boardDetails) return <div className="text-gray-600">No board details found.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/committee/all-defense-boards')}
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Defense Board: {boardDetails.boardNumber} ({boardDetails.defenseType})
        </h2>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-gray-700 mb-2">
          <strong>Date:</strong> {boardDetails.date ? format(new Date(boardDetails.date), 'PPP') : 'N/A'}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Time:</strong>{' '}
          {boardDetails.schedule?.startTime && boardDetails.schedule?.endTime
            ? `${boardDetails.schedule.startTime} - ${boardDetails.schedule.endTime}`
            : 'N/A'}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Room:</strong> {boardDetails.room?.name || 'N/A'}
        </p>
        <p className="text-gray-700">
          <strong>Board Members:</strong>{' '}
          {boardDetails.boardMembers && boardDetails.boardMembers.length > 0
            ? boardDetails.boardMembers.map((member) => member.name).join(', ')
            : 'N/A'}
        </p>
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-800">Groups in this Board</h3>
      {boardDetails.groups && boardDetails.groups.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Supervisor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result Summary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boardDetails.groups.map((group, index) => (
                <tr key={group._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.supervisorId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.courseSupervisorId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {group.members.map((member) => member.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/committee/defense-boards/${boardId}/group-result/${group._id}?defenseType=${boardDetails.defenseType}`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Results
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No groups assigned to this board.</p>
      )}
    </div>
  );
};

export default DefenseBoardDetail;
