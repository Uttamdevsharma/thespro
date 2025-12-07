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

  // Update defenseBoardId for all proposals in this group
  for (const proposalId of groups) {
    await Proposal.findByIdAndUpdate(proposalId, { defenseBoardId: createdDefenseBoard._id });
  }

  res.status(201).json(createdDefenseBoard);
});

// @desc    Get all defense boards
// @route   GET /api/defenseboards
// @access  Private/Committee, Supervisor, Student
const getAllDefenseBoards = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  let query = {};

  if (filter === 'current') {
    // Only show boards with a date in the future or today
    query.date = { $gte: new Date().setHours(0, 0, 0, 0) };
  }

  let defenseBoards = await DefenseBoard.find(query)
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
    .populate('createdBy', 'name email')
    .populate({
      path: 'comments.commentedBy',
      select: 'name',
    });

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

      // Find proposals that were removed from the board
      const removedProposalIds = defenseBoard.groups.filter(oldId => !groups.includes(oldId.toString()));
      // Set defenseBoardId to null for removed proposals
      for (const proposalId of removedProposalIds) {
        await Proposal.findByIdAndUpdate(proposalId, { defenseBoardId: null });
      }

      // Find proposals that were added to the board
      const addedProposalIds = groups.filter(newId => !defenseBoard.groups.map(oldId => oldId.toString()).includes(newId));
      // Set defenseBoardId to this defense board's ID for added proposals
      for (const proposalId of addedProposalIds) {
        await Proposal.findByIdAndUpdate(proposalId, { defenseBoardId: defenseBoard._id });
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
    // Set defenseBoardId to null for all associated proposals
    for (const proposalId of defenseBoard.groups) {
      await Proposal.findByIdAndUpdate(proposalId, { defenseBoardId: null });
    }

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
  const { defenseType } = req.query; // Get defenseType from query parameters

  let query = { boardMembers: supervisorId };

  if (defenseType) {
    query.defenseType = defenseType; // Add defenseType to the query if provided
  }

  // 1. Find the initial boards and populate top-level fields
  const defenseBoards = await DefenseBoard.find(query)
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
  const { defenseType } = req.query; // Get defenseType from query parameters

  console.log('getStudentDefenseSchedule: studentId=', studentId, 'defenseType=', defenseType);

  try {
    // Find proposals where the student is either the creator or a member
    const studentProposals = await Proposal.find({
      $or: [{ createdBy: studentId }, { members: studentId }],
    }).select('_id');

    const proposalIds = studentProposals.map((p) => p._id);

    let query = { groups: { $in: proposalIds } };

    if (defenseType) {
      query.defenseType = defenseType; // Add defenseType to the query if provided
    }
    console.log('getStudentDefenseSchedule: Constructed query=', query);

    let defenseBoards = await DefenseBoard.find(query)
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
      .populate('createdBy', 'name email')
      .populate({
        path: 'comments.commentedBy',
        select: 'name',
      });

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

    const updatedDefenseBoard = await defenseBoard.save();

    // Get Socket.io instance
    const io = req.app.get('socketio');
    // Emit event to all connected clients
    io.emit('commentUpdated', { defenseBoardId: updatedDefenseBoard._id, groupId, text, commentedBy: req.user._id });

    res.json(updatedDefenseBoard);
  } else {
    res.status(404);
    throw new Error('Defense board not found');
  }
});

// @desc    Get defense results for a specific supervisor
// @route   GET /api/defenseboards/supervisor-results
// @access  Private/Supervisor
const getSupervisorDefenseResult = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;
  const { defenseType, filter } = req.query; // Get defenseType and filter from query parameters

  console.log('getSupervisorDefenseResult: supervisorId=', supervisorId, 'defenseType=', defenseType, 'supervisionFilter=', filter);

  let boardQuery = {};
  if (defenseType) {
    boardQuery.defenseType = defenseType;
  }

  // 1. Find proposals directly supervised by the logged-in supervisor
  let proposalQuery = { status: 'Approved' };

  if (filter === 'my_supervision') {
    proposalQuery.$and = [
      { supervisorId: supervisorId },
      { courseSupervisorId: null },
    ];
  } else if (filter === 'my_course_supervision') {
    proposalQuery.courseSupervisorId = supervisorId;
  } else { // 'all' or no filter
    proposalQuery.$or = [
      { supervisorId: supervisorId },
      { courseSupervisorId: supervisorId },
    ];
  }

  const directProposals = await Proposal.find(proposalQuery).select('_id');

  const directProposalIds = directProposals.map(p => p._id);

  // 2. Find proposals supervised by course supervisors under the logged-in supervisor
  // 2a. Find course supervisors under the logged-in supervisor
  const courseSupervisorsUnderMe = await User.find({
    mainSupervisor: supervisorId,
    isCourseSupervisor: true
  }).select('_id');

  const courseSupervisorIds = courseSupervisorsUnderMe.map(cs => cs._id);

  // 2b. Find proposals where courseSupervisorId is one of these course supervisor IDs
  const indirectProposals = await Proposal.find({
    courseSupervisorId: { $in: courseSupervisorIds }
  }).select('_id');

  const indirectProposalIds = indirectProposals.map(p => p._id);

  // 3. Combine all unique proposal IDs
  const allRelevantProposalIds = [...new Set([...directProposalIds, ...indirectProposalIds])];

  if (allRelevantProposalIds.length === 0) {
    console.log('getSupervisorDefenseResult: No relevant proposals found.');
    return res.json([]);
  }

  // 4. Find DefenseBoards associated with these proposals
  // We need to find boards that contain any of these proposals in their 'groups' array
  boardQuery.groups = { $in: allRelevantProposalIds };

  console.log('getSupervisorDefenseResult: Final boardQuery=', boardQuery);

  const defenseBoards = await DefenseBoard.find(boardQuery)
    .populate('room', 'name')
    .populate('schedule', 'startTime endTime')
    .populate('boardMembers', 'name email')
    .populate('createdBy', 'name email')
    .lean(); // Use .lean() for performance

  if (!defenseBoards || defenseBoards.length === 0) {
    console.log('getSupervisorDefenseResult: No defense boards found for the query.');
    return res.json([]);
  }

  // 5. Manually populate the groups and their nested user fields for each board
  // and filter to only include relevant groups for this supervisor
  const finalResults = [];

  for (const board of defenseBoards) {
    const boardCopy = { ...board }; // Create a copy to modify
    const populatedGroups = [];

    for (const groupId of board.groups) {
      // Only process groups that are relevant to this supervisor
      if (allRelevantProposalIds.includes(groupId.toString())) {
        const group = await Proposal.findById(groupId)
          .populate('supervisorId', 'name')
          .populate('courseSupervisorId', 'name')
          .populate('members', 'name studentId')
          .populate('createdBy', 'name studentId')
          .lean();

        if (group) {
          populatedGroups.push(group);
        }
      }
    }
    boardCopy.groups = populatedGroups;

    // Only include the board if it still has relevant groups after filtering
    if (boardCopy.groups.length > 0) {
      finalResults.push(boardCopy);
    }
  }

  // Filter out boards that might have had their essential references (like room or schedule) deleted
  const filteredResults = finalResults.filter(board => board.room && board.schedule);

  console.log('getSupervisorDefenseResult: Sending final results count=', filteredResults.length);
  res.json(filteredResults);
});

// @desc    Get defense boards where the supervisor is a committee member
// @route   GET /api/defenseboards/my-committee-evaluations
// @access  Private/Supervisor
const getMyCommitteeEvaluations = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  const defenseBoards = await DefenseBoard.find({ boardMembers: supervisorId })
    .populate({
      path: 'groups',
      populate: {
        path: 'members',
        select: 'name email'
      }
    })
    .populate('room', 'name')
    .populate('schedule', 'startTime endTime');

  res.json(defenseBoards);
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
  getSupervisorDefenseResult,
  getMyCommitteeEvaluations,
};