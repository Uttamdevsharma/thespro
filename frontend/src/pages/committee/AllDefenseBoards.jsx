import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../components/Loader.jsx';
import { format } from 'date-fns';

const AllDefenseBoards = () => {
  const { user } = useSelector((state) => state.user);
  const [defenseBoards, setDefenseBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDefenseBoards = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: { filter: 'all' }, // Request all boards
      };
      const { data } = await axios.get('/api/defenseboards', config);
      setDefenseBoards(data);
    } catch (err) {
      console.error('Error fetching all defense boards:', err);
      setError(err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDefenseBoards();
    }
  }, [user]);

  const handleDelete = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this defense board? This action cannot be undone.')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.delete(`/api/defenseboards/${boardId}`, config);
        toast.success('Defense board deleted successfully');
        fetchDefenseBoards(); // Refresh the list
      } catch (err) {
        console.error('Error deleting defense board:', err);
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">All Defense Boards</h2>
      {defenseBoards.length === 0 ? (
        <p>No defense boards found.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {defenseBoards.map((board) => (
            <div key={board._id} className="p-4 bg-gray-50 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="text-gray-700 font-medium text-lg">
                  Date: {format(new Date(board.date), 'PPP')} | Room: {board.room?.name || 'N/A'} | Schedule: {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
                <button
                  onClick={() => handleDelete(board._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-2 border-b">Sl.</th>
                      <th className="py-2 px-2 border-b">Student IDs</th>
                      <th className="py-2 px-2 border-b">Student Names</th>
                      <th className="py-2 px-2 border-b">Title</th>
                      <th className="py-2 px-2 border-b">Type</th>
                      <th className="py-2 px-2 border-b">Supervisor</th>
                      <th className="py-2 px-2 border-b">Course Supervisor</th>
                      <th className="py-2 px-2 border-b">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {board.groups.map((group, index) => (
                      <tr key={group._id} className="text-center hover:bg-gray-50">
                        <td className="py-2 px-2 border-b">{index + 1}</td>
                        <td className="py-2 px-2 border-b">{group.members.map(m => m.studentId).join(', ')}</td>
                        <td className="py-2 px-2 border-b">{group.members.map(m => m.name).join(', ')}</td>
                        <td className="py-2 px-2 border-b">{group.title}</td>
                        <td className="py-2 px-2 border-b">{group.type}</td>
                        <td className="py-2 px-2 border-b">{group.supervisorId?.name || '-'}</td>
                        <td className="py-2 px-2 border-b">{group.courseSupervisorId?.name || '-'}</td>
                        <td className="py-2 px-2 border-b whitespace-pre-wrap">
                          {/* Find comments for this specific group within the board's comments array */}
                          {board.comments
                            .filter(comment => comment.group === group._id)
                            .map((comment, i) => (
                              <div key={i}>
                                <strong>{comment.commentedBy?.name || 'Unknown'}:</strong> {comment.text}
                              </div>
                            ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-gray-700 font-semibold text-center">
                Board Members: {board.boardMembers.map(member => member.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllDefenseBoards;
