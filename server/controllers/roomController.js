import asyncHandler from 'express-async-handler';
import Room from '../models/Room.js';

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Committee
const createRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;

  if (!name || !capacity) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const roomExists = await Room.findOne({ name });

  if (roomExists) {
    res.status(400);
    throw new Error('Room with that name already exists');
  }

  const room = await Room.create({
    name,
    capacity,
  });

  res.status(201).json(room);
});

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private/Committee
const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({});
  res.json(rooms);
});

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Private/Committee
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    res.json(room);
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Committee
const updateRoom = asyncHandler(async (req, res) => {
  const { name, capacity } = req.body;

  const room = await Room.findById(req.params.id);

  if (room) {
    room.name = name || room.name;
    room.capacity = capacity || room.capacity;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Committee
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    await room.deleteOne();
    res.json({ message: 'Room removed' });
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

export {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
