import React from 'react';
import { useGetMyResultsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

const AssessmentTable = ({ title, comments }) => (
  <div className="mb-12">
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    <div className="overflow-hidden border border-gray-200 rounded shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        
        <thead className="bg-[#80a18e]">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white w-1/4">
              Evaluator
            </th>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white">
              Comments
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Supervisor Comments */}
          {comments.supervisor.map((c, i) => (
            <tr key={`sup-${i}`} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-5 align-top">
                <div className="text-sm font-bold text-gray-900">{c.evaluator}</div>
                <div className="text-[10px] text-gray-500 uppercase font-medium">Supervisor</div>
              </td>
              <td className="px-6 py-5 text-base text-gray-700 leading-relaxed">
                {c.comment}
              </td>
            </tr>
          ))}

          {/* Board Member Comments */}
          {comments.board.map((c, i) => (
            <tr key={`board-${i}`} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-5 align-top">
                <div className="text-sm font-bold text-gray-900">{c.evaluator}</div>
                <div className="text-[10px] text-gray-500 uppercase font-medium">Board Member</div>
              </td>
              <td className="px-6 py-5 text-base text-gray-700 leading-relaxed">
                {c.comment}
              </td>
            </tr>
          ))}

          {/* No Comments State */}
          {comments.supervisor.length === 0 && comments.board.length === 0 && (
            <tr>
              <td colSpan="2" className="px-6 py-8 text-center text-sm text-gray-400 italic">
                No feedback comments recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const MyResults = () => {
  const { data: results, isLoading, isError, error } = useGetMyResultsQuery();

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-50 border border-red-100 text-red-700 rounded-lg text-center font-medium">
        Error: {error?.data?.message || 'Failed to fetch results.'}
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="bg-white min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        {/* <div className="mb-14">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Academic Evaluation Results</h1>
          <p className="text-gray-500 mt-2">Official feedback and final grade certification summary.</p>
        </div> */}

        {/* Pre-Defense Feedback Table */}
        <AssessmentTable 
          title="Pre-Defense Feedback" 
          comments={results.preDefenseComments} 
        />

        {/* Final-Defense Feedback Table */}
        <AssessmentTable 
          title="Final-Defense Feedback" 
          comments={results.finalDefenseComments} 
        />

        {/* Final Result Summary Table (Matched with Image Style) */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Final Result Summary</h2>
          <div className="overflow-hidden border border-gray-200 rounded shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#80a18e]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Course Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Point</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.published ? (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{results.courseCode}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700">{results.courseTitle}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-left text-sm font-semibold text-gray-900">{results.grade}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-left text-sm font-semibold text-gray-900">{results.point.toFixed(2)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500 font-medium italic bg-gray-50">
                      Your final grade is currently being processed.
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

export default MyResults;