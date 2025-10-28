import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../components/Loader.jsx';

const DefenseResult = () => {
  const { user } = useSelector((state) => state.user);
  const [defenseResults, setDefenseResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supervisionFilter, setSupervisionFilter] = useState('all');
  const [defenseTypeFilter, setDefenseTypeFilter] = useState('Pre-Defense');

  useEffect(() => {
    const fetchDefenseResults = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
          params: { filter: supervisionFilter, defenseType: defenseTypeFilter },
        };
        const { data } = await axios.get('/api/defense-results/supervisor', config);
        setDefenseResults(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDefenseResults();
  }, [user, supervisionFilter, defenseTypeFilter]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Defense Results</h2>

      {/* Supervision Filter Dropdown */}
      <div className="mb-4 max-w-md">
        <label htmlFor="supervisionFilter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Supervision:</label>
        <div className="relative">
          <select
            id="supervisionFilter"
            name="supervisionFilter"
            value={supervisionFilter}
            onChange={(e) => setSupervisionFilter(e.target.value)}
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 hover:border-gray-400 transition-colors"
          >
            <option value="all">All Groups (Under my supervision & course supervision)</option>
            <option value="my_supervision">Under my supervision only</option>
            <option value="my_course_supervision">Under my course supervision only</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Defense Type Filter Dropdown */}
      <div className="mb-6 max-w-md">
        <label htmlFor="defenseTypeFilter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Defense Type:</label>
        <div className="relative">
          <select
            id="defenseTypeFilter"
            name="defenseTypeFilter"
            value={defenseTypeFilter}
            onChange={(e) => setDefenseTypeFilter(e.target.value)}
            className="block w-full appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 hover:border-gray-400 transition-colors"
          >
            <option value="Pre-Defense">Pre-Defense</option>
            <option value="Final Defense">Final Defense</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {defenseResults.length === 0 ? (
        <p>No {defenseTypeFilter.toLowerCase()} defense results found for your supervised groups with the current filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">SL</th>
                <th className="py-2 px-4 border-b text-left">Student IDs</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Thesis/Project Title</th>
                <th className="py-2 px-4 border-b text-left">Type</th>
                <th className="py-2 px-4 border-b text-left">Board Members</th>
                <th className="py-2 px-4 border-b text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              {defenseResults.map((result, index) => (
                <tr key={result._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{result.students.map((s) => s.studentId).join(', ')}</td>
                  <td className="py-2 px-4 border-b">{result.students.map((s) => s.name).join(', ')}</td>
                  <td className="py-2 px-4 border-b">{result.title}</td>
                  <td className="py-2 px-4 border-b">{result.type}</td>
                  <td className="py-2 px-4 border-b">{result.boardMembers.join(', ')}</td>
                  <td className="py-2 px-4 border-b whitespace-pre-wrap">
                    {result.comments.map((c, i) => (
                      <div key={i}>
                        <strong>{c.commentedBy}:</strong> {c.text}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DefenseResult;
