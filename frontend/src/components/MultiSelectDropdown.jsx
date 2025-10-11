import React, { useState, useEffect, useRef } from 'react';

const MultiSelectDropdown = ({ allStudents, members, setMembers, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  console.log('allStudents:', allStudents);
  console.log('currentUser:', currentUser);

  const handleCheckboxChange = (student) => {
    if (members.some(member => member._id === student._id)) {
      setMembers(members.filter((member) => member._id !== student._id));
    } else {
      if (members.length < 2) {
        setMembers([...members, student]);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedStudentNames = members
    .map(student => student.name)
    .join(', ');

  return (
    <div className="relative" ref={dropdownRef}>
      <label htmlFor="members" className="block text-sm font-medium text-gray-700">Group Members (Select up to 2)</label>
      <div 
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer h-10 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedStudentNames || 'Select members...'}</span>
        <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul>
            {allStudents
              .filter(student => student._id !== currentUser?._id)
              .map((student) => (
                <li key={student._id} className="px-3 py-2 hover:bg-gray-100">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={members.some(member => member._id === student._id)}
                      onChange={() => handleCheckboxChange(student)}
                      disabled={members.length >= 2 && !members.some(member => member._id === student._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out disabled:opacity-50"
                    />
                    <span>{student.name}</span>
                  </label>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;