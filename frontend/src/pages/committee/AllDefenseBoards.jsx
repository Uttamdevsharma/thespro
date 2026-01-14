import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllDefenseBoardsQuery, useDeleteDefenseBoardMutation } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';

const AllDefenseBoards = () => {
  const navigate = useNavigate();
  const { data: defenseBoards, isLoading, isError, error, refetch } = useGetAllDefenseBoardsQuery();
  const [deleteDefenseBoard] = useDeleteDefenseBoardMutation();

  const handleDelete = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this defense board? This action cannot be undone.')) {
      try {
        await deleteDefenseBoard(boardId).unwrap();
        toast.success('Defense board deleted successfully.');
        refetch(); // Refetch the list to show updated data
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-red-500">Error: {error?.data?.message || error?.error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Defense Boards</h2>
      {defenseBoards && defenseBoards.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Board No.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defense Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {defenseBoards.map((board) => (
                <tr key={board._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {board.boardNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.defenseType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.date ? format(new Date(board.date), 'PPP') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.schedule?.startTime && board.schedule?.endTime ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {board.room?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/committee/defense-boards/${board._id}`)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      title="View Groups"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="ml-1 hidden sm:inline">View Groups</span>
                    </button>
                    <button
                      onClick={() => handleDelete(board._id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                      title="Delete Board"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="ml-1 hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No defense boards found.</p>
      )}
    </div>
  );
};

export default AllDefenseBoards;