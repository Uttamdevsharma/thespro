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
  useGetAllDefenseBoardsQuery,
  useDeleteDefenseBoardMutation
} from '../../features/apiSlice';

// RoomManager Component
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

  const handleDelete = async (id) => await deleteRoom(id);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Room Manager</h2>
      <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4">
        Add Room
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start pt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Room' : 'Add Room'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Room Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required min={1} />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">{isEditing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? <p>Loading rooms...</p> : isError ? <p className="text-red-500">Error: {error.message}</p> : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Capacity</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room._id} className="text-center hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{room.name}</td>
                <td className="py-2 px-4 border-b">{room.capacity}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleOpenModal(room)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md mr-2">Edit</button>
                  <button onClick={() => handleDelete(room._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ScheduleManager Component
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

  const handleDelete = async (id) => await deleteScheduleSlot(id);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Schedule Manager</h2>
      <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4">
        Add Schedule Slot
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start pt-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Schedule Slot' : 'Add Schedule Slot'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleCloseModal} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">{isEditing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? <p>Loading schedule slots...</p> : isError ? <p className="text-red-500">Error: {error.message}</p> : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Start Time</th>
              <th className="py-2 px-4 border-b">End Time</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduleSlots.map(slot => (
              <tr key={slot._id} className="text-center hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{new Date(slot.date).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b">{slot.startTime}</td>
                <td className="py-2 px-4 border-b">{slot.endTime}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleOpenModal(slot)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md mr-2">Edit</button>
                  <button onClick={() => handleDelete(slot._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// DefenseSchedule Component
const DefenseSchedule = () => {
  const { data: defenseBoards, isLoading, isError, error } = useGetAllDefenseBoardsQuery();
  const [deleteDefenseBoard] = useDeleteDefenseBoardMutation();

  const handleDelete = async (id) => await deleteDefenseBoard(id);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Defense Schedule</h1>
      <Link to="/committee/defense-schedule/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mb-4 inline-block">
        Create Defense Board
      </Link>

      <RoomManager />
      <ScheduleManager />

      {isLoading ? <p>Loading defense boards...</p> : isError ? <p className="text-red-500">Error: {error.message}</p> : (
        <div className="mt-6 space-y-4">
          {defenseBoards.map(board => (
            <div key={board._id} className="p-4 bg-gray-50 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-700 font-medium">
                  Date: {new Date(board.date).toLocaleDateString()} | Room: {board.room ? board.room.name : 'N/A'} | Schedule: {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
                <button onClick={() => handleDelete(board._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md">Delete</button>
              </div>

              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-2 border-b">Sl.</th>
                    <th className="py-2 px-2 border-b">Student IDs</th>
                    <th className="py-2 px-2 border-b">Student Names</th>
                    <th className="py-2 px-2 border-b">Title</th>
                    <th className="py-2 px-2 border-b">Type</th>
                    <th className="py-2 px-2 border-b">Supervisor</th>
                    <th className="py-2 px-2 border-b">Course Supervisor</th>
                    <th className="py-2 px-2 border-b">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {board.groups.map((group, index) => (
                    <tr key={group._id} className="text-center hover:bg-gray-50">
                      <td className="py-2 px-2 border-b">{index + 1}</td>
                      <td className="py-2 px-2 border-b">{group.members.map(m => m.studentId).join(', ')}</td>
                      <td className="py-2 px-2 border-b">{group.members.map(m => m.name).join(', ')}</td>
                      <td className="py-2 px-2 border-b">{group.title}</td>
                      <td className="py-2 px-2 border-b">{group.type}</td>
                      <td className="py-2 px-2 border-b">{group.supervisorId?.name || '-'}</td>
                      <td className="py-2 px-2 border-b">{group.courseSupervisorId?.name || '-'}</td>
                      <td className="py-2 px-2 border-b">{board.comments.find(c => c.group === group._id)?.text || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-2 text-gray-700 font-semibold text-center">
                Board Members: {board.boardMembers.map(m => m.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefenseSchedule;
