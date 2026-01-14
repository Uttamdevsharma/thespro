import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGetEvaluationsByProposalQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { ArrowLeft } from 'lucide-react';

const GroupResultSummary = () => {
  const navigate = useNavigate();
  const { boardId, proposalId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defenseType = queryParams.get('defenseType');

  const { data: evaluations, isLoading, isError, error } = useGetEvaluationsByProposalQuery({ proposalId, defenseType });

  const summarizedResults = useMemo(() => {
    if (!evaluations) return [];

    const results = {};
    evaluations.forEach(studentResult => {
      const student = studentResult.student;
      results[student._id] = {
        name: student.name,
        studentId: student.studentId,
        supervisorMark: 'N/A',
        committeeMark: 0,
        committeeCount: 0,
        totalScore: 0,
        supervisorName: 'N/A', // Assuming supervisor name comes from proposal, not directly evaluation
      };

      studentResult.evaluations.forEach(evalItem => {
        if (evalItem.evaluationType === 'supervisor') {
          results[student._id].supervisorMark = evalItem.marks;
          // Assuming supervisor name is associated with the proposal, not individual eval
          // Will need to update if backend sends supervisor name with each eval.
        } else if (evalItem.evaluationType === 'committee') {
          results[student._id].committeeMark += evalItem.marks;
          results[student._id].committeeCount += 1;
        }
      });
    });

    // Calculate averages and total scores
    return Object.values(results).map(student => {
      const avgCommitteeMark = student.committeeCount > 0 ? (student.committeeMark / student.committeeCount) : 0;
      const total = (typeof student.supervisorMark === 'number' ? student.supervisorMark : 0) + avgCommitteeMark;
      return {
        ...student,
        avgCommitteeMark: parseFloat(avgCommitteeMark.toFixed(2)),
        totalScore: parseFloat(total.toFixed(2)),
      };
    });
  }, [evaluations]);

  if (isLoading) return <Loader />;
  if (isError) return (
    <div className="text-red-500">Error: {error?.data?.message || error?.error}</div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/committee/defense-boards/${boardId}`)}
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Result Summary for Group ({defenseType})</h2>
      </div>

      {summarizedResults.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supervisor Mark
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Board Member Mark
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summarizedResults.map((student) => (
                <tr key={student.studentId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.supervisorMark}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.avgCommitteeMark}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No evaluation results found for this group with defense type "{defenseType}".</p>
      )}
    </div>
  );
};

export default GroupResultSummary;