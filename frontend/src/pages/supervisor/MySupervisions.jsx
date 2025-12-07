import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetMySupervisionsQuery, useGetEvaluationsByProposalQuery, useSubmitOrUpdateEvaluationMutation } from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { useLocation } from 'react-router-dom';
import { UserGroupIcon, DocumentTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'; // Professional icons

// --- Main Component ---
const MySupervisions = () => {
    const user = useSelector(selectUser);
    const location = useLocation();
    const { data: proposals, isLoading, isError, error, refetch: refetchProposals } = useGetMySupervisionsQuery();
    const [selectedProposal, setSelectedProposal] = useState(null);

    // Note: Since the filter logic is removed, we'll assume the API only returns groups 
    // where the user is the supervisor, and we will display all of them directly.
    const filteredProposals = proposals; 

    const { data: existingEvaluations, refetch } = useGetEvaluationsByProposalQuery(selectedProposal?._id, {
        skip: !selectedProposal,
    });

    // Reset state and refetch proposals on location change (navigation)
    useEffect(() => {
        refetchProposals();
        setSelectedProposal(null);
    }, [location.pathname, refetchProposals]);

    // Refetch evaluations when selected proposal changes
    useEffect(() => {
        if (selectedProposal) {
            refetch();
        }
    }, [selectedProposal, refetch]);

    const handleSelectProposal = (proposal) => {
        setSelectedProposal(proposal);
    };

    if (isLoading) return <Loader />;
    if (isError) return <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-6xl mx-auto">Error: {error.message}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                
                {/* *** Filter Section Removed as Requested *** */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                    {/* Left Panel: Group List */}
                    <div className="md:col-span-1 bg-white rounded-xl shadow-lg border border-gray-100 p-4 h-min">
                        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                            <UserGroupIcon className="w-5 h-5 text-blue-500 mr-2" />
                            My Groups
                        </h2>
                        <div className="space-y-3">
                            {filteredProposals && filteredProposals.length > 0 ? (
                                filteredProposals.map(proposal => (
                                    <div 
                                        key={proposal._id} 
                                        onClick={() => handleSelectProposal(proposal)}
                                        className={`p-4 rounded-lg cursor-pointer transition duration-200 border ${selectedProposal?._id === proposal._id ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <p className="font-semibold text-gray-900 truncate">{proposal.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">Members: {proposal.members.length}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                                    <p>No supervised groups found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Evaluation Form */}
                    <div className="md:col-span-2">
                        {selectedProposal ? (
                            <StudentEvaluationPanel 
                                proposal={selectedProposal} 
                                existingEvaluations={existingEvaluations}
                                supervisorId={user._id}
                            />
                        ) : (
                            <div className="p-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center h-full min-h-[400px]">
                                <div className="text-center text-gray-500">
                                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p className="text-lg font-medium">Select a group from the left panel</p>
                                    <p className="text-sm">to view student details and manage their evaluations.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Student Evaluation Panel Component ---
const StudentEvaluationPanel = ({ proposal, existingEvaluations, supervisorId }) => {
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
    }, [existingEvaluations, defenseType, supervisorId]);


    const handleMarkChange = (studentId, value) => {
        const cleanedValue = value.trim() === '' ? '' : Number(value); 
        setMarks(prev => ({ ...prev, [studentId]: cleanedValue }));
    };

    const handleCommentChange = (studentId, value) => {
        setComments(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmit = async (studentId) => {
        const mark = marks[studentId];
        const maxMark = defenseType === 'pre-defense' ? 20 : 40;

        if (mark === undefined || mark === '' || Number(mark) < 0 || Number(mark) > maxMark) {
            alert(`Marks must be a number between 0 and ${maxMark}.`);
            return;
        }

        try {
            await submitEvaluation({
                studentId,
                proposalId: proposal._id,
                defenseType,
                evaluationType: 'supervisor',
                marks: Number(mark),
                comments: comments[studentId] || '',
            }).unwrap();
            alert('Evaluation submitted successfully!');
        } catch (err) {
            console.error("Submission failed:", err);
            alert(`Failed to submit evaluation: ${err.data?.message || 'Server error'}`);
        }
    };

    const maxMark = defenseType === 'pre-defense' ? 20 : 40;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3">Evaluation Management</h2>
            
            {/* Evaluation Type Selector */}
            <div className="mb-6 flex items-center space-x-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <label className="font-semibold text-gray-700">Evaluation Phase:</label>
                <select 
                    value={defenseType} 
                    onChange={(e) => setDefenseType(e.target.value)} 
                    className="p-2 border border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                >
                    <option value="pre-defense">Pre-Defense (Max: 20)</option>
                    <option value="final-defense">Final Defense (Max: 40)</option>
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

                        {/* Submit Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleSubmit(student._id)}
                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-gray-400 flex items-center"
                                disabled={isSubmitting}
                            >
                                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Evaluation'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySupervisions;