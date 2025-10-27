import asyncHandler from 'express-async-handler';
import ScheduleSlot from '../models/ScheduleSlot.js';

// @desc    Create a new schedule slot
// @route   POST /api/schedule-slots
// @access  Private/Committee
const createScheduleSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const scheduleSlotExists = await ScheduleSlot.findOne({ date, startTime, endTime });

  if (scheduleSlotExists) {
    res.status(400);
    throw new Error('Schedule slot already exists');
  }

  const scheduleSlot = await ScheduleSlot.create({
    date,
    startTime,
    endTime,
  });

  res.status(201).json(scheduleSlot);
});

// @desc    Get all schedule slots
// @route   GET /api/schedule-slots
// @access  Private/Committee
const getAllScheduleSlots = asyncHandler(async (req, res) => {
  const scheduleSlots = await ScheduleSlot.find({});
  res.json(scheduleSlots);
});

// @desc    Get single schedule slot by ID
// @route   GET /api/schedule-slots/:id
// @access  Private/Committee
const getScheduleSlotById = asyncHandler(async (req, res) => {
  const scheduleSlot = await ScheduleSlot.findById(req.params.id);

  if (scheduleSlot) {
    res.json(scheduleSlot);
  } else {
    res.status(404);
    throw new Error('Schedule slot not found');
  }
});

// @desc    Update a schedule slot
// @route   PUT /api/schedule-slots/:id
// @access  Private/Committee
const updateScheduleSlot = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;

  const scheduleSlot = await ScheduleSlot.findById(req.params.id);

  if (scheduleSlot) {
    scheduleSlot.date = date || scheduleSlot.date;
    scheduleSlot.startTime = startTime || scheduleSlot.startTime;
    scheduleSlot.endTime = endTime || scheduleSlot.endTime;

    const updatedScheduleSlot = await scheduleSlot.save();
    res.json(updatedScheduleSlot);
  } else {
    res.status(404);
    throw new Error('Schedule slot not found');
  }
});

// @desc    Delete a schedule slot
// @route   DELETE /api/schedule-slots/:id
// @access  Private/Committee
const deleteScheduleSlot = asyncHandler(async (req, res) => {
  const scheduleSlot = await ScheduleSlot.findById(req.params.id);

  if (scheduleSlot) {
    await scheduleSlot.deleteOne();
    res.json({ message: 'Schedule slot removed' });
  } else {
    res.status(404);
    throw new Error('Schedule slot not found');
  }
});

export {
  createScheduleSlot,
  getAllScheduleSlots,
  getScheduleSlotById,
  updateScheduleSlot,
  deleteScheduleSlot,
};
