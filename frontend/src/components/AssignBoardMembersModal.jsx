import React, { useState, useEffect } from 'react';

const AssignBoardMembersModal = ({ show, onClose, teachers, selectedBoardMemberIds, setSelectedBoardMemberIds }) => {
  const [localSelectedIds, setLocalSelectedIds] = useState(selectedBoardMemberIds);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalSelectedIds(selectedBoardMemberIds);
  }, [selectedBoardMemberIds]);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setLocalSelectedIds(prev => {
      if (checked) {
        if (prev.length < 4) {
          return [...prev, value];
        } else {
          alert('You can select a maximum of 4 board members.');
          return prev; // Do not add if already 4 selected
        }
      } else {
        return prev.filter(id => id !== value);
      }
    });
  };

  const handleSave = () => {
    if (localSelectedIds.length < 2 || localSelectedIds.length > 4) {
      alert('Please select between 2 and 4 board members.');
      return;
    }
    setSelectedBoardMemberIds(localSelectedIds);
    onClose();
  };

  const filteredTeachers = teachers?.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Assign Board Members</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by supervisor name..."
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Selected: {localSelectedIds.length} / Min: 2, Max: 4
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers && filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className={localSelectedIds.includes(teacher._id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      value={teacher._id}
                      checked={localSelectedIds.includes(teacher._id)}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {localSelectedIds.includes(teacher._id) ? '✅ Assigned' : '⬜ Not Assigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleSave}
          >
            Save Selection
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBoardMembersModal;
