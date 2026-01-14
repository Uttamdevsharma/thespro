import React, { useState, useEffect } from 'react';

import { useGetMyCommitteeEvaluationsQuery } from '../../features/apiSlice'; // Only need this query now
import Loader from '../../components/Loader';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate

const SupervisorBoardOverviewPage = () => { // Renamed component
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const [searchParams, setSearchParams] = useSearchParams();
    const initialDefenseType = searchParams.get('type') === 'Final Defense' ? 'Final Defense' : 'Pre-Defense';
    const [defenseTypeFilter, setDefenseTypeFilter] = useState(initialDefenseType);

    const {
        data: boards,
        isLoading,
        isError,
        error,
        refetch: refetchBoards
    } = useGetMyCommitteeEvaluationsQuery(defenseTypeFilter);

    // Effect to update URL search params when defenseTypeFilter changes
    useEffect(() => {
        if (defenseTypeFilter !== searchParams.get('type')) {
            setSearchParams({ type: defenseTypeFilter });
        }
    }, [defenseTypeFilter, searchParams, setSearchParams]);

    // Reset when route changes or filter changes via URL
    useEffect(() => {
        refetchBoards();
    }, [location.pathname, refetchBoards, defenseTypeFilter]);

    const handleViewGroups = (board) => { // Renamed handler
        navigate(`/supervisor/board-groups/${board._id}`); // Navigate to new Group Overview page with board ID as URL param
    };

    if (isLoading) return <Loader />;
    if (isError) return (
        <div className="text-red-500 p-4 bg-red-100 rounded-md">
            <p className="font-semibold">Error loading boards:</p>
            <p>{error?.data?.message || error?.message || 'An unknown error occurred.'}</p>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Assigned Boards Overview</h1> {/* Updated title */}

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
                    <option value="Final Defense">Final-Defense</option>
                </select>
            </div>

            <div className="grid grid-cols-1 gap-6"> {/* Removed md:grid-cols-3 */}
                {/* Boards List Table */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Boards</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Board</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defense Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {boards?.length > 0 ? (
                                    boards.map(board => (
                                        <tr key={board._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Board {board.boardNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{board.defenseType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{board.room.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(board.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{board.schedule.startTime} - {board.schedule.endTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => handleViewGroups(board)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    View Groups
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                            You are not assigned to any boards for {defenseTypeFilter}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorBoardOverviewPage;
