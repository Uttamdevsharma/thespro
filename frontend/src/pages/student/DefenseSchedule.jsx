import React, { useEffect, useState } from 'react';
import { useGetStudentDefenseScheduleQuery } from '../../features/apiSlice';
import { useSocket } from '../../contexts/SocketContext';

const DefenseSchedule = () => {
  const [defenseTypeFilter, setDefenseTypeFilter] = useState('Pre-Defense'); 
  const { data: defenseBoards, isLoading, isError, error, refetch } = useGetStudentDefenseScheduleQuery(defenseTypeFilter);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('commentUpdated', () => {
        refetch();
      });
      return () => socket.off('commentUpdated');
    }
  }, [socket, refetch]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Defense Schedule</h1>

      {/* Filter */}
      <div className="mb-6 max-w-sm">
        <label htmlFor="defenseTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Defense Type:
        </label>
        <select
          id="defenseTypeFilter"
          value={defenseTypeFilter}
          onChange={(e) => setDefenseTypeFilter(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
        >
          <option value="Pre-Defense">Pre-Defense</option>
          <option value="Final Defense">Final Defense</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading defense boards...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {error.data?.message || 'An unexpected error occurred'}</p>
      ) : (
        <div className="space-y-6">
          {defenseBoards && defenseBoards.length > 0 ? defenseBoards.map(board => (
            <div key={board._id} className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              
              {/* Board Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 text-sm text-gray-600">
                <div className="mb-2 sm:mb-0">
                  <span className="font-semibold">Board:</span> {board.boardNumber} |{' '}
                  <span className="font-semibold">Date:</span> {new Date(board.date).toLocaleDateString()} |{' '}
                  <span className="font-semibold">Room:</span> {board.room?.name || 'N/A'} |{' '}
                  <span className="font-semibold">Schedule:</span> {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Sl.</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Student IDs</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Student Names</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Thesis/Project Title</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Supervisor</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Course Supervisor</th>
                      <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {board.groups.map((group, index) => (
                      <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-sm">{index + 1}</td>

                        {/* Student IDs and Names aligned */}
                        <td className="py-2 px-3 text-sm">
                          <div className="flex flex-col gap-1">
                            {group.members.map((m, i) => (
                              <span key={i}>{m.studentId}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-sm">
                          <div className="flex flex-col gap-1">
                            {group.members.map((m, i) => (
                              <span key={i}>{m.name}</span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2 px-3 text-sm">{group.title}</td>
                        <td className="py-2 px-3 text-sm">{group.type}</td>
                        <td className="py-2 px-3 text-sm">{group.supervisorId?.name || '-'}</td>
                        <td className="py-2 px-3 text-sm">{group.courseSupervisorId?.name || '-'}</td>

                        {/* Comments */}
                        <td className="py-2 px-3 text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                          {board.comments.filter(c => c.group === group._id).map((comment, i) => (
                            <div key={i} className="mb-1">
                              <strong className="text-blue-600">{comment.commentedBy?.name || 'Unknown'}:</strong> {comment.text}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Board Members */}
              <div className="text-gray-700 font-semibold text-center mt-3">
                Board Members: {board.boardMembers.map(m => m.name).join(', ')}
              </div>
            </div>
          )) : (
            <p className="text-gray-500">No {defenseTypeFilter.toLowerCase()} boards available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DefenseSchedule;
