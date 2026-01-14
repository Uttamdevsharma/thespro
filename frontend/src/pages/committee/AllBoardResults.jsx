import React, { useState, useEffect } from 'react';
import { useGetBoardResultsQuery, usePublishAllResultsMutation } from '../../features/apiSlice';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const AllBoardResults = () => {
  const [defenseType, setDefenseType] = useState('Pre-Defense'); // Use exact enum value
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: boardResults, isLoading, isError, error, refetch } = useGetBoardResultsQuery(defenseType);
  const [publishAllResults, { isLoading: isPublishing }] = usePublishAllResultsMutation();

  useEffect(() => {
    setSelectedBoard(null);
    setSelectedGroup(null);
  }, [defenseType]);

  const handlePublish = async () => {
    try {
      await publishAllResults().unwrap();
      toast.success('Result published successfully');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to publish results');
    }
  };

  if (isLoading) return <Loader />;
  if (isError) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <p className="text-red-500 bg-red-50 px-4 py-2 rounded-md border border-red-100 font-medium">
         Error: {error.data?.message || 'Failed to load board results'}
       </p>
    </div>
  );

  if (selectedBoard) {
    if (selectedGroup) {
      return <StudentWiseEvaluation group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
    }
    return <GroupList board={selectedBoard} onGroupSelect={setSelectedGroup} onBack={() => setSelectedBoard(null)} />;
  }

  return (
    <BoardList
      boardResults={boardResults}
      defenseType={defenseType}
      setDefenseType={setDefenseType}
      onBoardSelect={setSelectedBoard}
      handlePublish={handlePublish}
      isPublishing={isPublishing}
    />
  );
};

// --- Components with Professional Industry Standard Design ---

const BoardList = ({ boardResults, defenseType, setDefenseType, onBoardSelect, handlePublish, isPublishing }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">All Board Results</h1>
          {/* <p className="text-gray-500 text-sm mt-1">Manage and overview results by defense type</p> */}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select
            value={defenseType}
            onChange={(e) => setDefenseType(e.target.value)}
            className="block w-full md:w-48 p-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
          >
            <option value="Pre-Defense">Pre-Defense</option>
            <option value="Final Defense">Final Defense</option>
          </select>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="whitespace-nowrap px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Publishing...
              </>
            ) : 'Publish Result'}
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Board</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Defense Type</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {boardResults?.map(boardResult => (
              <tr key={boardResult.board._id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="py-4 px-6 font-semibold text-blue-600">Board {boardResult.board.boardNumber}</td>
                <td className="py-4 px-6 italic text-gray-600">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${boardResult.board.defenseType === 'Pre-Defense' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {boardResult.board.defenseType}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">{boardResult.board.room.name}</td>
                <td className="py-4 px-6 text-gray-600">{new Date(boardResult.board.date).toLocaleDateString('en-GB')}</td>
                <td className="py-4 px-6 text-gray-500 font-mono text-sm">{boardResult.board.schedule.startTime} - {boardResult.board.schedule.endTime}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => onBoardSelect(boardResult)} className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all">
                    View Groups
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GroupList = ({ board, onGroupSelect, onBack }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 font-medium transition-colors">
        <span>&larr;</span> Back to Boards
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">Groups in Board {board.board.boardNumber}</h1>
        </div>
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white">
              <th className="py-4 px-6">Group No</th>
              <th className="py-4 px-6">Project Title</th>
              <th className="py-4 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {board.proposals.map((proposalResult, index) => (
              <tr key={proposalResult.proposal._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium text-gray-500">Group {index + 1}</td>
                <td className="py-4 px-6 font-semibold text-gray-800">{proposalResult.proposal.title}</td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => onGroupSelect(proposalResult)} className="bg-gray-800 text-white px-4 py-1.5 rounded-md hover:bg-black transition-colors text-sm">
                    Result Summary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentWiseEvaluation = ({ group, onBack }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-blue-600 font-medium transition-colors">
        <span>&larr;</span> Back to Groups
      </button>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white">
          {/* <h1 className="text-2xl font-bold">Student Evaluation Summary</h1> */}
          <p className="opacity-90 mt-1 font-medium italic">{group.proposal.title}</p>
        </div>
        
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-50">
                <th className="py-4 px-4 font-bold text-gray-800">Student Name</th>
                <th className="py-4 px-4 font-bold text-gray-800">Student ID</th>
                <th className="py-4 px-4 font-bold text-gray-800">Supervisor Name</th>
                <th className="py-4 px-4 font-bold text-gray-800">Supervisor Mark</th>
                <th className="py-4 px-4 font-bold text-gray-800">Board Member Mark</th>
                <th className="py-4 px-4 font-bold text-gray-800 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.students.map(studentResult => {
                const supervisorEval = studentResult.evaluations.find(e => e.evaluationType === 'supervisor');
                const committeeEvals = studentResult.evaluations.filter(e => e.evaluationType === 'committee');
                const committeeAvg = committeeEvals.length > 0 ? committeeEvals.reduce((acc, e) => acc + e.marks, 0) / committeeEvals.length : 0;
                const total = (supervisorEval?.marks || 0) + committeeAvg;

                return (
                  <tr key={studentResult.student._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-800">{studentResult.student.name}</td>
                    <td className="py-4 px-4 font-mono text-gray-600 text-sm">{studentResult.student.studentId}</td>
                    <td className="py-4 px-4 text-gray-600">{group.proposal.supervisorId?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-center font-medium">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{supervisorEval?.marks || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4 text-center font-medium">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{committeeAvg.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-blue-700">{total.toFixed(2)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBoardResults;