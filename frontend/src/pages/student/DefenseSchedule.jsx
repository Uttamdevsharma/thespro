import React, { useEffect } from 'react';
import { useGetStudentDefenseScheduleQuery } from '../../features/apiSlice';
import { useSocket } from '../../contexts/SocketContext';

const DefenseSchedule = () => {
  const { data: defenseBoards, isLoading, isError, error, refetch } = useGetStudentDefenseScheduleQuery();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('commentUpdated', (data) => {
        // Refetch the defense schedule data when a comment is updated
        refetch();
      });

      return () => {
        socket.off('commentUpdated');
      };
    }
  }, [socket, refetch]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Defense Schedule</h1>
      {isLoading ? (
        <p>Loading defense boards...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {error.data?.message || 'An unexpected error occurred'}</p>
      ) : (
        <div>
          {defenseBoards && defenseBoards.map(board => (
            <div key={board._id} className="p-4 bg-gray-100 rounded-lg shadow-md mt-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold">Date:</span> {new Date(board.date).toLocaleDateString()} | <span className="font-bold">Room:</span> {board.room ? board.room.name : 'N/A'} | <span className="font-bold">Schedule:</span> {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
              </div>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Sl.</th>
                    <th className="py-2">Student IDs</th>
                    <th className="py-2">Student Names</th>
                    <th className="py-2">Thesis/Project Title</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Supervisor</th>
                    <th className="py-2">Course Supervisor</th>
                    <th className="py-2">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {board.groups.map((group, index) => (
                    <tr key={group._id} className="text-center">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{group.members.map(m => m.studentId).join(', ')}</td>
                      <td className="py-2">{group.members.map(m => m.name).join(', ')}</td>
                      <td className="py-2">{group.title}</td>
                      <td className="py-2">{group.type}</td>
                      <td className="py-2">{group.supervisorId ? group.supervisorId.name : '-'}</td>
                      <td className="py-2">{group.courseSupervisorId ? group.courseSupervisorId.name : '-'}</td>
                      <td className="py-2" style={{ whiteSpace: 'pre-wrap' }}>{board.comments.find(c => c.group === group._id)?.text || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-center mt-2 font-bold">
                Board Members: {board.boardMembers.map(m => m.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefenseSchedule;
