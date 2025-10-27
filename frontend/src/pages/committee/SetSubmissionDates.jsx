import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/userSlice';
import toast from 'react-hot-toast';

const SetSubmissionDates = () => {
  const user = useSelector(selectUser);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentDates, setCurrentDates] = useState(null);

  useEffect(() => {
    const fetchSubmissionDates = async () => {
      if (!user || !user.token) return;
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      try {
const { data } = await axios.get('http://localhost:5005/api/committee/submission-dates', config);
        setCurrentDates(data);
      } catch (error) {
        // No active dates found is a valid scenario
        if (error.response && error.response.status === 404) {
          setCurrentDates(null);
        } else {
          toast.error('Failed to fetch submission dates.');
          console.error(error);
        }
      }
    };
    fetchSubmissionDates();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) return toast.error('User not logged in.');
    if (!startDate || !endDate) return toast.error('Please select both start and end dates.');

    const config = {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
    };

    try {
      await axios.post('http://localhost:5005/api/committee/submission-dates', { startDate, endDate }, config);
      toast.success('Submission dates set successfully!');
      // Refresh current dates
      const { data } = await axios.get('http://localhost:5005/api/committee/submission-dates', config);
      setCurrentDates(data);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      toast.error(`Failed to set submission dates: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Set Proposal Submission Dates</h1>

      {currentDates && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Current Active Submission Period:</p>
          <p>Start Date: {new Date(currentDates.startDate).toLocaleDateString()}</p>
          <p>End Date: {new Date(currentDates.endDate).toLocaleDateString()}</p>
          <p className="text-sm mt-2">Setting new dates will deactivate the current period.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          Set Dates
        </button>
      </form>
    </div>
  );
};

export default SetSubmissionDates;
