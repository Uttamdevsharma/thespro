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
  const [filter, setFilter] = useState('all'); // Default filter

  useEffect(() => {
    console.log('DefenseResult useEffect - user:', user);
    const fetchDefenseResults = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          params: { filter }, // Pass filter as a query parameter
        };
        const { data } = await axios.get('/api/defense-results/supervisor', config);
        setDefenseResults(data);
      } catch (err) {
        console.error('Error fetching defense results:', err);
        setError(err.response?.data?.message || err.message);
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDefenseResults();
    }
  }, [user, filter]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Defense Results</h2>

      {/* Filter Dropdown */}
      <div className="mb-6">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter Groups:
        </label>
        <div className="relative w-72">
          <select
            id="filter"
            name="filter"
            className="block w-full appearance-none bg-white border border-gray-300 hover:border-indigo-400 text-gray-700 py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ease-in-out duration-150"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Groups (Under my supervision & course supervision)</option>
            <option value="my_supervision">Under my supervision only</option>
            <option value="my_course_supervision">Under my course supervision only</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      {defenseResults.length === 0 ? (
        <p>No defense results found for your supervised groups with the current filter.</p>
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
                  <td className="py-2 px-4 border-b">
                    {result.students.map((s) => s.studentId).join(', ')}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {result.students.map((s) => s.name).join(', ')}
                  </td>
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
