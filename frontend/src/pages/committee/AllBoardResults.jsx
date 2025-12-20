import React, { useState, useEffect } from 'react';
import { useGetBoardResultsQuery, usePublishAllResultsMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';

const AllBoardResults = () => {
  const [defenseType, setDefenseType] = useState('pre-defense');
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: boardResults, isLoading, isError, error, refetch } = useGetBoardResultsQuery(defenseType);
  const [publishAllResults, { isLoading: isPublishing }] = usePublishAllResultsMutation();

  useEffect(() => {
    // Reset selections when defense type changes
    setSelectedBoard(null);
    setSelectedGroup(null);
  }, [defenseType]);

  const handlePublish = async () => {
    try {
      const response = await publishAllResults().unwrap();
      toast.success(response.message || 'Results publishing initiated.');
      refetch(); // Refetch board results to update UI
    } catch (err) {
      toast.error(err.data?.message || 'Failed to publish results');
    }
  };

  const renderStudentResultTable = (students, proposal) => {
    if (!selectedGroup) return <p>Select a group to see student results.</p>;

    return (
      <table className="w-full border-collapse border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border text-left">Student Name</th>
            <th className="p-2 border text-left">Student ID</th>
            <th className="p-2 border text-left">Supervisor Name</th>
            <th className="p-2 border text-left">Supervisor Mark</th>
            <th className="p-2 border text-left">Board Member Mark</th>
            <th className="p-2 border text-left">Total</th>
            <th className="p-2 border text-left">Comments</th>
          </tr>
        </thead>
        <tbody>
          {students.map(studentResult => {
            const supervisorEval = studentResult.evaluations.find(e => e.evaluationType === 'supervisor');
            const committeeEvals = studentResult.evaluations.filter(e => e.evaluationType === 'committee');
            const committeeAvg = committeeEvals.length > 0 ? committeeEvals.reduce((acc, e) => acc + e.marks, 0) / committeeEvals.length : 0;
            const total = (supervisorEval?.marks || 0) + committeeAvg;

            return (
              <tr key={studentResult.student._id}>
                <td className="p-2 border">{studentResult.student.name}</td>
                <td className="p-2 border">{studentResult.student.registrationNumber}</td>
                <td className="p-2 border">{proposal.supervisorId?.name || 'N/A'}</td>
                <td className="p-2 border">{supervisorEval?.marks || 'N/A'}</td>
                <td className="p-2 border">{committeeAvg.toFixed(2)}</td>
                <td className="p-2 border font-bold">{total.toFixed(2)}</td>
                <td className="p-2 border">
                  {studentResult.evaluations.map(e => e.comments).filter(c => c).join('; ') || 'No comments'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <p className="text-red-500">Error: {error.data?.message || 'Failed to load board results'}</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Board Results</h1>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {isPublishing ? 'Publishing...' : 'Publish Result'}
        </button>
      </div>

      <div className="mb-6">
        <select
          value={defenseType}
          onChange={(e) => setDefenseType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="pre-defense">Pre-Defense</option>
          <option value="final-defense">Final Defense</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel: Boards */}
        <div className="col-span-3">
          <h2 className="text-xl font-semibold mb-4">{defenseType === 'pre-defense' ? 'Pre-Defense Boards' : 'Final Defense Boards'}</h2>
          <div className="space-y-2">
            {boardResults?.map(boardResult => (
              <div
                key={boardResult.board._id}
                onClick={() => handleBoardSelect(boardResult)}
                className={`p-4 rounded-lg cursor-pointer border ${selectedBoard?.board._id === boardResult.board._id ? 'bg-blue-100 border-blue-400' : 'bg-white'}`}
              >
                <p className="font-bold">{boardResult.board.defenseType}</p>
                <p>Room: {boardResult.board.room.name}</p>
                <p>Date: {new Date(boardResult.board.date).toLocaleDateString()}</p>
                <p>Time: {boardResult.board.schedule.startTime} - {boardResult.board.schedule.endTime}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Panel: Groups */}
        <div className="col-span-4">
          <h2 className="text-xl font-semibold mb-4">Groups Under Selected Board</h2>
          {selectedBoard ? (
            <div className="space-y-2">
              {selectedBoard.proposals.map(proposalResult => (
                <div
                  key={proposalResult.proposal._id}
                  onClick={() => handleGroupSelect(proposalResult)}
                  className={`p-4 rounded-lg cursor-pointer border ${selectedGroup?.proposal._id === proposalResult.proposal._id ? 'bg-green-100 border-green-400' : 'bg-white'}`}
                >
                  <p className="font-bold">{proposalResult.proposal.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Select a board to see the groups.</p>
          )}
        </div>

        {/* Right Panel: Student Results Table */}
        <div className="col-span-5">
          <h2 className="text-xl font-semibold mb-4">Student-wise Evaluation</h2>
          {selectedGroup ? (
            renderStudentResultTable(selectedGroup.students, selectedGroup.proposal)
          ) : (
            <p>Select a group to see student results.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBoardResults;