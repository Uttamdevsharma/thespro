import React, { useState } from 'react';
import { useGetRoomsQuery, useAddRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation, useGetScheduleSlotsQuery, useAddScheduleSlotMutation, useUpdateScheduleSlotMutation, useDeleteScheduleSlotMutation, useGetAllDefenseBoardsQuery, useCreateDefenseBoardMutation, useUpdateDefenseBoardMutation, useDeleteDefenseBoardMutation, useGetProposalsQuery, useGetTeachersQuery } from '../../features/apiSlice';

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateRoom({ id: currentRoom._id, ...formData });
    } else {
      await addRoom(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    await deleteRoom(id);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Room Manager</h2>
      <button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Add Room</button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold">{isEditing ? 'Edit Room' : 'Add Room'}</h3>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700">Room Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">{isEditing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Loading rooms...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Capacity</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id} className="text-center">
                <td className="py-2">{room.name}</td>
                <td className="py-2">{room.capacity}</td>
                <td className="py-2">
                  <button onClick={() => handleOpenModal(room)} className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2">Edit</button>
                  <button onClick={() => handleDelete(room._id)} className="bg-red-500 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

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
      setFormData({ date: new Date(slot.date).toISOString().split('T')[0], startTime: slot.startTime, endTime: slot.endTime });
    } else {
      setIsEditing(false);
      setCurrentSlot(null);
      setFormData({ date: '', startTime: '', endTime: '' });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateScheduleSlot({ id: currentSlot._id, ...formData });
    } else {
      await addScheduleSlot(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    await deleteScheduleSlot(id);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Schedule Manager</h2>
      <button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Add Schedule Slot</button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold">{isEditing ? 'Edit Schedule Slot' : 'Add Schedule Slot'}</h3>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleCloseModal} className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">{isEditing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Loading schedule slots...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Date</th>
              <th className="py-2">Start Time</th>
              <th className="py-2">End Time</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduleSlots.map((slot) => (
              <tr key={slot._id} className="text-center">
                <td className="py-2">{new Date(slot.date).toLocaleDateString()}</td>
                <td className="py-2">{slot.startTime}</td>
                <td className="py-2">{slot.endTime}</td>
                <td className="py-2">
                  <button onClick={() => handleOpenModal(slot)} className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2">Edit</button>
                  <button onClick={() => handleDelete(slot._id)} className="bg-red-500 text-white px-2 py-1 rounded-md">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

import { Link } from 'react-router-dom';

const DefenseSchedule = () => {
  const { data: defenseBoards, isLoading, isError, error } = useGetAllDefenseBoardsQuery();
  const [deleteDefenseBoard] = useDeleteDefenseBoardMutation();

  const handleDelete = async (id) => {
    await deleteDefenseBoard(id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Defense Schedule</h1>
      <Link to="/committee/defense-schedule/create" className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">Create Defense Board</Link>
      <RoomManager />
      <ScheduleManager />
      {isLoading ? (
        <p>Loading defense boards...</p>
      ) : isError ? (
        <p>Error: {error.message}</p>
      ) : (
        <div>
          {defenseBoards && defenseBoards.map(board => (
            <div key={board._id} className="p-4 bg-gray-100 rounded-lg shadow-md mt-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold">Date:</span> {new Date(board.date).toLocaleDateString()} | <span className="font-bold">Room:</span> {board.room ? board.room.name : 'N/A'} | <span className="font-bold">Schedule:</span> {board.schedule ? `${board.schedule.startTime} - ${board.schedule.endTime}` : 'N/A'}
                </div>
                <div>
                  <button onClick={() => handleDelete(board._id)} className="bg-red-500 text-white px-2 py-1 rounded-md">Delete</button>
                </div>
              </div>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Sl.</th>
                    <th className="py-2">Student IDs</th>
                    <th className="py-2">Student Names</th>
                    <th className="py-2">Thesis/Project Title</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Supervisor</th>
                    <th className="py-2">Course Supervisor</th>
                    <th className="py-2">Members</th>
                    <th className="py-2">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {board.groups.map((group, index) => (
                    <tr key={group._id} className="text-center">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{group.members.map(m => m.studentId).join(', ')}</td>
                      <td className="py-2">{group.members.map(m => m.name).join(', ')}</td>
                      <td className="py-2">{group.title}</td>
                      <td className="py-2">{group.proposalType}</td>
                      <td className="py-2">{group.supervisorId ? group.supervisorId.name : '-'}</td>
                      <td className="py-2">{group.courseSupervisorId ? group.courseSupervisorId.name : '-'}</td>
                      <td className="py-2">{board.boardMembers.map(m => m.name).join(', ')}</td>
                      <td className="py-2">{board.comments.find(c => c.group === group._id)?.text || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefenseSchedule;
