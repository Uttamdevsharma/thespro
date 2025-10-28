import React, { useState, useEffect } from 'react';
import { useGetSupervisorDefenseScheduleQuery, useAddOrUpdateCommentMutation } from '../../features/apiSlice';
import toast from 'react-hot-toast'; // Changed from react-toastify

const DefenseSchedule = () => {
  const { data: defenseBoards, isLoading, isError, error, refetch } = useGetSupervisorDefenseScheduleQuery();
  const [addOrUpdateComment] = useAddOrUpdateCommentMutation();

  const [comments, setComments] = useState({}); // State to hold comments for each group

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
    setComments(prevComments => ({
      ...prevComments,
      [groupId]: text,
    }));
  };

  const handleSaveComment = async (defenseBoardId, groupId) => {
    try {
      await addOrUpdateComment({ id: defenseBoardId, groupId, text: comments[groupId] }).unwrap();
      toast.success('Comment saved successfully!');
      refetch(); // Refetch data to ensure UI is up-to-date
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save comment.');
    }
  };

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
                      <td className="py-2">
                        <textarea
                          className="w-full p-1 border rounded-md text-sm"
                          rows="2"
                          value={comments[group._id] || ''}
                          onChange={(e) => handleChangeComment(group._id, e.target.value)}
                        ></textarea>
                        <button
                          onClick={() => handleSaveComment(board._id, group._id)}
                          className="mt-1 bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </td>
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