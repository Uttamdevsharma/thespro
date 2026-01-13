import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetRoomsQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetScheduleSlotsQuery,
  useAddScheduleSlotMutation,
  useUpdateScheduleSlotMutation,
  useDeleteScheduleSlotMutation,
} from '../../features/apiSlice';

// --- RoomManager Component ---
const RoomManager = () => {
  const { data: rooms, isLoading, isError, error } = useGetRoomsQuery();
  const [addRoom] = useAddRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: 5 });

  const handleOpenModal = (room = null) => {
    setIsModalOpen(true);
    if (room) {
      setIsEditing(true);
      setCurrentRoom(room);
      setFormData({ name: room.name, capacity: room.capacity });
    } else {
      setIsEditing(false);
      setCurrentRoom(null);
      setFormData({ name: '', capacity: 5 });
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) await updateRoom({ id: currentRoom._id, ...formData });
    else await addRoom(formData);
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      await deleteRoom(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Room Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Configure available rooms and their group capacity</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <span className="text-lg">+</span> Add Room
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Room' : 'Add New Room'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Room Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} 
                  placeholder="e.g. Room 402"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Capacity (Groups)</label>
                <input 
                  type="number" name="capacity" value={formData.capacity} onChange={handleChange} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required min={1} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">
                  {isEditing ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 font-bold">Loading rooms...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Room Name</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Capacity</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rooms?.map(room => (
                <tr key={room._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-800">{room.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs font-bold border border-indigo-100">
                      {room.capacity} Groups
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-4">
                    <button onClick={() => handleOpenModal(room)} className="text-blue-600 hover:underline font-bold text-sm transition-all">Edit</button>
                    <button onClick={() => handleDelete(room._id)} className="text-red-500 hover:underline font-bold text-sm transition-all">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// --- ScheduleManager Component ---
const ScheduleManager = () => {
  const { data: scheduleSlots, isLoading, isError, error } = useGetScheduleSlotsQuery();
  const [addScheduleSlot] = useAddScheduleSlotMutation();
  const [updateScheduleSlot] = useUpdateScheduleSlotMutation();
  const [deleteScheduleSlot] = useDeleteScheduleSlotMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });

  const handleOpenModal = (slot = null) => {
    setIsModalOpen(true);
    if (slot) {
      setIsEditing(true);
      setCurrentSlot(slot);
      setFormData({
        date: new Date(slot.date).toISOString().split('T')[0],
        startTime: slot.startTime,
        endTime: slot.endTime
      });
    } else {
      setIsEditing(false);
      setCurrentSlot(null);
      setFormData({ date: '', startTime: '', endTime: '' });
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) await updateScheduleSlot({ id: currentSlot._id, ...formData });
    else await addScheduleSlot(formData);
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule slot?')) {
      await deleteScheduleSlot(id);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Schedule Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Manage time slots for defense boards</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          + Add Time Slot
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Time Slot' : 'New Schedule Slot'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">
                  {isEditing ? 'Save Changes' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Defense Date</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Time Duration</th>
              <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {scheduleSlots?.map(slot => (
              <tr key={slot._id} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-6 text-gray-800 font-bold">
                  {new Date(slot.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center bg-gray-100 text-gray-700 px-4 py-1 rounded-md text-sm font-bold border border-gray-200">
                    {slot.startTime} — {slot.endTime}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-4">
                  <button onClick={() => handleOpenModal(slot)} className="text-blue-600 hover:underline font-bold text-sm transition-all">Edit</button>
                  <button onClick={() => handleDelete(slot._id)} className="text-red-500 hover:underline font-bold text-sm transition-all">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main DefenseSchedule Component ---
const DefenseSchedule = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-600 tracking-tight">Current Defense Schedule</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage rooms and time slots for academic student defenses</p>
          </div>
          <Link 
            to="/committee/defense-schedule/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            Create Defense Board <span>→</span>
          </Link>
        </header>

        <div className="space-y-10">
          <RoomManager />
          <ScheduleManager />
        </div>
      </div>
    </div>
  );
};

export default DefenseSchedule;