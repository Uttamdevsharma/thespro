import React, { useState, useEffect } from 'react';
import { useGetSupervisorDefenseScheduleQuery, useAddOrUpdateCommentMutation } from '../../features/apiSlice';
import toast from 'react-hot-toast';

const DefenseSchedule = () => {
  const { data: defenseBoards, isLoading, isError, error, refetch } = useGetSupervisorDefenseScheduleQuery();
  const [addOrUpdateComment] = useAddOrUpdateCommentMutation();

  const [comments, setComments] = useState({});

  useEffect(() => {
    if (defenseBoards) {
      const initialComments = {};
      defenseBoards.forEach(board => {
        board.groups.forEach(group => {
          const existingComment = board.comments.find(c => c.group === group._id);
          initialComments[group._id] = existingComment ? existingComment.text : '';
        });
      });
      setComments(initialComments);
    }
  }, [defenseBoards]);

  const handleChangeComment = (groupId, text) => {
    setComments(prev => ({ ...prev, [groupId]: text }));
  };

  const handleSaveComment = async (defenseBoardId, groupId) => {
    try {
      await addOrUpdateComment({ id: defenseBoardId, groupId, text: comments[groupId] }).unwrap();
      toast.success('Comment saved successfully!');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save comment.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Defense Schedule</h1>

      {isLoading ? (
        <p>Loading defense boards...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {error.data?.message || 'An unexpected error occurred'}</p>
      ) : (
        <div className="space-y-6">
          {defenseBoards.map(board => (
            <div key={board._id} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-200">
                <div className="text-gray-700 font-medium text-sm md:text-base">
                  <span className="font-bold">Date:</span> {new Date(board.date).toLocaleDateString()} |{' '}
                  <span className="font-bold">Room:</span> {board.room ? board.room.name : 'N/A'} |{' '}
                  <span className="font-bold">Schedule:</span> {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student IDs</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Names</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Supervisor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {board.groups.map((group, index) => (
                      <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm">{index + 1}</td>
                        <td className="px-4 py-2 text-sm">{group.members.map(m => m.studentId).join(', ')}</td>
                        <td className="px-4 py-2 text-sm">{group.members.map(m => m.name).join(', ')}</td>
                        <td className="px-4 py-2 text-sm">{group.title}</td>
                        <td className="px-4 py-2 text-sm">{group.type}</td>
                        <td className="px-4 py-2 text-sm">{group.supervisorId?.name || '-'}</td>
                        <td className="px-4 py-2 text-sm">{group.courseSupervisorId?.name || '-'}</td>
                        <td className="px-4 py-2 text-sm flex flex-col gap-1">
                          <textarea
                            className="w-full p-2 border rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-400"
                            rows={2}
                            value={comments[group._id] || ''}
                            onChange={(e) => handleChangeComment(group._id, e.target.value)}
                          />
                          <button
                            onClick={() => handleSaveComment(board._id, group._id)}
                            className="self-end bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium"
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-3 text-center text-gray-700 font-semibold">
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
