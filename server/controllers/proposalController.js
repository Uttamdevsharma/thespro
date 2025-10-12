
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const ResearchCell = require('../models/ResearchCell');
const stringSimilarity = require('string-similarity');

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private (Student)
const createProposal = async (req, res) => {
  const { title, abstract, type, researchCellId, supervisorId, members } = req.body;

  // Assuming user ID is available from authentication middleware (req.user._id)
  const createdBy = req.user._id;
  const department = req.user.department;

  try {
    // Fuzzy string matching
    const existingProposals = await Proposal.find({ supervisorId });
    const newTitle = title.toLowerCase().replace(/[\s\p{P}]+/gu, "");

    for (const existingProposal of existingProposals) {
      const existingTitle = existingProposal.title.toLowerCase().replace(/[\s\p{P}]+/gu, "");
      const similarity = stringSimilarity.compareTwoStrings(newTitle, existingTitle);

      if (similarity > 0.8) {
        return res.status(400).json({ message: 'A similar project title already exists under this supervisor. Please modify your title and try again.' });
      }
    }

    const proposal = await Proposal.create({
      title,
      abstract,
      type,
      researchCellId,
      supervisorId,
      members: [createdBy, ...members], // Add the creator to members list
      createdBy,
      department,
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get proposals for the current supervisor
// @route   GET /api/proposals/supervisor-proposals
// @access  Private (Supervisor)
const getSupervisorProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ supervisorId: req.user._id })
      .populate('createdBy', 'name email studentId') // Populate student info
      .populate('supervisorId', 'name email') // Populate supervisor info
      .populate('researchCellId', 'title'); // Populate research cell info

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending proposals for the current supervisor
// @route   GET /api/proposals/supervisor-pending-proposals
// @access  Private (Supervisor)
const getSupervisorPendingProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ supervisorId: req.user._id, status: 'Pending' });
    console.log('proposals before populate:', proposals);
    await Proposal.populate(proposals, [
      { path: 'createdBy', select: 'name email studentId' },
      { path: 'supervisorId', select: 'name email' },
      { path: 'researchCellId', select: 'title' },
      { path: 'members', select: 'name email' },
    ]);
    console.log('proposals after populate:', proposals);
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get proposals for the current student (creator or member)
// @route   GET /api/proposals/student-proposals
// @access  Private (Student)
const getStudentProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('createdBy', 'name email studentId')
      .populate('supervisorId', 'name email')
      .populate('researchCellId', 'title')
      .populate('members', 'name email');

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get proposals for the current committee member's department
// @route   GET /api/proposals/committee-proposals
// @access  Private (Committee)
const getCommitteeProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ department: req.user.department })
      .populate('createdBy', 'name email studentId') // Populate student info
      .populate('supervisorId', 'name email') // Populate supervisor info
      .populate('researchCellId', 'title'); // Populate research cell info

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update proposal status
// @route   PUT /api/proposals/:id/status
// @access  Private (Supervisor)
const updateProposalStatus = async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  try {
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      res.status(404).json({ message: 'Proposal not found' });
      return;
    }

    // Ensure only the assigned supervisor can update the status
    if (proposal.supervisorId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this proposal' });
      return;
    }

    proposal.status = status;
    proposal.feedback = feedback;
    proposal.reviewedAt = new Date(); // Set reviewedAt to current date

    const updatedProposal = await proposal.save();

    res.json(updatedProposal);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update proposal status', error: error.message });
  }
};

module.exports = { createProposal, getSupervisorProposals, getSupervisorPendingProposals, getStudentProposals, getCommitteeProposals, updateProposalStatus };
