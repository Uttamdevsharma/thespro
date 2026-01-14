import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDefenseBoardByIdQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

const SupervisorBoardGroupOverviewPage = () => {
    const navigate = useNavigate();
    const { boardId } = useParams(); // Get boardId from URL params

    const { data: boardDetails, isLoading, isError, error } = useGetDefenseBoardByIdQuery(boardId);

    // Initial check for boardId and redirect
    useEffect(() => {
        if (!boardId) {
            navigate('/supervisor/committee-evaluations'); 
        }
    }, [boardId, navigate]);

    // Conditional rendering for loading, error, and no board details
    if (isLoading) return <Loader />;
    if (isError) return (
        <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="text-center text-red-500">
                <p className="text-lg font-medium">Error loading board details:</p>
                <p className="text-sm">{error?.data?.message || error?.message || 'An unknown error occurred.'}</p>
            </div>
        </div>
    );
    if (!boardDetails) {
        return <Loader />; // Or a custom "Board not found" message without icon
    }

    const handleEvaluateGroup = (proposal) => {
        // Pass the proposal and the defenseType from the fetched board to the evaluation page
        navigate('/supervisor/evaluate-group', { state: { proposal, defenseType: boardDetails.defenseType } });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/supervisor/committee-evaluations')} 
                    className="flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    <span>&larr;</span> Back to Board Overview
                </button>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-800">Groups in Board {boardDetails.boardNumber} ({boardDetails.defenseType})</h1>
                    </div>
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white">
                                <th className="py-4 px-6">Group No</th>
                                <th className="py-4 px-6">Project Title</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {boardDetails.groups && boardDetails.groups.length > 0 ? (
                                boardDetails.groups.map((proposal, index) => ( // boardDetails.groups is array of Proposals in DefenseBoard model
                                    <tr key={proposal._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-500">Group {index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{proposal.title}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleEvaluateGroup(proposal)} 
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Evaluate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                        No groups found for this board.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupervisorBoardGroupOverviewPage;
