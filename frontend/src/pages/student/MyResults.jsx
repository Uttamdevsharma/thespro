import React from 'react';
import { useGetMyResultsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

const MyResults = () => {
  const { data: results, isLoading, isError, error } = useGetMyResultsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div className="text-red-500">Error fetching results: {error.data?.message || 'Unknown error'}</div>;
  }

  const renderMarks = (marksArray, title) => (
    <div className="mb-2">
      <h4 className="font-semibold">{title}</h4>
      {marksArray.length > 0 ? (
        <ul className="list-disc list-inside pl-4">
          {marksArray.map((evaluation, index) => (
            <li key={index} className="text-sm">
              {evaluation.evaluator}: {evaluation.marks} marks
              {evaluation.comment && <p className="text-xs text-gray-500 pl-4">Comment: "{evaluation.comment}"</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No marks submitted yet.</p>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 border-b pb-2">My Evaluation Results</h1>

      {results ? (
        <div className="space-y-6">
          {/* Pre-Defense Card */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Pre-Defense Evaluation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>{renderMarks(results.preDefense.supervisor, 'Supervisor Marks (out of 20)')}</div>
              <div>{renderMarks(results.preDefense.committee, 'Committee Marks (out of 10)')}</div>
            </div>
            <div className="mt-4 pt-3 border-t">
              <p className="text-lg font-bold">Total Pre-Defense Marks: <span className="text-blue-600">{results.preDefense.total.toFixed(2)} / 30</span></p>
            </div>
          </div>

          {/* Final-Defense Card */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Final Defense Evaluation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>{renderMarks(results.finalDefense.supervisor, 'Supervisor Marks (out of 40)')}</div>
              <div>{renderMarks(results.finalDefense.committee, 'Committee Marks (out of 30)')}</div>
            </div>
            <div className="mt-4 pt-3 border-t">
              <p className="text-lg font-bold">Total Final Defense Marks: <span className="text-blue-600">{results.finalDefense.total.toFixed(2)} / 70</span></p>
            </div>
          </div>
          
          {/* Overall Total */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">Overall Total</h2>
            <p className="text-4xl font-bold text-green-600">{results.overallTotal.toFixed(2)} / 100</p>
          </div>

        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default MyResults;