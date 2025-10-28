import asyncHandler from 'express-async-handler';
import Proposal from '../models/Proposal.js';
import DefenseBoard from '../models/DefenseBoard.js';
import User from '../models/User.js';

// @desc    Get defense results for the current supervisor
// @route   GET /api/defense-results/supervisor
// @access  Private (Supervisor)
const getDefenseResultsForSupervisor = asyncHandler(async (req, res) => {
  const supervisorId = req.user._id;
  const { filter, defenseType } = req.query; // Get filter and defenseType from query parameters

  try {
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

    const proposals = await Proposal.find(proposalQuery).select('_id'); // Only need IDs for the next step

    const relevantProposalIds = proposals.map(p => p._id);

    if (relevantProposalIds.length === 0) {
      return res.json([]);
    }

    let defenseBoardQuery = { groups: { $in: relevantProposalIds } };
    if (defenseType) {
      defenseBoardQuery.defenseType = defenseType;
    }

    const defenseBoards = await DefenseBoard.find(defenseBoardQuery)
      .populate('boardMembers', 'name')
      .populate('room', 'name')
      .populate('schedule', 'startTime endTime')
      .populate({
        path: 'comments.commentedBy',
        select: 'name',
      });

    const defenseResults = [];

    for (const board of defenseBoards) {
      for (const proposalId of board.groups) {
        // Only process proposals that are relevant to this supervisor and match the defenseType
        if (relevantProposalIds.some(id => id.equals(proposalId))) {
          const proposal = await Proposal.findById(proposalId)
            .populate('members', 'name studentId')
            .populate('supervisorId', 'name')
            .populate('courseSupervisorId', 'name');

          if (proposal) {
            const groupComments = board.comments.filter(
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
              boardMembers: board.boardMembers.map((bm) => bm.name),
              comments: groupComments.map((c) => ({
                text: c.text,
                commentedBy: c.commentedBy ? c.commentedBy.name : 'Unknown',
              })),
            });
          }
        }
      }
    }

    res.json(defenseResults);
  } catch (error) {
    console.error('Error in getDefenseResultsForSupervisor:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

export { getDefenseResultsForSupervisor };
