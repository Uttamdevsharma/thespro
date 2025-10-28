import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import DefenseBoard from '../models/DefenseBoard.js';
import User from '../models/User.js';
import Proposal from '../models/Proposal.js';
import ScheduleSlot from '../models/ScheduleSlot.js';

// @desc    Create a new defense board
// @route   POST /api/defenseboards
// @access  Private/Committee
const createDefenseBoard = asyncHandler(async (req, res) => {
  const { defenseType, room, schedule, groups, boardMembers } = req.body;

  if (!defenseType || !room || !schedule || !groups || !boardMembers) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  if (groups.length === 0 || groups.length > 5) {
    res.status(400);
    throw new Error('A defense board must have between 1 and 5 groups.');
  }

  if (boardMembers.length < 2 || boardMembers.length > 4) {
    res.status(400);
    throw new Error('A defense board must have between 2 and 4 board members.');
  }

  const scheduleSlot = await ScheduleSlot.findById(schedule);
  if (!scheduleSlot) {
    res.status(404);
    throw new Error('Schedule not found');
  }

  // Check for schedule conflicts
  const existingBoard = await DefenseBoard.findOne({ room, schedule, date: scheduleSlot.date });
  if (existingBoard) {
    res.status(400);
    throw new Error('A defense board already exists for this room, schedule, and date.');
  }

  const defenseBoard = new DefenseBoard({
    defenseType,
    room,
    schedule,
    date: scheduleSlot.date,
    groups,
    boardMembers,
    createdBy: req.user._id,
    logs: [{ action: 'CREATED', user: req.user._id }],
  });

  const createdDefenseBoard = await defenseBoard.save();
  res.status(201).json(createdDefenseBoard);
});

// @desc    Get all defense boards
// @route   GET /api/defenseboards
// @access  Private/Committee, Supervisor, Student
const getAllDefenseBoards = asyncHandler(async (req, res) => {
  let defenseBoards = await DefenseBoard.find({})
    .populate('room', 'name')
    .populate('schedule', 'startTime endTime')
    .populate({
      path: 'groups',
      strictPopulate: false,
      populate: [
        { path: 'createdBy', select: 'name studentId' },
        { path: 'members', select: 'name studentId' },
        { path: 'supervisorId', select: 'name' },
        { path: 'courseSupervisorId', select: 'name' },
      ],
    })
    .populate('boardMembers', 'name email')
    .populate('createdBy', 'name email');

  // Filter out boards with null-populated fields that are essential
  defenseBoards = defenseBoards.filter(board => board.room && board.schedule);

  res.json(defenseBoards);
});

// @desc    Get single defense board by ID
// @route   GET /api/defenseboards/:id
// @access  Private/Committee, Supervisor, Student
const getDefenseBoardById = asyncHandler(async (req, res) => {
  const defenseBoard = await DefenseBoard.findById(req.params.id)
    .populate('room', 'name')
    .populate('schedule', 'startTime endTime')
    .populate({
      path: 'groups',
      strictPopulate: false,
      populate: [
        { path: 'createdBy', select: 'name studentId' },
        { path: 'members', select: 'name studentId' },
        { path: 'supervisorId', select: 'name' },
        { path: 'courseSupervisorId', select: 'name' },
      ],
    })
    .populate('boardMembers', 'name email')
    .populate('createdBy', 'name email');

  if (defenseBoard) {
    res.json(defenseBoard);
  } else {
    res.status(404);
    throw new Error('Defense board not found');
  }
});

// @desc    Update a defense board
// @route   PUT /api/defenseboards/:id
// @access  Private/Committee
const updateDefenseBoard = asyncHandler(async (req, res) => {
  const { defenseType, room, schedule, date, groups, boardMembers } = req.body;

  const defenseBoard = await DefenseBoard.findById(req.params.id);

  if (defenseBoard) {
    defenseBoard.defenseType = defenseType || defenseBoard.defenseType;
    defenseBoard.room = room || defenseBoard.room;
    defenseBoard.schedule = schedule || defenseBoard.schedule;
    defenseBoard.date = date || defenseBoard.date;

    if (groups) {
      if (groups.length === 0 || groups.length > 5) {
        res.status(400);
        throw new Error('A defense board must have between 1 and 5 groups.');
      }
      defenseBoard.groups = groups;
    }

    if (boardMembers) {
      if (boardMembers.length < 2 || boardMembers.length > 4) {
        res.status(400);
        throw new Error('A defense board must have between 2 and 4 board members.');
      }
      defenseBoard.boardMembers = boardMembers;
    }

    defenseBoard.logs.push({ action: 'UPDATED', user: req.user._id });

    const updatedDefenseBoard = await defenseBoard.save();
    res.json(updatedDefenseBoard);
  } else {
    res.status(404);
    throw new Error('Defense board not found');
  }
});

// @desc    Delete a defense board
// @route   DELETE /api/defenseboards/:id
// @access  Private/Committee
const deleteDefenseBoard = asyncHandler(async (req, res) => {
  const defenseBoard = await DefenseBoard.findById(req.params.id);

  if (defenseBoard) {
    await defenseBoard.deleteOne();
    res.json({ message: 'Defense board removed' });
  } else {
    res.status(404);
    throw new Error('Defense board not found');
  }
});

// @desc    Get defense boards for a specific supervisor
// @route   GET /api/defenseboards/supervisor-schedule
// @access  Private/Supervisor
const getSupervisorDefenseSchedule = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  // 1. Find the initial boards and populate top-level fields
  const defenseBoards = await DefenseBoard.find({ boardMembers: supervisorId })
    .populate('room', 'name')
    .populate('schedule', 'startTime endTime')
    .populate('boardMembers', 'name email')
    .populate('createdBy', 'name email')
    .lean(); // Use .lean() for performance and easier manipulation

  if (!defenseBoards || defenseBoards.length === 0) {
    return res.json([]);
  }

  // 2. Manually populate the groups and their nested user fields for each board
  for (const board of defenseBoards) {
    if (board.groups && board.groups.length > 0) {
      const populatedGroups = [];
      for (const groupId of board.groups) {
        // Find each proposal (group) and populate its user fields
        const group = await Proposal.findById(groupId)
          .populate('supervisorId', 'name')
          .populate('courseSupervisorId', 'name')
          .populate('members', 'name studentId')
          .populate('createdBy', 'name studentId')
          .lean();
        
        // Only add the group if it was found
        if (group) {
          populatedGroups.push(group);
        }
      }
      board.groups = populatedGroups;
    }
  }

  // 3. Filter out boards that might have had their essential references (like room or schedule) deleted
  // const finalBoards = defenseBoards.filter(board => board.room && board.schedule);
  const finalBoards = defenseBoards; // Temporarily keep all boards for debugging

  res.json(finalBoards);
});



// @desc    Get defense boards for a specific student
// @route   GET /api/defenseboards/student-schedule
// @access  Private/Student
const getStudentDefenseSchedule = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const studentId = req.user._id;

  try {
    // Find proposals where the student is either the creator or a member
    const studentProposals = await Proposal.find({
      $or: [{ createdBy: studentId }, { members: studentId }],
    }).select('_id');

    const proposalIds = studentProposals.map((p) => p._id);

    let defenseBoards = await DefenseBoard.find({ groups: { $in: proposalIds } })
      .populate('room', 'name')
      .populate('schedule', 'startTime endTime')
      .populate({
        path: 'groups',
        strictPopulate: false,
        populate: [
          { path: 'createdBy', select: 'name studentId' },
          { path: 'members', select: 'name studentId' },
          { path: 'supervisorId', select: 'name' },
          { path: 'courseSupervisorId', select: 'name' },
        ],
      })
      .populate('boardMembers', 'name email')
      .populate('createdBy', 'name email');

    // Filter out boards with null-populated fields that are essential
    defenseBoards = defenseBoards.filter(board => board.room && board.schedule);

    res.json(defenseBoards);
  } catch (error) {
    console.error('Error in getStudentDefenseSchedule:', error);
    res.status(500);
    throw new Error(`Failed to fetch student defense schedule: ${error.message}`);
  }
});

// @desc    Add/Update comment for a group within a defense board
// @route   PUT /api/defenseboards/:id/comments
// @access  Private/Supervisor
const addOrUpdateComment = asyncHandler(async (req, res) => {
  const { id: defenseBoardId } = req.params;
  const { groupId, text } = req.body;

  const defenseBoard = await DefenseBoard.findById(defenseBoardId);

  if (defenseBoard) {
    const commentIndex = defenseBoard.comments.findIndex(
      (comment) => comment.group.toString() === groupId
    );

    if (commentIndex > -1) {
      defenseBoard.comments[commentIndex].text = text;
      defenseBoard.comments[commentIndex].commentedBy = req.user._id;
    } else {
      defenseBoard.comments.push({ group: groupId, text, commentedBy: req.user._id });
    }

    defenseBoard.logs.push({ action: 'COMMENTED', user: req.user._id });

    const updatedDefenseBoard = await defenseBoard.save();
    res.json(updatedDefenseBoard);
  } else {
    res.status(404);
    throw new Error('Defense board not found');
  }
});

export {
  createDefenseBoard,
  getAllDefenseBoards,
  getDefenseBoardById,
  updateDefenseBoard,
  deleteDefenseBoard,
  getSupervisorDefenseSchedule,
  getStudentDefenseSchedule,
  addOrUpdateComment,
};