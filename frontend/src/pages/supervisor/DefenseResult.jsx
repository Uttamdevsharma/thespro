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

  useEffect(() => {
    console.log('DefenseResult useEffect - user:', user);
    const fetchDefenseResults = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
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
  }, [user]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Defense Results</h2>
      {defenseResults.length === 0 ? (
        <p>No defense results found for your supervised groups.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">SL</th>
                <th className="py-2 px-4 border-b">Student IDs</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Thesis/Project Title</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Board Members</th>
                <th className="py-2 px-4 border-b">Comments</th>
              </tr>
            </thead>
            <tbody>
              {defenseResults.map((result, index) => (
                <tr key={result._id}>
                  <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {result.students.map((s) => s.studentId).join(', ')}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {result.students.map((s) => s.name).join(', ')}
                  </td>
                  <td className="py-2 px-4 border-b">{result.title}</td>
                  <td className="py-2 px-4 border-b">{result.type}</td>
                  <td className="py-2 px-4 border-b">
                    {result.boardMembers.join(', ')}
                  </td>
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
