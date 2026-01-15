import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    useGetEvaluationsByProposalQuery,
    useSubmitOrUpdateEvaluationMutation,
    useGetProposalByIdQuery
} from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import toast from 'react-hot-toast';


const EvaluateGroupPage = () => {
    const { proposalId } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // Get location object
    const queryParams = new URLSearchParams(location.search);
    const initialDefenseType = queryParams.get('defenseType') || 'Pre-Defense';
    const isBoardEvaluation = queryParams.get('isBoardEvaluation') === 'true'; // Read new param
    const boardIdFromQuery = queryParams.get('boardId'); // Read new param

    const user = useSelector(selectUser);
    const supervisorId = user._id;

    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const [defenseType, setDefenseType] = useState(initialDefenseType);

    // Fetch proposal details directly using the ID from params
    const { data: proposal, isLoading: isLoadingProposal, error: proposalError } =
        useGetProposalByIdQuery(proposalId, { skip: !proposalId });

    const { data: existingEvaluations, refetch, isLoading: isLoadingEvaluations } =
        useGetEvaluationsByProposalQuery({ proposalId, defenseType }, {
            skip: !proposalId,
        });

    const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitOrUpdateEvaluationMutation();

    useEffect(() => {
        if (!proposalId) {
            toast.error('No group selected for evaluation.');
            navigate('/supervisor/my-supervisions');
            return;
        }
        if (proposalError) {
            toast.error(`Error loading proposal: ${proposalError.message || 'Unknown error'}`);
            navigate('/supervisor/my-supervisions');
            return;
        }

        const initialMarks = {};
        const initialComments = {};
        if (existingEvaluations) {
            existingEvaluations.forEach(evalGroup => {
                evalGroup.evaluations.forEach(evaluation => {
                    if (evaluation.evaluator._id === supervisorId && evaluation.defenseType === defenseType) {
                        initialMarks[evalGroup.student._id] = evaluation.marks;
                        initialComments[evalGroup.student._id] = evaluation.comments || '';
                    }
                });
            });
        }
        const marksString = Object.fromEntries(
            Object.entries(initialMarks).map(([key, value]) => [key, String(value)])
        );

        setMarks(marksString);
        setComments(initialComments);
    }, [existingEvaluations, defenseType, supervisorId, proposalId, navigate, proposalError, location.search]);


    const handleMarkChange = (studentId, value) => {
        const cleanedValue = value.trim() === '' ? '' : Number(value);
        setMarks(prev => ({ ...prev, [studentId]: cleanedValue }));
    };

    const handleCommentChange = (studentId, value) => {
        setComments(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSaveAll = async () => {
        if (!proposal) {
            toast.error('Proposal data not available.');
            return;
        }

        const evaluationTypeToSend = isBoardEvaluation ? 'committee' : 'supervisor'; // Determine evaluation type dynamically

        const submissionPromises = proposal.members.map(async (student) => {
            const mark = marks[student._id];
            const comment = comments[student._id] || '';

            let maxMark;
            if (isBoardEvaluation) { // Committee evaluation
                if (defenseType === 'Pre-Defense') {
                    maxMark = 10;
                } else { // Final Defense
                    maxMark = 30;
                }
            } else { // Supervisor evaluation
                if (defenseType === 'Pre-Defense') {
                    maxMark = 20;
                } else { // Final Defense
                    maxMark = 40;
                }
            }
            if (mark === undefined || mark === '' || Number(mark) < 0 || Number(mark) > maxMark) {
                toast.error(`Marks for ${student.name} must be a number between 0 and ${maxMark}.`);
                return { studentId: student._id, status: 'rejected', reason: `Marks for ${student.name} must be a number between 0 and ${maxMark}.` };
            }

            try {
                await submitEvaluation({
                    studentId: student._id,
                    proposalId: proposal._id,
                    defenseType,
                    evaluationType: evaluationTypeToSend, // Use dynamically determined type
                    marks: Number(mark),
                    comments: comment,
                }).unwrap();
                return { studentId: student._id, status: 'fulfilled' };
            } catch (err) {
                console.error(`Submission failed for ${student.name}:`, err);
                toast.error(`Failed to save evaluation for ${student.name}: ${err.data?.message || 'Server error'}`);
                return { studentId: student._id, status: 'rejected', reason: `Failed to save evaluation for ${student.name}: ${err.data?.message || 'Server error'}` };
            }
        });

        const results = await Promise.allSettled(submissionPromises);

        const successfulSubmissions = results.filter(res => res.status === 'fulfilled');
        const failedSubmissions = results.filter(res => res.status === 'rejected');

        if (successfulSubmissions.length === proposal.members.length) {
            toast.success('All evaluations submitted successfully!');
            refetch();
        } else if (failedSubmissions.length === proposal.members.length) {
            toast.error('Failed to submit all evaluations. Please check console for details.');
            console.error('Failed submissions:', failedSubmissions);
        } else {
            toast.warn(`Submitted ${successfulSubmissions.length} evaluations successfully. Failed to submit ${failedSubmissions.length}.`);
            console.warn('Mixed submission results:', results);
        }
    };
    let maxMark;
    if (isBoardEvaluation) { // Committee evaluation
        if (defenseType === 'Pre-Defense') {
            maxMark = 10;
        } else { // Final Defense
            maxMark = 30;
        }
    } else { // Supervisor evaluation
        if (defenseType === 'Pre-Defense') {
            maxMark = 20;
        } else { // Final Defense
            maxMark = 40;
        }
    }

    if (isLoadingProposal || isLoadingEvaluations || !proposal) {
        return <Loader />;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <button
                    onClick={() => isBoardEvaluation && boardIdFromQuery
                        ? navigate(`/supervisor/board-groups/${boardIdFromQuery}?defenseType=${initialDefenseType}`)
                        : navigate('/supervisor/my-supervisions')}
                    className="flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    <span>&larr;</span> Back {isBoardEvaluation ? 'to Board Groups' : 'to My Supervisions'}
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">Evaluation Management</h2>

                <div className="mb-6 flex items-center space-x-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="font-semibold text-gray-700">Evaluation Phase:</label>
                    <select
                        value={defenseType}
                        onChange={(e) => setDefenseType(e.target.value)}
                        className="p-2 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        disabled={isBoardEvaluation} // Add this line
                    >
                        <option value="Pre-Defense">Pre-Defense (Max: 20)</option>
                        <option value="Final-Defense">Final-Defense (Max: 40)</option>
                    </select>
                    <span className="text-sm text-gray-600 ml-auto">Current Max Mark: <span className="font-bold text-blue-700">{maxMark}</span></span>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Students in "{proposal.title}"</h3>

                <div className="space-y-6">
                    {proposal.members.map(student => (
                        <div key={student._id} className="p-5 border border-gray-200 rounded-xl shadow-md bg-white">
                            <div className="flex justify-between items-center mb-3 border-b pb-2">
                                <p className="font-bold text-lg text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-700 mb-1">Marks (out of {maxMark}):</label>
                                    <input
                                        type="number"
                                        value={marks[student._id] ?? ''}
                                        onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                        max={maxMark}
                                        min="0"
                                        placeholder="Enter Mark"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-medium text-gray-700 mb-1">Comment (Optional):</label>
                                    <input
                                        type="text"
                                        value={comments[student._id] || ''}
                                        onChange={(e) => handleCommentChange(student._id, e.target.value)}
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Provide feedback"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleSaveAll}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 flex items-center"
                        disabled={isSubmitting}
                    >
                        <CheckBadgeIcon className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Saving All...' : 'Save All Evaluations'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvaluateGroupPage;
