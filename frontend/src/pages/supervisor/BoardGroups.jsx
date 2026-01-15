import React from 'react';
import { useParams, useLocation, NavLink } from 'react-router-dom';
import { useGetDefenseBoardByIdQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

const BoardGroups = () => {
  const { boardId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defenseType = queryParams.get('defenseType');

  const {
    data: defenseBoard,
    isLoading,
    error,
  } = useGetDefenseBoardByIdQuery(boardId);

  if (isLoading) return <Loader />;

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-500 bg-red-50 border border-red-200 rounded">
        Error: {error?.error || 'Something went wrong'}
      </div>
    );

  if (!defenseBoard)
    return (
      <div className="max-w-4xl mx-auto p-6 text-gray-500 bg-gray-50 border border-gray-200 rounded">
        No defense board found.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Back Navigation */}
      <NavLink
        to="/supervisor/committee-evaluations"
        className="inline-flex items-center text-sm text-emerald-600 hover:underline mb-6"
      >
        ← Back to Board Overview
      </NavLink>

      {/* Header */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Groups for Board {defenseBoard.boardNumber}{' '}
        <span className="text-gray-500 text-base">
          ({defenseBoard.defenseType})
        </span>
      </h2>

      {/* Groups Table */}
      {defenseBoard.groups && defenseBoard.groups.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="px-6 py-4 text-left">Group No</th>
                <th className="px-6 py-4 text-left">Project Title</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-sm">
              {defenseBoard.groups.map((group, index) => (
                <tr
                  key={group._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    {group.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <NavLink
                      to={`/supervisor/evaluate-group/${group._id}?defenseType=${defenseType}&isBoardEvaluation=true&boardId=${boardId}`}
                      className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded transition"
                    >
                      Evaluate
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center text-gray-500">
          No groups assigned to this defense board.
        </div>
      )}
    </div>
  );
};

export default BoardGroups;
