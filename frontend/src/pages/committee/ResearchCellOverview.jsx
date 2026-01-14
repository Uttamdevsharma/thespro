import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetResearchCellsQuery, useAddResearchCellMutation } from '../../features/apiSlice';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

const ResearchCellOverview = () => {
  const navigate = useNavigate();
  const { data: cells, isLoading: loadingCells, error: cellsError } = useGetResearchCellsQuery();
  const [addResearchCell] = useAddResearchCellMutation();

  const [showAddCellModal, setShowAddCellModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  if (loadingCells) {
    return <Loader />;
  }

  if (cellsError) {
    return <p className="text-red-500">Error loading research cells.</p>;
  }

  const handleCellCardClick = (cellId) => {
    navigate(`/committee/cell-members/${cellId}`);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCell = async (e) => {
    e.preventDefault();
    try {
      await addResearchCell(formData).unwrap();
      toast.success('Research Cell Added Successfully!');
      setFormData({ title: '', description: '' });
      setShowAddCellModal(false);
      // RTK Query invalidation handles re-fetching of research cells
    } catch (error) {
      toast.error(`Failed to add research cell: ${error.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Research Cell Overview</h1>

      <div className="mb-4">
        <button
          onClick={() => setShowAddCellModal(true)}
          className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add New Research Cell
        </button>
      </div>

      {cells && cells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cells.map((cell) => (
            <div
              key={cell._id}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCellCardClick(cell._id)}
            >
              <p className="text-xl font-bold">{cell.title}</p>
              <p className="text-sm text-gray-500 mt-2">Total Members: {cell.totalMembers}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No research cells found.</p>
      )}

      {/* Add New Research Cell Modal */}
      {showAddCellModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-5 border w-1/3 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Research Cell</h3>
            <form onSubmit={handleAddCell}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Cell Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCellModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Add Cell
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchCellOverview;
