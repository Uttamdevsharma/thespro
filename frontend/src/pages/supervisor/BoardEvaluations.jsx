import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useGetMyCommitteeEvaluationsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { format } from 'date-fns';

const BoardEvaluations = () => {
  const [defenseTypeFilter, setDefenseTypeFilter] = useState('Pre-Defense');

  const {
    data: defenseBoards,
    isLoading,
    error,
  } = useGetMyCommitteeEvaluationsQuery(defenseTypeFilter);

  const handleFilterChange = (e) => {
    setDefenseTypeFilter(e.target.value);
  };

  if (isLoading) return <Loader />;
  if (error)
    return (
      <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded">
        Error: {JSON.stringify(error)}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Board Evaluations
        </h2>

        {/* Filter */}
        <div className="mt-4 md:mt-0">
          <label className="text-sm font-medium text-gray-600 mr-2">
            Defense Type:
          </label>
          <select
            value={defenseTypeFilter}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Pre-Defense">Pre-Defense</option>
            <option value="Final Defense">Final Defense</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {defenseBoards && defenseBoards.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                <th className="px-6 py-4 text-left">Board</th>
                <th className="px-6 py-4 text-left">Defense Type</th>
                <th className="px-6 py-4 text-left">Room</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Time</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-sm">
              {defenseBoards.map((board) => (
                <tr
                  key={board._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium">
                    Board {board.boardNumber}
                  </td>
                  <td className="px-6 py-4">{board.defenseType}</td>
                  <td className="px-6 py-4">
                    {board.room?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {board.date
                      ? format(new Date(board.date), 'dd MMM yyyy')
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {board.schedule?.startTime &&
                    board.schedule?.endTime
                      ? `${board.schedule.startTime} – ${board.schedule.endTime}`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <NavLink
                      to={`/supervisor/board-groups/${board._id}?defenseType=${board.defenseType}`}
                      className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded transition"
                    >
                      View Groups
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center text-gray-500">
          No defense boards found for evaluation.
        </div>
      )}
    </div>
  );
};

export default BoardEvaluations;
