import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetResearchCellsQuery } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import { Layers } from 'lucide-react';

const CellMembers = () => {
  const navigate = useNavigate();
  const { data: researchCells, isLoading, isError, error } = useGetResearchCellsQuery();

  if (isLoading) return <Loader />;
  if (isError) return <div className="text-red-500">Error: {error?.data?.message || error?.error}</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Research Cell Overview</h1>

      {researchCells && researchCells.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {researchCells.map(cell => (
            <div
              key={cell._id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-start hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/committee/cell-members/${cell._id}`)}
            >
              <div className="text-indigo-600 mb-3">
                <Layers size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{cell.title}</h2>
              <p className="text-sm text-gray-600 mb-4 flex-grow">{cell.description}</p>
              {/* Note: Total Members count is not directly available from useGetResearchCellsQuery response.
                  It would require either modifying the backend to include this, or fetching all teachers
                  and counting those assigned to this cell. For now, displaying a placeholder or omitting.
                  I will omit for now.
              */}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500 text-lg font-medium italic">
          No research cells found.
        </div>
      )}
    </div>
  );
};

export default CellMembers;