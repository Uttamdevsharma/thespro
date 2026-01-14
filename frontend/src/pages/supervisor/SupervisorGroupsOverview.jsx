import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetMySupervisionsQuery } from '../../features/apiSlice';
import { selectUser } from '../../features/userSlice';
import Loader from '../../components/Loader';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';

const SupervisorGroupsOverview = () => {
    const user = useSelector(selectUser);
    const navigate = useNavigate();
    const { data: proposals, isLoading, isError, error, refetch: refetchProposals } = useGetMySupervisionsQuery();

    useEffect(() => {
        refetchProposals();
    }, [refetchProposals]);

    if (isLoading) return <Loader />;
    if (isError) return <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-6xl mx-auto">Error: {error?.message || 'Failed to load supervisions.'}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">My Supervised Groups</h1>

                {proposals && proposals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Group SL
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member Names
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {proposals.map((proposal, index) => (
                                    <tr key={proposal._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {proposal.members.map(member => member.name).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {proposal.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {proposal.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/supervisor/evaluate-group/${proposal._id}`}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <EyeIcon className="w-5 h-5 mr-2" />
                                                Evaluate
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        <p>No supervised groups found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupervisorGroupsOverview;
