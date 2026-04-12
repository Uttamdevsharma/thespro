import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMyCommitteeEvaluationsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import { EyeIcon } from '@heroicons/react/24/outline'; // Professional icon

const SupervisorBoardOverview = () => {
    const navigate = useNavigate();
    const [defenseTypeFilter, setDefenseTypeFilter] = useState('Pre-Defense');

    const {
        data: boards,
        isLoading,
        isError,
        error,
        refetch: refetchBoards
    } = useGetMyCommitteeEvaluationsQuery(defenseTypeFilter);

    useEffect(() => {
        refetchBoards();
    }, [defenseTypeFilter, refetchBoards]); // Refetch when filter changes or on initial load

    if (isLoading) return <Loader />;
    if (isError) return <div className="text-red-500">Error: {error?.message || 'Failed to load boards.'}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">My Assigned Boards</h1>

                {/* Filter Section */}
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

                {/* Boards Table */}
                {boards && boards.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Board
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Defense Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Room
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {boards.map((board) => (
                                    <tr key={board._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Board {board.boardNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {board.defenseType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {board.room?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {board.date ? format(new Date(board.date), 'dd/MM/yyyy') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {board.schedule?.startTime && board.schedule?.endTime ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => navigate(`/supervisor/committee-evaluations/${board._id}`)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <EyeIcon className="w-5 h-5 mr-2" />
                                                View Groups
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <p>No assigned boards found for {defenseTypeFilter} type.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupervisorBoardOverview;