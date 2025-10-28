import asyncHandler from 'express-async-handler';
import Proposal from '../models/Proposal.js';
import DefenseBoard from '../models/DefenseBoard.js';
import User from '../models/User.js';

// @desc    Get defense results for the current supervisor
// @route   GET /api/defense-results/supervisor
// @access  Private (Supervisor)
const getDefenseResultsForSupervisor = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;

  // Find all proposals where the current user is the main supervisor or course supervisor
  const proposals = await Proposal.find({
    $or: [{ supervisorId }, { courseSupervisorId: supervisorId }],
    status: 'Approved', // Assuming we only show results for approved proposals
  })
    .populate('members', 'name studentId')
    .populate('supervisorId', 'name')
    .populate('courseSupervisorId', 'name');

  const defenseResults = [];

  for (const proposal of proposals) {
    if (proposal.defenseBoardId) {
      const defenseBoard = await DefenseBoard.findById(proposal.defenseBoardId)
        .populate('boardMembers', 'name')
        .populate({
          path: 'comments',
          populate: {
            path: 'commentedBy',
            select: 'name',
          },
        });

      if (defenseBoard) {
        const groupComments = defenseBoard.comments.filter(
          (comment) => comment.group.toString() === proposal._id.toString()
        );

        defenseResults.push({
          _id: proposal._id,
          title: proposal.title,
          type: proposal.type,
          students: proposal.members.map((m) => ({
            name: m.name,
            studentId: m.studentId,
          })),
          boardMembers: defenseBoard.boardMembers.map((bm) => bm.name),
          comments: groupComments.map((c) => ({
            text: c.text,
            commentedBy: c.commentedBy ? c.commentedBy.name : 'Unknown',
          })),
        });
      }
    }
  }

  console.log('Sending defense results:', defenseResults);
  res.json(defenseResults);
});

export { getDefenseResultsForSupervisor };
