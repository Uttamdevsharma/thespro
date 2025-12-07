import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetMyCommitteeEvaluationsQuery,
    useGetEvaluationsByProposalQuery,
    useSubmitOrUpdateEvaluationMutation
} from '../../features/apiSlice';
    import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { useLocation } from 'react-router-dom';

const CommitteeEvaluations = () => {
    const location = useLocation();

    const {
        data: boards,
        isLoading,
        isError,
        error,
        refetch: refetchBoards
    } = useGetMyCommitteeEvaluationsQuery();

    const [selectedBoard, setSelectedBoard] = useState(null);
    const [selectedProposal, setSelectedProposal] = useState(null);

    const user = useSelector(selectUser);

    const { data: existingEvaluations, refetch } =
        useGetEvaluationsByProposalQuery(selectedProposal?._id, {
            skip: !selectedProposal,
        });

    // Reset when route changes
    useEffect(() => {
        refetchBoards();
        setSelectedBoard(null);
        setSelectedProposal(null);
    }, [location.pathname, refetchBoards]);

    useEffect(() => {
        if (selectedProposal) refetch();
    }, [selectedProposal, refetch]);

    const handleSelectBoard = (board) => {
        setSelectedBoard(board);
        setSelectedProposal(null);
    };

    const handleSelectProposal = (proposal) => {
        setSelectedProposal(proposal);
    };

    if (isLoading) return <Loader />;
    if (isError) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Board Evaluations</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT PANEL — Boards List */}
                <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">My Assigned Boards</h2>

                    <div className="space-y-3">
                        {boards?.length > 0 ? (
                            boards.map(board => (
                                <div
                                    key={board._id}
                                    onClick={() => handleSelectBoard(board)}
                                    className={`p-4 rounded cursor-pointer transition border 
                                        ${selectedBoard?._id === board._id
                                            ? 'bg-blue-100 border-blue-400'
                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}
                                >
                                    <p className="font-bold text-lg">
                                        {board.defenseType.toUpperCase()} BOARD
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Room: {board.room.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Date: {new Date(board.date).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">You are not assigned to any boards.</p>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL — Groups + Evaluation */}
                <div className="md:col-span-2 space-y-4">
                    {/* GROUP LIST */}
                    {selectedBoard ? (
                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                                Groups in This Board
                            </h2>

                            <div className="space-y-3">
                                {selectedBoard.groups.map(proposal => (
                                    <div
                                        key={proposal._id}
                                        onClick={() => handleSelectProposal(proposal)}
                                        className={`p-3 rounded cursor-pointer transition border 
                                            ${selectedProposal?._id === proposal._id
                                                ? 'bg-green-100 border-green-400'
                                                : 'bg-gray-50 hover:bg-gray-100 border-gray-300'}`}
                                    >
                                        <p className="font-bold text-lg">{proposal.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center h-40">
                            <p className="text-gray-500">Select a board to view groups.</p>
                        </div>
                    )}

                    {/* EVALUATION PANEL */}
                    {selectedBoard && (
                        selectedProposal ? (
                            <StudentEvaluationPanel
                                proposal={selectedProposal}
                                existingEvaluations={existingEvaluations}
                                evaluatorId={user._id}
                            />
                        ) : (
                            <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center h-40">
                                <p className="text-gray-500">Select a group to manage evaluations.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentEvaluationPanel = ({ proposal, existingEvaluations, evaluatorId }) => {
    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const [defenseType, setDefenseType] = useState('pre-defense');

    const [submitEvaluation, { isLoading: isSubmitting }] =
        useSubmitOrUpdateEvaluationMutation();

    useEffect(() => {
        const initialMarks = {};
        const initialComments = {};

        if (existingEvaluations) {
            existingEvaluations.forEach(evalGroup => {
                evalGroup.evaluations.forEach(evaluation => {
                    if (
                        evaluation.evaluator._id === evaluatorId &&
                        evaluation.defenseType === defenseType &&
                        evaluation.evaluationType === 'committee'
                    ) {
                        initialMarks[evalGroup.student._id] = evaluation.marks;
                        initialComments[evalGroup.student._id] =
                            evaluation.comments || '';
                    }
                });
            });
        }

        setMarks(initialMarks);
        setComments(initialComments);
    }, [existingEvaluations, defenseType, evaluatorId]);

    const maxMark = defenseType === 'pre-defense' ? 10 : 30;

    const handleSaveAll = async () => {
        const submissionPromises = proposal.members.map(async (student) => {
            const mark = marks[student._id];
            const comment = comments[student._id] || '';

            if (mark === undefined || mark < 0 || mark > maxMark) {
                return { studentId: student._id, status: 'rejected', reason: `Marks for ${student.name} must be between 0 and ${maxMark}.` };
            }

            try {
                await submitEvaluation({
                    studentId: student._id,
                    proposalId: proposal._id,
                    defenseType,
                    evaluationType: 'committee',
                    marks: mark,
                    comments: comment,
                }).unwrap();
                return { studentId: student._id, status: 'fulfilled' };
            } catch (err) {
                return { studentId: student._id, status: 'rejected', reason: `Failed to save evaluation for ${student.name}: ${err.data?.message || 'Server error'}` };
            }
        });

        const results = await Promise.allSettled(submissionPromises);

        const successfulSubmissions = results.filter(res => res.status === 'fulfilled');
        const failedSubmissions = results.filter(res => res.status === 'rejected');

        if (successfulSubmissions.length === proposal.members.length) {
            alert('All evaluations submitted successfully!');
        } else if (failedSubmissions.length === proposal.members.length) {
            alert('Failed to submit all evaluations. Please check console for details.');
            console.error('Failed submissions:', failedSubmissions);
        } else {
            alert(`Submitted ${successfulSubmissions.length} evaluations successfully. Failed to submit ${failedSubmissions.length}.`);
            console.warn('Mixed submission results:', results);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                Student Evaluation — {proposal.title}
            </h3>

            {/* Defense Type Selector */}
            <div className="mb-4 flex items-center gap-3">
                <span className="font-semibold">Evaluation Type:</span>
                <select
                    value={defenseType}
                    onChange={(e) => setDefenseType(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="pre-defense">Pre-Defense (10 Marks)</option>
                    <option value="final-defense">Final Defense (30 Marks)</option>
                </select>
            </div>

            {/* Student List */}
            <div className="space-y-5">
                {proposal.members.map(student => (
                    <div key={student._id} className="p-4 border rounded-lg bg-gray-50">
                        <p className="font-bold text-lg">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>

                        <div className="mt-3">
                            <label className="font-medium">Marks (out of {maxMark}):</label>
                            <input
                                type="number"
                                value={marks[student._id] || ''}
                                onChange={(e) => setMarks(prev => ({
                                    ...prev,
                                    [student._id]: e.target.value
                                }))}
                                className="p-2 border rounded w-32 ml-3"
                                min="0"
                                max={maxMark}
                            />
                        </div>

                        <div className="mt-3">
                            <label className="font-medium">Comments:</label>
                            <input
                                type="text"
                                value={comments[student._id] || ''}
                                onChange={(e) => setComments(prev => ({
                                    ...prev,
                                    [student._id]: e.target.value
                                }))}
                                className="p-2 border rounded w-full mt-1"
                                placeholder="Write optional feedback"
                            />
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={handleSaveAll} // New single save button
                className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving All...' : 'Save All Evaluations'}
            </button>
        </div>
    );
};

export default CommitteeEvaluations;
