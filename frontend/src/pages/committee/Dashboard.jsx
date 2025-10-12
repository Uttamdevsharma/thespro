
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaFlask, FaUsers } from 'react-icons/fa';
import { useGetResearchCellsQuery, useGetProposalsQuery, useGetStudentsQuery, useGetTeachersQuery } from '../../features/apiSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: researchCells, isLoading: loadingCells, error: cellsError } = useGetResearchCellsQuery();
  const { data: proposals, isLoading: loadingProposals, error: proposalsError } = useGetProposalsQuery();
  const { data: students, isLoading: loadingStudents, error: studentsError } = useGetStudentsQuery();
  const { data: teachers, isLoading: loadingTeachers, error: teachersError } = useGetTeachersQuery();

  const totalStudents = students?.length || 0;
  const totalTeachers = teachers?.length || 0;
  const totalProposals = proposals?.length || 0;
  const approvedProposals = proposals?.filter(p => p.status === 'Approved').length || 0;
  const pendingProposals = proposals?.filter(p => p.status === 'Pending').length || 0;
  const totalResearchCells = researchCells?.length || 0;
  const totalCommitteeMembers = 5; // Placeholder for now, as there's no direct query for committee members

  if (loadingCells || loadingProposals || loadingStudents || loadingTeachers) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading dashboard...</div>;
  }

  if (cellsError || proposalsError || studentsError || teachersError) {
    return <div className="p-6 bg-white rounded-lg shadow-md text-red-600">Error loading data.</div>;
  }

  const cardData = [
    { id: 'students', label: 'Total Students', value: totalStudents, icon: FaUserGraduate, bgColor: 'bg-blue-500', path: '/committee/all-students' },
    { id: 'teachers', label: 'Total Teachers', value: totalTeachers, icon: FaChalkboardTeacher, bgColor: 'bg-green-500', path: '/committee/all-teachers' },
    { id: 'proposals', label: 'Total Proposals', value: totalProposals, icon: FaFileAlt, bgColor: 'bg-purple-500', path: '/committee/proposals' }, // Assuming a proposals page
    { id: 'approved', label: 'Approved Proposals', value: approvedProposals, icon: FaCheckCircle, bgColor: 'bg-teal-500', path: '/committee/proposals?status=Approved' },
    { id: 'pending', label: 'Pending Proposals', value: pendingProposals, icon: FaHourglassHalf, bgColor: 'bg-orange-500', path: '/committee/proposals?status=Pending' },
    { id: 'researchCells', label: 'Total Research Cells', value: totalResearchCells, icon: FaFlask, bgColor: 'bg-red-500', path: '/committee/research-cells' },
    { id: 'committeeMembers', label: 'Total Committee Members', value: totalCommitteeMembers, icon: FaUsers, bgColor: 'bg-indigo-500', path: '/committee/committee-members' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {cardData.map(card => (
          <div
            key={card.id}
            className={`${card.bgColor} text-white p-5 rounded-lg shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow duration-300`}
            onClick={() => navigate(card.path)}
          >
            <div className="text-2xl">
              <card.icon />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

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
