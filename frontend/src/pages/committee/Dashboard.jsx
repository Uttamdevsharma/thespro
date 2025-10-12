
import React from 'react';
import { useGetResearchCellsQuery, useGetProposalsQuery } from '../../features/apiSlice';

const Dashboard = () => {
  const { data: researchCells, isLoading: loadingCells, error: cellsError } = useGetResearchCellsQuery();
  const { data: proposals, isLoading: loadingProposals, error: proposalsError } = useGetProposalsQuery();

  if (loadingCells || loadingProposals) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading dashboard...</div>;
  }

  if (cellsError || proposalsError) {
    return <div className="p-6 bg-white rounded-lg shadow-md text-red-600">Error loading data.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Committee Dashboard</h1>

      {researchCells && researchCells.length > 0 ? (
        <div className="space-y-8">
          {researchCells.map(cell => (
            <div key={cell._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{cell.title}</h2>
              <div className="overflow-x-auto max-h-96 overflow-y-auto relative">
                <table className="min-w-full bg-white">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Proposal Title</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supervisor</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals && proposals.filter(p => p.researchCellId?._id === cell._id).length > 0 ? (
                      proposals.filter(p => p.researchCellId?._id === cell._id).map(proposal => (
                        <tr key={proposal._id}>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm">{proposal.title}</td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm">{proposal.supervisorId?.name || 'N/A'}</td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                proposal.status === 'Pending'
                                  ? 'bg-orange-100 text-orange-800'
                                  : proposal.status === 'Approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {proposal.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200 text-sm">{new Date(proposal.updatedAt || proposal.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-3 px-4 text-sm text-gray-500 text-center">No proposals for this research cell.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-gray-500">No research cells found.</p>
      )}
    </div>
  );
};

export default Dashboard;
