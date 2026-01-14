import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useGetTeachersQuery, useGetResearchCellsQuery, useAssignCellMutation } from '../../features/apiSlice';

const AddMembersToCell = () => {
  const navigate = useNavigate();
  const { cellId } = useParams();

  // Fetch all teachers
  const { data: allTeachers, isLoading: loadingAllTeachers, error: allTeachersError } = useGetTeachersQuery();
  // Fetch the specific research cell details
  const { data: allCells, isLoading: loadingCells, error: cellsError } = useGetResearchCellsQuery();

  const researchCell = allCells?.find(cell => cell._id === cellId);

  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [assignCells, { isLoading: assigningCells }] = useAssignCellMutation();

  // Filter teachers who are NOT yet assigned to this cell
  const teachersNotAssignedToCell = useMemo(() => {
    if (!allTeachers || !researchCell) return [];
    return allTeachers.filter(teacher =>
      !teacher.researchCells.some(assignedCell => assignedCell._id === cellId)
    );
  }, [allTeachers, researchCell, cellId]);

  const handleCheckboxChange = (teacherId) => {
    setSelectedTeacherIds(prev =>
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
  };

  const handleAssignSelectedTeachers = async () => {
    if (selectedTeacherIds.length === 0) {
      toast.error("Please select at least one teacher to assign.");
      return;
    }

    try {
      // Assign each selected teacher to this specific cell
      await Promise.all(selectedTeacherIds.map(teacherId =>
        assignCells({ id: teacherId, cellIds: [cellId] }).unwrap()
      ));
      toast.success('Selected teachers assigned to cell successfully.');
      setSelectedTeacherIds([]); // Clear selection
      navigate(`/committee/cell-members/${cellId}`); // Go back to cell detail page
    } catch (error) {
      toast.error(error.data?.message || 'Failed to assign teachers.');
    }
  };

  if (loadingAllTeachers || loadingCells) return <Loader />;
  if (allTeachersError || cellsError || !researchCell) return <div className="p-10 text-center text-red-500 font-bold">Error: Could not load data.</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/committee/cell-members/${cellId}`)}
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add Members to {researchCell.title}</h1>
          <p className="text-sm text-gray-500">Select teachers to assign to this cell.</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm uppercase">Available Teachers</h3>
          <button
            onClick={handleAssignSelectedTeachers}
            disabled={assigningCells || selectedTeacherIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <PlusCircle size={20} className="mr-2" />
            {assigningCells ? 'Assigning...' : 'Assign Selected Teachers'}
          </button>
        </div>

        {teachersNotAssignedToCell && teachersNotAssignedToCell.length > 0 ? (
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th> {/* Checkbox */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Serial</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachersNotAssignedToCell.map((teacher, index) => (
                <tr key={teacher._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(teacher._id)}
                      onChange={() => handleCheckboxChange(teacher._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{teacher.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm font-medium italic">
            All teachers are already assigned to this cell or no teachers available.
          </div>
        )}
      </div>
    </div>
  );
};

export default AddMembersToCell;