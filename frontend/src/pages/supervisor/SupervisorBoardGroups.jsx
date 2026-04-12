import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetDefenseBoardByIdQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import { ArrowLeft, EyeIcon } from 'lucide-react';

const SupervisorBoardGroups = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();

  const { data: boardDetails, isLoading, isError, error } = useGetDefenseBoardByIdQuery(boardId);

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-500">Error: {error?.data?.message || error?.error}</div>;
  if (!boardDetails) return <div className="text-gray-600">No board details found.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/supervisor/committee-evaluations')}
            className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Groups for Board {boardDetails.boardNumber} ({boardDetails.defenseType})
          </h1>
        </div>

        {/* Board Details Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <p className="text-gray-700 mb-1">
            <strong>Date:</strong> {boardDetails.date ? format(new Date(boardDetails.date), 'PPP') : 'N/A'}
          </p>
          <p className="text-gray-700 mb-1">
            <strong>Time:</strong>{' '}
            {boardDetails.schedule?.startTime && boardDetails.schedule?.endTime
              ? `${boardDetails.schedule.startTime} - ${boardDetails.schedule.endTime}`
              : 'N/A'}
          </p>
          <p className="text-gray-700">
            <strong>Room:</strong> {boardDetails.room?.name || 'N/A'}
          </p>
        </div>

        {/* Groups Table */}
        {boardDetails.groups && boardDetails.groups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group SL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boardDetails.groups.map((group, index) => (
                  <tr key={group._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/supervisor/evaluate-group/${group._id}?defenseType=${boardDetails.defenseType}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <EyeIcon className="w-5 h-5 mr-2" />
                        Evaluate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
            <p>No groups found for this board.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorBoardGroups;