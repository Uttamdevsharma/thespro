import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetMyCommitteeEvaluationsQuery, useGetEvaluationsByProposalQuery, useSubmitOrUpdateEvaluationMutation } from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';

const CommitteeEvaluations = () => {
    const { data: boards, isLoading, isError, error } = useGetMyCommitteeEvaluationsQuery();
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const user = useSelector(selectUser);

    const { data: existingEvaluations, refetch } = useGetEvaluationsByProposalQuery(selectedProposal?._id, {
        skip: !selectedProposal,
    });

    useEffect(() => {
        if (selectedProposal) {
            refetch();
        }
    }, [selectedProposal, refetch]);

    const handleSelectBoard = (board) => {
        setSelectedBoard(board);
        setSelectedProposal(null); // Reset proposal selection when board changes
    };

    const handleSelectProposal = (proposal) => {
        setSelectedProposal(proposal);
    };

    if (isLoading) return <Loader />;
    if (isError) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Committee Evaluations</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold mb-2">My Assigned Boards</h2>
                    <div className="space-y-2">
                        {boards && boards.length > 0 ? (
                            boards.map(board => (
                                <div key={board._id} onClick={() => handleSelectBoard(board)}
                                    className={`p-3 rounded cursor-pointer ${selectedBoard?._id === board._id ? 'bg-blue-200 shadow-md' : 'bg-white shadow'}`}>
                                    <p className="font-bold">{board.defenseType.toUpperCase()} Board</p>
                                    <p className="text-sm text-gray-600">Room: {board.room.name} | {new Date(board.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p>You are not assigned to any defense boards.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    {selectedBoard && (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Groups in Board</h2>
                            <div className="space-y-2 mb-4">
                                {selectedBoard.groups.map(proposal => (
                                    <div key={proposal._id} onClick={() => handleSelectProposal(proposal)}
                                        className={`p-3 rounded cursor-pointer ${selectedProposal?._id === proposal._id ? 'bg-green-200 shadow-md' : 'bg-white shadow'}`}>
                                        <p className="font-bold">{proposal.title}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedProposal ? (
                                <StudentEvaluationPanel
                                    proposal={selectedProposal}
                                    existingEvaluations={existingEvaluations}
                                    evaluatorId={user._id}
                                />
                            ) : (
                                <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center h-full">
                                    <p className="text-gray-500">Select a group to manage evaluations.</p>
                                </div>
                            )}
                        </div>
                    )}
                    {!selectedBoard && (
                        <div className="p-6 bg-white rounded-lg shadow flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a board to view groups.</p>
                        </div>
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
    const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitOrUpdateEvaluationMutation();

    useEffect(() => {
        const initialMarks = {};
        const initialComments = {};
        if (existingEvaluations) {
            existingEvaluations.forEach(evalGroup => {
                evalGroup.evaluations.forEach(evaluation => {
                    // This is for committee evaluation, so filter by role and evaluator
                    if (evaluation.evaluator._id === evaluatorId && evaluation.defenseType === defenseType && evaluation.evaluationType === 'committee') {
                        initialMarks[evalGroup.student._id] = evaluation.marks;
                        initialComments[evalGroup.student._id] = evaluation.comments || '';
                    }
                });
            });
        }
        setMarks(initialMarks);
        setComments(initialComments);
    }, [existingEvaluations, defenseType, evaluatorId]);


    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
    };

    const handleCommentChange = (studentId, value) => {
        setComments(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmit = async (studentId) => {
        const mark = marks[studentId];
        const maxMark = defenseType === 'pre-defense' ? 10 : 30;
        if (mark === undefined || mark < 0 || mark > maxMark) {
            alert(`Marks must be between 0 and ${maxMark}.`);
            return;
        }

        try {
            await submitEvaluation({
                studentId,
                proposalId: proposal._id,
                defenseType,
                evaluationType: 'committee', // Role is Committee Evaluator
                marks: mark,
                comments: comments[studentId] || '',
            }).unwrap();
            alert('Evaluation submitted successfully!');
        } catch (err) {
            alert(`Failed to submit evaluation: ${err.data?.message || 'Server error'}`);
        }
    };

    const maxMark = defenseType === 'pre-defense' ? 10 : 30;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Students in "{proposal.title}"</h3>
            <div className="mb-4">
                <span className="mr-4">Evaluation Type:</span>
                <select value={defenseType} onChange={(e) => setDefenseType(e.target.value)} className="p-2 border rounded">
                    <option value="pre-defense">Pre-Defense</option>
                    <option value="final-defense">Final Defense</option>
                </select>
            </div>

            <div className="space-y-4">
                {proposal.members.map(student => (
                    <div key={student._id} className="p-3 border rounded-md">
                        <p className="font-bold">{student.name} ({student.email})</p>
                        <div className="mt-2 flex items-center gap-4">
                            <label>Marks (out of {maxMark}):</label>
                            <input
                                type="number"
                                value={marks[student._id] || ''}
                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                className="p-1 border rounded w-24"
                                max={maxMark}
                                min="0"
                            />
                        </div>
                        <div className="mt-2 flex items-center gap-4">
                            <label>Comment:</label>
                            <input
                                type="text"
                                value={comments[student._id] || ''}
                                onChange={(e) => handleCommentChange(student._id, e.target.value)}
                                className="p-1 border rounded w-full"
                                placeholder="Optional feedback"
                            />
                        </div>
                        <button
                            onClick={() => handleSubmit(student._id)}
                            className="mt-3 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Save Evaluation'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommitteeEvaluations;