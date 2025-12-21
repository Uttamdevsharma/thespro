import React from 'react';
import { useGetMyResultsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';

const CommentsSection = ({ title, comments }) => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
    <div>
      <h3 className="text-lg font-semibold text-indigo-800">Supervisor Comments</h3>
      {comments.supervisor.length > 0 ? (
        comments.supervisor.map((c, i) => (
          <p key={`sup-comment-${i}`} className="text-gray-700 italic">"{c.comment}" - <strong>{c.evaluator}</strong></p>
        ))
      ) : (
        <p className="text-gray-500 italic">No supervisor comments yet.</p>
      )}
    </div>
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-indigo-800">Board Member Comments</h3>
      {comments.board.length > 0 ? (
        comments.board.map((c, i) => (
          <p key={`board-comment-${i}`} className="text-gray-700 italic">"{c.comment}" - <strong>{c.evaluator}</strong></p>
        ))
      ) : (
        <p className="text-gray-500 italic">No board member comments yet.</p>
      )}
    </div>
  </div>
);

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
        <header className="pb-5 border-b">
          <h1 className="text-4xl font-extrabold text-gray-900">My Evaluation Results</h1>
        </header>

        {results.published ? (
          <>
            <CommentsSection title="Pre-Defense Feedback" comments={results.preDefenseComments} />
            <CommentsSection title="Final-Defense Feedback" comments={results.finalDefenseComments} />

            <div className="mt-16 p-8 bg-white border border-gray-200 rounded-xl shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Final Result</h2>
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="font-semibold text-lg">Course Code</div>
                <div className="font-semibold text-lg">Course Title</div>
                <div className="font-semibold text-lg">Grade</div>
                <div className="font-semibold text-lg">Point</div>
                <div>{results.courseCode}</div>
                <div>{results.courseTitle}</div>
                <div className="text-xl font-bold text-green-600">{results.grade}</div>
                <div className="text-xl font-bold text-green-600">{results.point.toFixed(2)}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <CommentsSection title="Pre-Defense Feedback" comments={results.preDefenseComments} />
            <CommentsSection title="Final-Defense Feedback" comments={results.finalDefenseComments} />
            <div className="mt-16 p-8 bg-yellow-100 border border-yellow-300 rounded-xl shadow-xl text-center">
              <p className="text-yellow-800 font-semibold">Your final result has not been published yet.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyResults;