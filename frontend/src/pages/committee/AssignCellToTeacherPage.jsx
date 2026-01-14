import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, PlusCircle, ShieldCheck, User } from 'lucide-react';
import {
  useGetUserByIdQuery,
  useGetResearchCellsQuery,
  useAssignCellMutation
} from '../../features/apiSlice';

const AssignCellToTeacherPage = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();

  const { data: teacher, isLoading: loadingTeacher, error: teacherError, refetch: refetchTeacher } = useGetUserByIdQuery(teacherId);
  const { data: allCells, isLoading: loadingCells, error: cellsError, refetch: refetchCells } = useGetResearchCellsQuery();
  const [assignCells, { isLoading: assigningCells }] = useAssignCellMutation();

  const [selectedCellIds, setSelectedCellIds] = useState([]);

  // Filter out cells already assigned to the teacher
  const cellsNotAssigned = useMemo(() => {
    if (!allCells || !teacher) return [];
    const assignedCellIds = teacher.researchCells.map(cell => cell._id);
    return allCells.filter(cell => !assignedCellIds.includes(cell._id));
  }, [allCells, teacher]);

  const handleCheckboxChange = (cellId) => {
    setSelectedCellIds(prev =>
      prev.includes(cellId) ? prev.filter(id => id !== cellId) : [...prev, cellId]
    );
  };

  const handleAssignSelectedCells = async () => {
    if (selectedCellIds.length === 0) {
      toast.error("Please select at least one cell to assign.");
      return;
    }

    try {
      await assignCells({ id: teacherId, cellIds: selectedCellIds }).unwrap();
      toast.success('Cells assigned successfully.');
      setSelectedCellIds([]); // Clear selection
      refetchTeacher(); // Re-fetch teacher details to update assigned cells
      refetchCells(); // Re-fetch all cells to update available cells
    } catch (error) {
      toast.error(error.data?.message || 'Failed to assign cells.');
    }
  };

  if (loadingTeacher || loadingCells) return <div className="h-96 flex items-center justify-center"><Loader /></div>;
  if (teacherError || cellsError || !teacher) return <div className="p-10 text-center text-red-500 font-bold">Error: Data load failed.</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/committee/all-teachers')}
          className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assign Research Cell(s)</h1>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600">
          <User size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{teacher.name}</h2>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <ShieldCheck size={14} /> {teacher.email}
          </p>
          {teacher.researchCells && teacher.researchCells.length > 0 && (
            <div className="mt-2">
              <h3 className="text-xs font-medium text-gray-500">Currently Assigned:</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {teacher.researchCells.map(cell => (
                  <span key={cell._id} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {cell.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm uppercase">Available Cells to Assign</h3>
          <button
            onClick={handleAssignSelectedCells}
            disabled={assigningCells || selectedCellIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-sm transition-all cursor-pointer disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <PlusCircle size={14} />
            {assigningCells ? 'Assigning...' : 'Assign Selected Cells'}
          </button>
        </div>

        {cellsNotAssigned && cellsNotAssigned.length > 0 ? (
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th> {/* Checkbox */}
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Serial</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cellsNotAssigned.map((cell, index) => (
                <tr key={cell._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedCellIds.includes(cell._id)}
                      onChange={() => handleCheckboxChange(cell._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wide">{cell.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500 text-sm font-medium italic">
            No unassigned research cells available for this teacher.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCellToTeacherPage;
