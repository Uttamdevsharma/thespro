import asyncHandler from 'express-async-handler';
import Evaluation from '../models/Evaluation.js';
import Proposal from '../models/Proposal.js';
import User from '../models/User.js';
import DefenseBoard from '../models/DefenseBoard.js';
import calculateGradeAndPoint from '../utils/gradeCalculator.js';
import PublishedResult from '../models/PublishedResult.js';


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

  // Try to find a published result for the student
  const publishedResult = await PublishedResult.findOne({ student: studentId })
    .populate('proposal', 'title');

  // Fetch all comments
  const evaluations = await Evaluation.find({ student: studentId })
    .populate('evaluator', 'name role');

  const preDefenseComments = {
    supervisor: [],
    board: [],
  };

  const finalDefenseComments = {
    supervisor: [],
    board: [],
  };

  evaluations.forEach(e => {
    if (e.comments) {
      const comment = {
        comment: e.comments,
        evaluator: e.evaluator.name,
      };
      if (e.defenseType === 'pre-defense') {
        if (e.evaluationType === 'supervisor') {
          preDefenseComments.supervisor.push(comment);
        } else if (e.evaluationType === 'committee') {
          preDefenseComments.board.push(comment);
        }
      } else if (e.defenseType === 'final-defense') {
        if (e.evaluationType === 'supervisor') {
          finalDefenseComments.supervisor.push(comment);
        } else if (e.evaluationType === 'committee') {
          finalDefenseComments.board.push(comment);
        }
      }
    }
  });

  if (publishedResult) {
    res.status(200).json({
      published: true,
      courseCode: publishedResult.courseCode,
      courseTitle: publishedResult.courseTitle,
      grade: publishedResult.grade,
      point: publishedResult.point,
      preDefenseComments,
      finalDefenseComments,
      message: 'Result published successfully.'
    });
  } else {
    res.status(200).json({
      published: false,
      preDefenseComments,
      finalDefenseComments,
      message: 'Result not published yet due to incomplete evaluation.'
    });
  }
});




// @desc   Get all board results for a specific defense type
// @route  GET /api/evaluations/board-results
// @access Private (Committee)
const getBoardResults = asyncHandler(async (req, res) => {
  const { defenseType } = req.query;

  if (!defenseType || !['pre-defense', 'final-defense'].includes(defenseType)) {
    res.status(400);
    throw new Error('Invalid or missing defense type.');
  }

  const boards = await DefenseBoard.find({ defenseType: { $regex: new RegExp(`^${defenseType}$`, 'i') } }).sort({ boardNumber: 1 }).populate('boardMembers', 'name email').populate({
    path: 'schedule',
    select: 'startTime endTime'
  }).populate('room', 'name');

  const boardResults = await Promise.all(
    boards.map(async (board) => {
      const proposals = await Proposal.find({ defenseBoardId: board._id })
        .populate('members', 'name email studentId')
        .populate('supervisorId', 'name email'); // Populate name and email for supervisor

      const proposalResults = await Promise.all(
        proposals.map(async (proposal) => {
          const studentResults = await Promise.all(
            proposal.members.map(async (member) => {
              const evaluations = await Evaluation.find({
                proposal: proposal._id,
                student: member._id,
                defenseType,
              }).populate('evaluator', 'name role');

              return {
                student: member,
                evaluations,
              };
            })
          );

          return {
            proposal,
            students: studentResults,
          };
        })
      );

      return {
        board,
        proposals: proposalResults,
      };
    })
  );

  res.status(200).json(boardResults);
});




// @desc   Publish all results
// @route  POST /api/evaluations/publish-all-results
// @access Private (Committee)
const publishAllResults = asyncHandler(async (req, res) => {
    const proposals = await Proposal.find({ status: 'Approved' }).populate('members');
    let publishedCount = 0;
    let alreadyPublishedCount = 0;
    let notPublishedCount = 0;

    for (const proposal of proposals) {
        for (const student of proposal.members) {
            // Check if result is already published
            const existingResult = await PublishedResult.findOne({ student: student._id });
            if (existingResult) {
                alreadyPublishedCount++;
                continue;
            }

            const evaluations = await Evaluation.find({
                proposal: proposal._id,
                student: student._id,
            });

            const preDefenseSupervisor = evaluations.find(e => e.defenseType === 'pre-defense' && e.evaluationType === 'supervisor');
            const preDefenseCommittee = evaluations.filter(e => e.defenseType === 'pre-defense' && e.evaluationType === 'committee');
            const finalDefenseSupervisor = evaluations.find(e => e.defenseType === 'final-defense' && e.evaluationType === 'supervisor');
            const finalDefenseCommittee = evaluations.filter(e => e.defenseType === 'final-defense' && e.evaluationType === 'committee');

            if (preDefenseSupervisor && preDefenseCommittee.length > 0 && finalDefenseSupervisor && finalDefenseCommittee.length > 0) {
                const preDefenseCommitteeAvg = preDefenseCommittee.reduce((acc, e) => acc + e.marks, 0) / preDefenseCommittee.length;
                const finalDefenseCommitteeAvg = finalDefenseCommittee.reduce((acc, e) => acc + e.marks, 0) / finalDefenseCommittee.length;

                const totalMarks =
                    preDefenseSupervisor.marks +
                    preDefenseCommitteeAvg +
                    finalDefenseSupervisor.marks +
                    finalDefenseCommitteeAvg;

                const { grade, point } = calculateGradeAndPoint(totalMarks);

                await PublishedResult.create({
                    student: student._id,
                    proposal: proposal._id,
                    grade,
                    point,
                    courseCode: 'CSE 400A',
                    courseTitle: 'Capstone Project / Thesis',
                });
                publishedCount++;
            } else {
                notPublishedCount++;
            }
        }
    }
    res.status(200).json({
        message: 'Result publishing process completed.',
        published: publishedCount,
        alreadyPublished: alreadyPublishedCount,
        notPublished: notPublishedCount,
    });
});



export {
  submitOrUpdateEvaluation,
  getEvaluationsByProposal,
  getMyResults,
  getBoardResults,
  publishAllResults,
};
