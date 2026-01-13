import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useGetRoomsQuery, useGetScheduleSlotsQuery, useCreateDefenseBoardMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';

const CreateDefenseBoard = () => {
  const { data: rooms } = useGetRoomsQuery();
  const { data: scheduleSlots } = useGetScheduleSlotsQuery();
  const [createDefenseBoard] = useCreateDefenseBoardMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState(
    location.state?.defenseBoardDraft || {
      boardNumber: '',
      defenseType: 'Pre-Defense',
      room: '',
      schedule: '',
      groups: [],
      boardMembers: [],
    }
  );

  useEffect(() => {
    if (location.state?.defenseBoardDraft) {
      setFormData(location.state.defenseBoardDraft);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedSchedule = scheduleSlots.find(slot => slot._id === formData.schedule);
      if (!selectedSchedule) {
        toast.error('Please select a valid schedule.');
        return;
      }
      const dataToSubmit = { ...formData, date: selectedSchedule.date };
      await createDefenseBoard(dataToSubmit).unwrap();
      toast.success('Defense board created successfully.');
      navigate('/committee/defense-schedule');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Defense Board</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Board Number */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Board Number</label>
          <input
            type="text"
            name="boardNumber"
            value={formData.boardNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            required
          />
        </div>
        {/* Defense Type */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Defense Type</label>
          <select
            name="defenseType"
            value={formData.defenseType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          >
            <option value="Pre-Defense">Pre-Defense</option>
            <option value="Final Defense">Final Defense</option>
          </select>
        </div>

        {/* Room */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Room</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          >
            <option value="">Select Room</option>
            {rooms && rooms.map(room => (
              <option key={room._id} value={room._id}>{room.name}</option>
            ))}
          </select>
        </div>

        {/* Schedule */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">Schedule</label>
          <select
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          >
            <option value="">Select Schedule</option>
            {scheduleSlots && scheduleSlots.map(slot => (
              <option key={slot._id} value={slot._id}>
                {new Date(slot.date).toLocaleDateString()} {slot.startTime} - {slot.endTime}
              </option>
            ))}
          </select>
        </div>

        {/* Select Groups */}
        <div>
          <Link
            to="/committee/defense-schedule/select-groups"
            state={{ defenseBoardDraft: formData }}
            className="inline-block mb-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            Select Groups
          </Link>
          <div className="text-gray-600">Selected Groups: <span className="font-medium">{formData.groups.length}</span></div>
        </div>

        {/* Select Members */}
        <div>
          <Link
            to="/committee/defense-schedule/select-members"
            state={{ defenseBoardDraft: formData }}
            className="inline-block mb-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-200"
          >
            Select Members
          </Link>
          <div className="text-gray-600">Selected Members: <span className="font-medium">{formData.boardMembers.length}</span></div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            to="/committee/defense-schedule"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDefenseBoard;
