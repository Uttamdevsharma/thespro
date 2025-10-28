import asyncHandler from 'express-async-handler';
import Proposal from '../models/Proposal.js';
import DefenseBoard from '../models/DefenseBoard.js';
import User from '../models/User.js';

// @desc    Get defense results for the current supervisor
// @route   GET /api/defense-results/supervisor
// @access  Private (Supervisor)
const getDefenseResultsForSupervisor = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;
  const { filter } = req.query;

  let proposalQuery = {
    status: 'Approved',
    defenseBoardId: { $ne: null }, // Only consider proposals assigned to a defense board
  };

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

  const proposals = await Proposal.find(proposalQuery)
    .populate('members', 'name studentId')
    .populate('supervisorId', 'name')
    .populate('courseSupervisorId', 'name');

  const defenseResults = [];

  for (const proposal of proposals) {
    // The defenseBoardId check is now part of the initial query, but we still need to populate it
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

  res.json(defenseResults);
});

export { getDefenseResultsForSupervisor };
