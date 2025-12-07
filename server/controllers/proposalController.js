import Proposal from '../models/Proposal.js';
import User from '../models/User.js';
import ResearchCell from '../models/ResearchCell.js';
import stringSimilarity from 'string-similarity';
import asyncHandler from 'express-async-handler';
import DefenseBoard from '../models/DefenseBoard.js';

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private (Student)
const createProposal = asyncHandler(async (req, res) => {
  const { title, abstract, type, researchCellId, supervisorId, members } = req.body;

  const createdBy = req.user._id;
  const department = req.user.department;

  const supervisor = await User.findById(supervisorId);
  if (!supervisor) {
    res.status(404);
    throw new Error('Supervisor not found.');
  }

  const courseSupervisors = await User.find({ mainSupervisor: supervisor._id, isCourseSupervisor: true });
  const maxGroupCapacity = 5 + (courseSupervisors.length * 10);

  if (supervisor.currentGroupCount >= maxGroupCapacity) {
    res.status(400);
    throw new Error('Supervisor has reached their maximum group capacity.');
  }

  supervisor.currentGroupCount += 1;
  await supervisor.save();

  const existingProposals = await Proposal.find({ supervisorId });
  const newTitle = title.toLowerCase().replace(/[\s\p{P}]+/gu, "");

  for (const existingProposal of existingProposals) {
    const existingTitle = existingProposal.title.toLowerCase().replace(/[\s\p{P}]+/gu, "");
    const similarity = stringSimilarity.compareTwoStrings(newTitle, existingTitle);

    if (similarity > 0.8) {
      res.status(400);
      throw new Error('A similar project title already exists under this supervisor. Please modify your title and try again.');
    }
  }

  const researchCell = await ResearchCell.findById(researchCellId);
  if (!researchCell) {
    res.status(400);
    throw new Error('Research cell not found.');
  }

  const proposal = await Proposal.create({
    title,
    abstract,
    type,
    researchCellId,
    supervisorId,
    members: [createdBy, ...members],
    numberOfMembers: [createdBy, ...members].length,
    createdBy,
    department,
    status: 'Pending Committee',
  });

  res.status(201).json(proposal);
});

// @desc    Get proposals for the current supervisor
// @route   GET /api/proposals/supervisor-proposals
// @access  Private (Supervisor)
const getSupervisorProposals = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  const supervisorId = req.user._id;
  let query = {};

  if (filter === 'my_supervision') {
    query = { supervisorId: supervisorId, courseSupervisorId: null, status: 'Approved' };
  } else if (filter === 'my_supervision_with_course_supervision') {
    query = { supervisorId: supervisorId, courseSupervisorId: { $ne: null }, status: 'Approved' };
  } else if (filter === 'my_course_supervision') {
    query = { courseSupervisorId: supervisorId, status: 'Approved' };
  } else {
    query = {
      $or: [
        { supervisorId: supervisorId },
        { courseSupervisorId: supervisorId }
      ],
      status: { $nin: ['Pending Committee', 'Pending Supervisor', 'Not Approved'] }
    };
  }

  const proposals = await Proposal.find(query)
    .populate('createdBy', 'name email studentId currentCGPA')
    .populate('supervisorId', 'name email')
    .populate('researchCellId', 'title')
    .populate('members', 'name email studentId currentCGPA');

  res.json(proposals);
});

// @desc    Get pending proposals for the current supervisor
// @route   GET /api/proposals/supervisor-pending-proposals
// @access  Private (Supervisor)
const getSupervisorPendingProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({
    supervisorId: req.user._id,
    status: { $in: ['Pending Committee', 'Pending Supervisor'] }
  });
  await Proposal.populate(proposals, [
    { path: 'createdBy', select: 'name email studentId currentCGPA' },
    { path: 'supervisorId', select: 'name email' },
    { path: 'researchCellId', select: 'title' },
    { path: 'members', select: 'name email studentId currentCGPA' },
  ]);
  res.json(proposals);
});

// @desc    Get proposals for the current student (creator or member)
// @route   GET /api/proposals/student-proposals
// @access  Private (Student)
const getStudentProposals = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const proposals = await Proposal.find({
    $or: [
      { createdBy: studentId },
      { members: studentId }
    ]
  })
    .populate('createdBy', 'name email studentId currentCGPA')
    .populate('supervisorId', 'name email')
    .populate('researchCellId', 'title')
    .populate('members', 'name email studentId currentCGPA')
  res.json(proposals);
});

// @desc    Get proposals for the current committee member's department
// @route   GET /api/proposals/committee-proposals
// @access  Private (Committee)
const getCommitteeProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ department: req.user.department })
    .populate('createdBy', 'name email studentId')
    .populate('supervisorId', 'name email')
    .populate('researchCellId', 'title');

  res.json(proposals);
});

// @desc    Update proposal status
// @route   PUT /api/proposals/:id/status
// @access  Private (Supervisor)
const updateProposalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, feedback, acceptanceOption } = req.body;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  if (proposal.supervisorId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this proposal');
  }

  if (proposal.status !== 'Pending Supervisor') {
    res.status(400);
    throw new Error('Proposal is not in Pending Supervisor status.');
  }

  const supervisor = await User.findById(proposal.supervisorId);
  if (!supervisor) {
    res.status(404);
    throw new Error('Main supervisor not found.');
  }

  if (status === 'Approved') {
    if (acceptanceOption === 'supervisor_only') {
      proposal.courseSupervisorId = null;
    } else if (acceptanceOption === 'supervisor_and_course_supervisor') {
      const potentialCourseSupervisors = await User.find({
        role: 'supervisor',
        isCourseSupervisor: true,
        mainSupervisor: proposal.supervisorId,
      });

      let availableCourseSupervisor = null;
      if (potentialCourseSupervisors.length > 0) {
        availableCourseSupervisor = potentialCourseSupervisors[0];
      }

      if (!availableCourseSupervisor) {
        res.status(400);
        throw new Error('No course supervisor assigned to you yet. Please contact the committee.');
      }
      proposal.courseSupervisorId = availableCourseSupervisor._id;
    }
    proposal.status = 'Approved';
  } else if (status === 'Not Approved') {
    supervisor.currentGroupCount -= 1;
    await supervisor.save();
    proposal.status = 'Not Approved';
  }

  proposal.feedback = feedback;
  proposal.reviewedAt = new Date();

  const updatedProposal = await proposal.save();

  res.json(updatedProposal);
});

// @desc    Forward proposal to supervisor
// @route   PUT /api/proposals/:id/forward
// @access  Private (Committee)
const forwardProposalToSupervisor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  if (proposal.status !== 'Pending Committee') {
    res.status(400);
    throw new Error('Proposal is not in Pending Committee status.');
  }

  proposal.status = 'Pending Supervisor';
  proposal.reviewedAt = new Date();

  const updatedProposal = await proposal.save();
  res.json(updatedProposal);
});

// @desc    Reject proposal
// @route   PUT /api/proposals/:id/reject
// @access  Private (Committee)
const rejectProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;

  const proposal = await Proposal.findById(id);

  if (!proposal) {
    res.status(404);
    throw new Error('Proposal not found');
  }

  if (proposal.status !== 'Pending Committee') {
    res.status(400);
    throw new Error('Proposal is not in Pending Committee status.');
  }

  const supervisor = await User.findById(proposal.supervisorId);
  if (supervisor) {
    supervisor.currentGroupCount -= 1;
    await supervisor.save();
  }

  proposal.status = 'Not Approved';
  proposal.feedback = feedback;
  proposal.reviewedAt = new Date();

  const updatedProposal = await proposal.save();
  res.json(updatedProposal);
});

// @desc    Get pending proposals grouped by research cell
// @route   GET /api/proposals/pending-by-cell
// @access  Private (Committee)
const getPendingProposalsByCell = asyncHandler(async (req, res) => {
  const proposals = await Proposal.aggregate([
    { $match: { status: 'Pending Committee' } },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
      },
    },
    { $unwind: '$createdBy' },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'members',
      },
    },
    {
      $group: {
        _id: '$researchCellId',
        proposals: { $push: '$$ROOT' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'researchcells',
        localField: '_id',
        foreignField: '_id',
        as: 'researchCell',
      },
    },
    { $unwind: '$researchCell' },
    {
      $project: {
        _id: 0,
        researchCell: '$researchCell',
        proposals: {
          $map: {
            input: '$proposals',
            as: 'proposal',
            in: {
              _id: '$$proposal._id',
              title: '$$proposal.title',
              abstract: '$$proposal.abstract',
              type: '$$proposal.type',
              researchCellId: '$$proposal.researchCellId',
              supervisorId: '$$proposal.supervisorId',
              status: '$$proposal.status',
              feedback: '$$proposal.feedback',
              reviewedAt: '$$proposal.reviewedAt',
              department: '$$proposal.department',
              createdAt: '$$proposal.createdAt',
              updatedAt: '$$proposal.updatedAt',
              createdBy: {
                _id: '$$proposal.createdBy._id',
                name: '$$proposal.createdBy.name',
                studentId: '$$proposal.createdBy.studentId',
                currentCGPA: '$$proposal.createdBy.currentCGPA',
              },
              members: {
                $map: {
                  input: '$$proposal.members',
                  as: 'member',
                  in: {
                    _id: '$$member._id',
                    name: '$$member.name',
                    studentId: '$$member.studentId',
                    currentCGPA: '$$member.currentCGPA',
                  },
                },
              },
            },
          },
        },
        count: '$count',
      },
    },
  ]);

  res.json(proposals);
});

// @desc    Get all approved proposals with detailed information
// @route   GET /api/proposals/approved-proposals
// @access  Private (Committee)
const getApprovedProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ status: 'Approved' })
    .populate('createdBy', 'name studentId currentCGPA')
    .populate('supervisorId', 'name')
    .populate('researchCellId', 'title')
    .populate('members', 'name studentId currentCGPA');

  res.json(proposals);
});

// @desc    Get all approved proposals not in any defense board
// @route   GET /api/proposals/available-proposals
// @access  Private (Committee)
const getAvailableProposals = asyncHandler(async (req, res) => {
  const defenseBoards = await DefenseBoard.find({}, 'groups');
  const assignedProposals = defenseBoards.flatMap(board => board.groups);

  const proposals = await Proposal.find({ 
    status: 'Approved', 
    _id: { $nin: assignedProposals } 
  })
    .populate('createdBy', 'name studentId currentCGPA')
    .populate('supervisorId', 'name')
    .populate('courseSupervisorId', 'name')
    .populate('researchCellId', 'title')
    .populate('members', 'name studentId currentCGPA');

  res.json(proposals);
});

// @desc    Get all groups for the current supervisor (main or course supervisor)
// @route   GET /api/proposals/supervisor-all-groups
// @access  Private (Supervisor)
const getSupervisorAllGroups = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  const proposals = await Proposal.find({
    $or: [
      { supervisorId: supervisorId },
      { courseSupervisorId: supervisorId }
    ],
    status: 'Approved'
  })
    .populate('createdBy', 'name studentId currentCGPA')
    .populate('supervisorId', 'name')
    .populate('courseSupervisorId', 'name')
    .populate('researchCellId', 'title')
    .populate('members', 'name studentId currentCGPA');

  const underMySupervisionOnly = [];
  const underMySupervisionAndCourseSupervision = [];
  const underMyCourseSupervision = [];

  proposals.forEach(proposal => {
    if (proposal.supervisorId._id.toString() === supervisorId.toString() && !proposal.courseSupervisorId) {
      underMySupervisionOnly.push(proposal);
    } else if (proposal.supervisorId._id.toString() === supervisorId.toString() && proposal.courseSupervisorId) {
      underMySupervisionAndCourseSupervision.push(proposal);
    } else if (proposal.courseSupervisorId && proposal.courseSupervisorId._id.toString() === supervisorId.toString()) {
      underMyCourseSupervision.push(proposal);
    }
  });

  res.json({
    underMySupervisionOnly,
    underMySupervisionAndCourseSupervision,
    underMyCourseSupervision
  });
});

const getMySupervisions = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  const proposals = await Proposal.find({
    $or: [
      { supervisorId: supervisorId },
      { coSupervisors: supervisorId }
    ],
    status: 'Approved'
  })
  .populate('members', 'name email');

  res.json(proposals);
});

export { createProposal, getSupervisorProposals, getSupervisorPendingProposals, getStudentProposals, getCommitteeProposals, updateProposalStatus, getPendingProposalsByCell, forwardProposalToSupervisor, rejectProposal, getApprovedProposals, getAvailableProposals, getSupervisorAllGroups, getMySupervisions };