import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserByIdQuery, useGetResearchCellsQuery, useRemoveCellMutation, useGetTeachersQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, User, PlusCircle } from 'lucide-react';

const ResearchCellDetail = () => {
  const navigate = useNavigate();
  const { cellId } = useParams();

  // Fetch all teachers
  const { data: allTeachers, isLoading: loadingAllTeachers, error: allTeachersError } = useGetTeachersQuery();
  // Fetch the specific research cell details
  const { data: allCells, isLoading: loadingCells, error: cellsError } = useGetResearchCellsQuery();

  const researchCell = allCells?.find(cell => cell._id === cellId);

  // Filter teachers who are members of this cell
  const cellMembers = allTeachers?.filter(teacher =>
    teacher.researchCells.some(assignedCell => assignedCell._id === cellId)
  );

  const [removeCell, { isLoading: removingCell }] = useRemoveCellMutation();

  const handleRemoveMember = async (teacherId, teacherName) => {
    if (window.confirm(`Are you sure you want to remove ${teacherName} from this cell?`)) {
      try {
        await removeCell({ id: teacherId, cellId }).unwrap();
        toast.success(`${teacherName} removed from cell successfully.`);
        // No explicit refetch needed as invalidatesTags should handle it
      } catch (error) {
        toast.error(error.data?.message || 'Failed to remove member.');
      }
    }
  };

  if (loadingAllTeachers || loadingCells) return <Loader />;
  if (allTeachersError || cellsError || !researchCell) return <div className="p-10 text-center text-red-500 font-bold">Error: Could not load cell details or members.</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/committee/cell-members')}
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Members of {researchCell.title}</h1>
          <p className="text-sm text-gray-500">{researchCell.description}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(`/committee/cell-members/${cellId}/add-member`)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Member
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="font-bold text-gray-700 text-sm uppercase">Cell Members</h3>
        </div>

        {cellMembers && cellMembers.length > 0 ? (
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Serial</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cellMembers.map((member, index) => (
                <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{member.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveMember(member._id, member.name)}
                      disabled={removingCell}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                      {removingCell ? 'Removing...' : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm font-medium italic">
            No members assigned to this cell yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchCellDetail;