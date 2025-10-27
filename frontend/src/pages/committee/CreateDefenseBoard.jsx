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

  const [formData, setFormData] = useState(location.state?.defenseBoardDraft || { defenseType: 'Pre-Defense', room: '', schedule: '', groups: [], boardMembers: [] });

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Defense Board</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label className="block text-gray-700">Defense Type</label>
          <select name="defenseType" value={formData.defenseType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
            <option value="Pre-Defense">Pre-Defense</option>
            <option value="Final Defense">Final Defense</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Room</label>
          <select name="room" value={formData.room} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select Room</option>
            {rooms && rooms.map(room => <option key={room._id} value={room._id}>{room.name}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Schedule</label>
          <select name="schedule" value={formData.schedule} onChange={handleChange} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select Schedule</option>
            {scheduleSlots && scheduleSlots.map(slot => <option key={slot._id} value={slot._id}>{new Date(slot.date).toLocaleDateString()} {slot.startTime} - {slot.endTime}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <Link to="/committee/defense-schedule/select-groups" state={{ defenseBoardDraft: formData }} className="bg-blue-500 text-white px-4 py-2 rounded-md">Select Groups</Link>
          <div>Selected Groups: {formData.groups.length}</div>
        </div>
        <div className="mb-4">
          <Link to="/committee/defense-schedule/select-members" state={{ defenseBoardDraft: formData }} className="bg-blue-500 text-white px-4 py-2 rounded-md">Select Members</Link>
          <div>Selected Members: {formData.boardMembers.length}</div>
        </div>
        <div className="flex justify-end">
          <Link to="/committee/defense-schedule" className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">Cancel</Link>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateDefenseBoard;
