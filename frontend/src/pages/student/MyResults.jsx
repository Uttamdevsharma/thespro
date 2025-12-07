import React from 'react';
import { useGetMyResultsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

/* -----------------------------
   Reusable Table Row Component
----------------------------- */
const EvaluationRow = ({ evaluator, marks, comment }) => (
  <tr className="border-b last:border-none hover:bg-gray-50 transition">
    <td className="px-6 py-4 font-medium text-gray-900">{evaluator}</td>
    <td className="px-6 py-4 text-center">
      <span
        className={`px-3 py-1.5 rounded-full text-[15px] font-bold 
        ${marks >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
      >
        {marks}
      </span>
    </td>
    <td className="px-6 py-4 text-gray-700 italic">
      {comment || '— No feedback —'}
    </td>
  </tr>
);

/* -----------------------------
   Section Card Component
----------------------------- */
const ResultSectionCard = ({
  phase,
  title,
  supervisorMarks,
  boardMarks,
  total,
  maxTotal,
  supervisorMax,
  boardMax
}) => (
  <section className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">

    {/* Header */}
    <div className="flex justify-between items-start mb-6 pb-4 border-b">
      <div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
          {phase}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{title}</h2>
      </div>

      {/* Total Score */}
      <div className="text-right bg-gray-50 px-4 py-3 rounded-lg border">
        <p className="text-xs font-medium text-gray-600 uppercase">Total Marks</p>
        <p className="text-3xl font-extrabold text-blue-700">
          {total?.toFixed(2)}
          <span className="text-base text-gray-500 ml-1">/ {maxTotal}</span>
        </p>
      </div>
    </div>

    {/* Evaluation Table */}
    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Evaluator</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Marks</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Comments</th>
          </tr>
        </thead>

        <tbody>
          {/* Supervisor Section */}
          <tr className="bg-indigo-50">
            <td
              colSpan="3"
              className="px-6 py-2 font-semibold text-indigo-800 text-sm uppercase"
            >
              Supervisor Evaluation (Max: {supervisorMax})
            </td>
          </tr>
          {supervisorMarks?.length ? (
            supervisorMarks.map((m, idx) => (
              <EvaluationRow key={`sup-${idx}`} {...m} />
            ))
          ) : (
            <tr>
              <td colSpan="3" className="py-4 text-center text-gray-500 italic">
                No supervisor marks found.
              </td>
            </tr>
          )}

          {/* Board Section */}
          <tr className="bg-indigo-50">
            <td
              colSpan="3"
              className="px-6 py-2 font-semibold text-indigo-800 text-sm uppercase"
            >
              Board Evaluation (Max: {boardMax})
            </td>
          </tr>
          {boardMarks?.length ? (
            boardMarks.map((m, idx) => (
              <EvaluationRow key={`board-${idx}`} {...m} />
            ))
          ) : (
            <tr>
              <td colSpan="3" className="py-4 text-center text-gray-500 italic">
                No board marks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>
);

/* -----------------------------
         Main Component
----------------------------- */
const MyResults = () => {
  const { data: results, isLoading, isError, error } = useGetMyResultsQuery();

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-red-100 border border-red-300 text-red-700 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p>{error?.data?.message || 'Failed to fetch results.'}</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow text-center">
        <p className="text-gray-600 text-lg font-medium">No results available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-14">

        {/* Page Header */}
        <header className="pb-5 border-b">
          <h1 className="text-4xl font-extrabold text-gray-900">My Evaluation Results</h1>
        </header>

        {/* Phase 1 */}
        <ResultSectionCard
          phase="Phase 1"
          title="Pre-Defense Evaluation"
          supervisorMarks={results.preDefense.supervisor}
          boardMarks={results.preDefense.committee}
          total={results.preDefense.total}
          maxTotal={30}
          supervisorMax={20}
          boardMax={10}
        />

        {/* Divider */}
        <hr className="border-dashed" />

        {/* Phase 2 */}
        <ResultSectionCard
          phase="Phase 2"
          title="Final Defense Evaluation"
          supervisorMarks={results.finalDefense.supervisor}
          boardMarks={results.finalDefense.committee}
          total={results.finalDefense.total}
          maxTotal={70}
          supervisorMax={40}
          boardMax={30}
        />

        {/* Final Overall Card (WHITE) */}
        <div className="mt-16 p-8 bg-white border border-gray-200 rounded-xl shadow-xl flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Overall Total</h2>
            <p className="text-gray-600">Combined score from both Phases</p>
          </div>
          <div className="text-right">
            <p className="text-6xl font-extrabold text-indigo-600">
              {results.overallTotal.toFixed(2)}
            </p>
            <span className="text-2xl text-gray-500">/ 100</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyResults;
