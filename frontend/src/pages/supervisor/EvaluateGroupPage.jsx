import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetEvaluationsByProposalQuery, useSubmitOrUpdateEvaluationMutation } from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Assuming toast notifications are used


const EvaluateGroupPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { proposal } = location.state || {}; // Get proposal from route state

    const user = useSelector(selectUser);
    const supervisorId = user._id;

    const { data: existingEvaluations, refetch, isLoading: isLoadingEvaluations } =
        useGetEvaluationsByProposalQuery(proposal?._id, {
            skip: !proposal,
        });

    const [marks, setMarks] = useState({});
    const [comments, setComments] = useState({});
    const [defenseType, setDefenseType] = useState('Pre-Defense'); // Default to Pre-Defense

    const [submitEvaluation, { isLoading: isSubmitting }] = useSubmitOrUpdateEvaluationMutation();

    useEffect(() => {
        if (!proposal) {
            toast.error('No group selected for evaluation.');
            navigate('/supervisor/my-supervisions'); // Redirect if no proposal
            return;
        }

        const initialMarks = {};
        const initialComments = {};
        if (existingEvaluations) {
            existingEvaluations.forEach(evalGroup => {
                evalGroup.evaluations.forEach(evaluation => {
                    // Filter by supervisorId and current defenseType
                    if (evaluation.evaluator._id === supervisorId && evaluation.defenseType === defenseType) {
                        initialMarks[evalGroup.student._id] = evaluation.marks;
                        initialComments[evalGroup.student._id] = evaluation.comments || '';
                    }
                });
            });
        }
        // Convert marks to string for input fields, allowing empty string for no input
        const marksString = Object.fromEntries(
            Object.entries(initialMarks).map(([key, value]) => [key, String(value)])
        );

        setMarks(marksString);
        setComments(initialComments);
    }, [existingEvaluations, defenseType, supervisorId, proposal, navigate]);


    const handleMarkChange = (studentId, value) => {
        // Allow empty string for clearing input, otherwise convert to Number
        const cleanedValue = value.trim() === '' ? '' : Number(value); 
        setMarks(prev => ({ ...prev, [studentId]: cleanedValue }));
    };

    const handleCommentChange = (studentId, value) => {
        setComments(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSaveAll = async () => {
        const submissionPromises = proposal.members.map(async (student) => {
            const mark = marks[student._id];
            const comment = comments[student._id] || '';

            // Basic validation
            if (mark === undefined || mark === '' || Number(mark) < 0 || Number(mark) > maxMark) {
                toast.error(`Marks for ${student.name} must be a number between 0 and ${maxMark}.`);
                return { studentId: student._id, status: 'rejected', reason: `Marks for ${student.name} must be a number between 0 and ${maxMark}.` };
            }

            try {
                await submitEvaluation({
                    studentId: student._id,
                    proposalId: proposal._id,
                    defenseType,
                    evaluationType: 'supervisor', // Always supervisor evaluation for this page
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
            refetch(); // Refetch evaluations to update UI
        } else if (failedSubmissions.length === proposal.members.length) {
            toast.error('Failed to submit all evaluations. Please check console for details.');
            console.error('Failed submissions:', failedSubmissions);
        } else {
            toast.warn(`Submitted ${successfulSubmissions.length} evaluations successfully. Failed to submit ${failedSubmissions.length}.`);
            console.warn('Mixed submission results:', results);
        }
    };
    const maxMark = defenseType === 'pre-defense' ? 20 : 40; // Max marks depend on defense type

    if (isLoadingEvaluations || !proposal) {
        return <Loader />; // Show loader if evaluations are loading or proposal is not available
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <button 
                    onClick={() => navigate('/supervisor/my-supervisions')} 
                    className="flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    <span>&larr;</span> Back to My Supervisions
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">Evaluation Management</h2>
                
                {/* Evaluation Type Selector */}
                <div className="mb-6 flex items-center space-x-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="font-semibold text-gray-700">Evaluation Phase:</label>
                    <select 
                        value={defenseType} 
                        onChange={(e) => setDefenseType(e.target.value)} 
                        className="p-2 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    >
                        <option value="Pre-Defense">Pre-Defense (Max: 20)</option>
                        <option value="Final Defense">Final Defense (Max: 40)</option>
                    </select>
                    <span className="text-sm text-gray-600 ml-auto">Current Max Mark: <span className="font-bold text-blue-700">{maxMark}</span></span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Students in "{proposal.title}"</h3>

                {/* Student Evaluation List */}
                <div className="space-y-6">
                    {proposal.members.map(student => (
                        <div key={student._id} className="p-5 border border-gray-200 rounded-xl shadow-md bg-white">
                            <div className="flex justify-between items-center mb-3 border-b pb-2">
                                <p className="font-bold text-lg text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Marks Input */}
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

                                {/* Comment Input */}
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
                {/* Single Save All Evaluations Button */}
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
