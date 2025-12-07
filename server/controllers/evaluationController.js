import asyncHandler from 'express-async-handler';
import Evaluation from '../models/Evaluation.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';
import DefenseBoard from '../models/DefenseBoard.js';

// @desc   Submit or Update an evaluation for a student
// @route  POST /api/evaluations
// @access Private (Committee, Supervisor)
const submitOrUpdateEvaluation = asyncHandler(async (req, res) => {
  const { studentId, proposalId, defenseType, marks, comments, evaluationType } = req.body;
  const evaluatorId = req.user._id;

  if (!studentId || !proposalId || !defenseType || !evaluationType || marks === undefined) {
    res.status(400);
    throw new Error('Please provide all required evaluation fields.');
  }

  const student = await User.findById(studentId);
  const proposal = await Proposal.findById(proposalId);

  if (!student || !proposal) {
    res.status(404);
    throw new Error('Student or Proposal not found.');
  }

  // Verify the evaluator has permission
  const isSupervisor = proposal.supervisorId.equals(evaluatorId) || (proposal.coSupervisors && proposal.coSupervisors.includes(evaluatorId));
  
  let isCommitteeMemberOnBoard = false;
  if (proposal.defenseBoardId) {
    const board = await DefenseBoard.findById(proposal.defenseBoardId);
    if (board && board.boardMembers.includes(evaluatorId)) {
        isCommitteeMemberOnBoard = true;
    }
  }

  let userEvaluationType;
  if (evaluationType === 'supervisor' && isSupervisor) {
    userEvaluationType = 'supervisor';
  } else if (evaluationType === 'committee' && (isCommitteeMemberOnBoard || req.user.role === 'committee')) {
    userEvaluationType = 'committee';
  } else {
    res.status(403);
    throw new Error('Not authorized to evaluate this student for the given role.');
  }
  
  const evaluationData = {
    student: studentId,
    evaluator: evaluatorId,
    proposal: proposalId,
    defenseType,
    evaluationType: userEvaluationType,
    marks,
    comments,
  };

  const existingEvaluation = await Evaluation.findOne({
    student: studentId,
    evaluator: evaluatorId,
    proposal: proposalId,
    defenseType,
    evaluationType: userEvaluationType,
  });

  if (existingEvaluation) {
    // Update
    existingEvaluation.marks = marks;
    existingEvaluation.comments = comments;
    const updatedEvaluation = await existingEvaluation.save();
    res.status(200).json(updatedEvaluation);
  } else {
    // Create
    const newEvaluation = await Evaluation.create(evaluationData);
    res.status(201).json(newEvaluation);
  }
});

// @desc   Get all evaluations for a specific proposal
// @route  GET /api/evaluations/proposal/:proposalId
// @access Private (Committee, Supervisor)
const getEvaluationsByProposal = asyncHandler(async (req, res) => {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate('members', 'name email');
  
    if (!proposal) {
      res.status(404);
      throw new Error('Proposal not found');
    }
  
    const evaluations = await Evaluation.find({ proposal: proposalId })
      .populate('evaluator', 'name');
  
    const results = proposal.members.map(member => {
      const studentEvals = evaluations.filter(e => e.student.equals(member._id));
      return {
        student: member,
        evaluations: studentEvals,
      };
    });
  
    res.status(200).json(results);
});


// @desc   Get results for the logged-in student
// @route  GET /api/evaluations/my-results
// @access Private (Student)
const getMyResults = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const evaluations = await Evaluation.find({ student: studentId })
    .populate('evaluator', 'name role');

  if (!evaluations || evaluations.length === 0) { // Check for empty array instead of just null
    res.status(200).json({
        preDefense: { supervisor: [], committee: [], total: 0 },
        finalDefense: { supervisor: [], committee: [], total: 0 },
        overallTotal: 0,
        comments: []
    });
    return;
  }

  const preDefenseSupervisorMarks = evaluations
    .filter(e => e.defenseType === 'pre-defense' && e.evaluationType === 'supervisor')
    .map(e => ({ marks: e.marks, evaluator: e.evaluator.name, comment: e.comments }));

  const preDefenseCommitteeMarks = evaluations
    .filter(e => e.defenseType === 'pre-defense' && e.evaluationType === 'committee')
    .map(e => ({ marks: e.marks, evaluator: e.evaluator.name, comment: e.comments }));

  const finalDefenseSupervisorMarks = evaluations
    .filter(e => e.defenseType === 'final-defense' && e.evaluationType === 'supervisor')
    .map(e => ({ marks: e.marks, evaluator: e.evaluator.name, comment: e.comments }));

  const finalDefenseCommitteeMarks = evaluations
    .filter(e => e.defenseType === 'final-defense' && e.evaluationType === 'committee')
    .map(e => ({ marks: e.marks, evaluator: e.evaluator.name, comment: e.comments }));

  const totalPreSupervisor = preDefenseSupervisorMarks.reduce((sum, e) => sum + e.marks, 0);
  const totalPreCommittee = preDefenseCommitteeMarks.reduce((sum, e) => sum + e.marks, 0); // Sum all committee marks
  
  const totalFinalSupervisor = finalDefenseSupervisorMarks.reduce((sum, e) => sum + e.marks, 0);
  const totalFinalCommittee = finalDefenseCommitteeMarks.reduce((sum, e) => sum + e.marks, 0); // Sum all committee marks

  // Calculate average committee marks if multiple committee members
  const avgPreCommittee = preDefenseCommitteeMarks.length > 0 ? totalPreCommittee / preDefenseCommitteeMarks.length : 0;
  const avgFinalCommittee = finalDefenseCommitteeMarks.length > 0 ? totalFinalCommittee / finalDefenseCommitteeMarks.length : 0;

  const totalPre = totalPreSupervisor + avgPreCommittee;
  const totalFinal = totalFinalSupervisor + avgFinalCommittee;

  res.status(200).json({
    preDefense: {
        supervisor: preDefenseSupervisorMarks,
        committee: preDefenseCommitteeMarks,
        total: totalPre,
    },
    finalDefense: {
        supervisor: finalDefenseSupervisorMarks,
        committee: finalDefenseCommitteeMarks,
        total: totalFinal
    },
    overallTotal: totalPre + totalFinal,
    comments: evaluations.map(e => ({ evaluator: e.evaluator.name, comment: e.comments, date: e.createdAt })).filter(c => c.comment)
  });
});


export {
  submitOrUpdateEvaluation,
  getEvaluationsByProposal,
  getMyResults,
};
