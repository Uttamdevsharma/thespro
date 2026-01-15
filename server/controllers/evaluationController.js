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
  let { studentId, proposalId, defenseType, marks, comments, evaluationType } = req.body; // Use let to allow re-assignment
  const evaluatorId = req.user._id;

  console.log('[submitOrUpdateEvaluation] Incoming data:', { studentId, proposalId, defenseType, marks, comments, evaluationType, evaluatorId });

  // Convert defenseType to canonical form to match Mongoose enum
  // It handles 'pre-defense', 'pre defense', 'final-defense', 'final defense'
  let canonicalDefenseType;
  if (defenseType.toLowerCase().includes('pre')) {
    canonicalDefenseType = 'Pre-Defense';
  } else if (defenseType.toLowerCase().includes('final')) {
    canonicalDefenseType = 'Final Defense';
  } else {
    canonicalDefenseType = defenseType; // Fallback, should not happen if client sends valid type
  }

  if (defenseType !== canonicalDefenseType) {
    console.log(`[submitOrUpdateEvaluation] Converting defenseType from '${defenseType}' to '${canonicalDefenseType}'`);
    defenseType = canonicalDefenseType;
  }

  if (!studentId || !proposalId || !defenseType || !evaluationType || marks === undefined) {
    res.status(400);
    throw new Error('Please provide all required evaluation fields.');
  }

  // Ensure evaluationType is one of the expected values
  const validEvaluationTypes = ['supervisor', 'committee'];
  if (!validEvaluationTypes.includes(evaluationType)) {
    res.status(400);
    throw new Error(`Invalid evaluation type provided: ${evaluationType}. Must be one of ${validEvaluationTypes.join(', ')}.`);
  }

  const student = await User.findById(studentId);
  const proposal = await Proposal.findById(proposalId);

  if (!student || !proposal) {
    console.log('[submitOrUpdateEvaluation] Student or Proposal not found.');
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

  // Authorization Logic
  let authorized = false;
  if (evaluationType === 'supervisor') {
    // Authorize if evaluator is the direct supervisor or co-supervisor
    if (isSupervisor) {
      authorized = true;
    }
  } else if (evaluationType === 'committee') {
    // Authorize if evaluator is a committee member (role 'committee') OR a board member for this defense board
    if (req.user.role === 'committee' || isCommitteeMemberOnBoard) {
      authorized = true;
    }
  }

  if (!authorized) {
    console.log('[submitOrUpdateEvaluation] Not authorized:', { evaluatorRole: req.user.role, evaluationType, isSupervisor, isCommitteeMemberOnBoard });
    res.status(403);
    throw new Error('Not authorized to evaluate this student for the given role.');
  }
  
  const evaluationData = {
    student: studentId,
    evaluator: evaluatorId,
    proposal: proposalId,
    defenseType,
    evaluationType: evaluationType, // Use the evaluationType directly from request body
    marks,
    comments,
  };

  console.log('[submitOrUpdateEvaluation] Processed evaluationData:', evaluationData);

  const existingEvaluation = await Evaluation.findOne({
    student: studentId,
    evaluator: evaluatorId,
    proposal: proposalId,
    defenseType,
    evaluationType: evaluationType, // Use the evaluationType directly from request body
  });

  if (existingEvaluation) {
    console.log('[submitOrUpdateEvaluation] Updating existing evaluation:', existingEvaluation._id);
    // Update
    existingEvaluation.marks = marks;
    existingEvaluation.comments = comments;
    console.log('[submitOrUpdateEvaluation] Data for update (before save):', { defenseType: existingEvaluation.defenseType, marks: existingEvaluation.marks });
    try {
      const updatedEvaluation = await existingEvaluation.save();
      console.log('[submitOrUpdateEvaluation] Updated evaluation:', updatedEvaluation);
      res.status(200).json(updatedEvaluation);
    } catch (updateError) {
      console.error('[submitOrUpdateEvaluation] Error updating existing evaluation:', updateError.message);
      if (updateError.name === 'ValidationError') {
        res.status(400);
        throw new Error(`Validation Error: ${updateError.message}`);
      }
      res.status(500);
      throw new Error('Failed to update existing evaluation.');
    }
  } else {
    console.log('[submitOrUpdateEvaluation] Creating new evaluation.');
    console.log('[submitOrUpdateEvaluation] Data for creation (before create):', { defenseType: evaluationData.defenseType, marks: evaluationData.marks });
    // Create
    try {
      const newEvaluation = await Evaluation.create(evaluationData);
      console.log('[submitOrUpdateEvaluation] Created new evaluation:', newEvaluation);
      res.status(201).json(newEvaluation);
    } catch (createError) {
      console.error('[submitOrUpdateEvaluation] Error creating new evaluation:', createError.message);
      if (createError.name === 'ValidationError') {
        res.status(400);
        throw new Error(`Validation Error: ${createError.message}`);
      }
      res.status(500);
      throw new Error('Failed to create new evaluation.');
    }
  }
});





// @desc   Get all evaluations for a specific proposal
// @route  GET /api/evaluations/proposal/:proposalId
// @access Private (Committee, Supervisor)
const getEvaluationsByProposal = asyncHandler(async (req, res) => {
    const { proposalId } = req.params;
    const { defenseType } = req.query; // 'Pre-Defense' or 'Final Defense'

    const proposal = await Proposal.findById(proposalId).populate('members', 'name email studentId');

    if (!proposal) {
      res.status(404);
      throw new Error('Proposal not found');
    }

    let query = { proposal: proposalId };
    if (defenseType) {
        query.defenseType = { $regex: new RegExp(`^${defenseType}$`, 'i') };
    }
  
    const evaluations = await Evaluation.find(query)
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

  console.log(`[getMyResults] Fetching results for student: ${studentId}`);

  // Try to find a published result for the student
  const publishedResult = await PublishedResult.findOne({ student: studentId })
    .populate('proposal', 'title');

  console.log(`[getMyResults] PublishedResult found: ${publishedResult ? 'Yes' : 'No'}`);

  // Fetch all comments
  const evaluations = await Evaluation.find({ student: studentId })
    .populate('evaluator', 'name role');

  console.log(`[getMyResults] Found ${evaluations.length} evaluations for student: ${studentId}`);

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
      // Use case-insensitive regex to match 'Pre-Defense' or 'pre-defense'
      if (e.defenseType.match(/^Pre-Defense$/i)) {
        if (e.evaluationType === 'supervisor') {
          preDefenseComments.supervisor.push(comment);
        } else if (e.evaluationType === 'committee') {
          preDefenseComments.board.push(comment);
        }
      } // Use case-insensitive regex to match 'Final Defense' or 'final-defense'
      else if (e.defenseType.match(/^Final Defense$/i)) {
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

  if (!defenseType || !['Pre-Defense', 'Final Defense'].includes(defenseType)) {
    res.status(400);
    throw new Error('Invalid or missing defense type. Must be "Pre-Defense" or "Final Defense".');
  }

  console.log(`[getBoardResults] Querying for defenseType: ${defenseType}`);

  const boards = await DefenseBoard.find({ defenseType: { $regex: new RegExp(`^${defenseType}$`, 'i') } }).sort({ boardNumber: 1 }).populate('boardMembers', 'name email').populate({
    path: 'schedule',
    select: 'startTime endTime'
  }).populate('room', 'name');

        console.log(`[getBoardResults] Found ${boards.length} boards for defenseType: ${defenseType}`);
  
        const boardResults = await Promise.all(
          boards.map(async (board) => {
            console.log(`[getBoardResults] Processing board ID: ${board._id}`);
            const proposals = await Proposal.find({ _id: { $in: board.groups } }) // Modified query
              .populate('members', 'name email studentId')
              .populate('supervisorId', 'name email'); // Populate name and email for supervisor
  
            console.log(`[getBoardResults] Found ${proposals.length} proposals for board ID ${board._id} (using board.groups)`);
  
            const proposalResults = await Promise.all(        proposals.map(async (proposal) => {
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
        console.log(`[publishAllResults] Processing Proposal: ${proposal.title} (ID: ${proposal._id}) with ${proposal.members.length} members.`);
        for (const student of proposal.members) {
            console.log(`[publishAllResults] Processing Student: ${student.name} (ID: ${student._id})`);

            // Check if result is already published
            const existingResult = await PublishedResult.findOne({ student: student._id });
            if (existingResult) {
                console.log(`[publishAllResults] Result for student ${student._id} already published.`);
                alreadyPublishedCount++;
                continue;
            }

            const evaluations = await Evaluation.find({
                proposal: proposal._id,
                student: student._id,
            });

            // Using case-insensitive regex for defenseType to match both 'pre-defense' and 'Pre-Defense'
            const preDefenseSupervisor = evaluations.find(e => e.evaluationType === 'supervisor' && e.defenseType.match(/^Pre-Defense$/i));
            const preDefenseCommittee = evaluations.filter(e => e.evaluationType === 'committee' && e.defenseType.match(/^Pre-Defense$/i));
            const finalDefenseSupervisor = evaluations.find(e => e.evaluationType === 'supervisor' && e.defenseType.match(/^Final Defense$/i));
            const finalDefenseCommittee = evaluations.filter(e => e.evaluationType === 'committee' && e.defenseType.match(/^Final Defense$/i));

            console.log(`[publishAllResults] Eval counts for student ${student._id}: PreSup=${!!preDefenseSupervisor}, PreCom=${preDefenseCommittee.length}, FinalSup=${!!finalDefenseSupervisor}, FinalCom=${finalDefenseCommittee.length}`);


            if (preDefenseSupervisor && preDefenseCommittee.length > 0 && finalDefenseSupervisor && finalDefenseCommittee.length > 0) {
                const preDefenseCommitteeAvg = preDefenseCommittee.reduce((acc, e) => acc + e.marks, 0) / preDefenseCommittee.length;
                const finalDefenseCommitteeAvg = finalDefenseCommittee.reduce((acc, e) => acc + e.marks, 0) / finalDefenseCommittee.length;

                const totalMarks =
                    preDefenseSupervisor.marks +
                    preDefenseCommitteeAvg +
                    finalDefenseSupervisor.marks +
                    finalDefenseCommitteeAvg;

                const { grade, point } = calculateGradeAndPoint(totalMarks);

                try {
                    await PublishedResult.create({
                        student: student._id,
                        proposal: proposal._id,
                        grade,
                        point,
                        courseCode: 'CSE 400A',
                        courseTitle: 'Capstone Project / Thesis',
                    });
                    console.log(`[publishAllResults] Successfully published result for student ${student._id} (Grade: ${grade}, Point: ${point}).`);
                    publishedCount++;
                } catch (createError) {
                    console.error(`[publishAllResults] Error creating PublishedResult for student ${student._id}: ${createError.message}`);
                    if (createError.name === 'ValidationError') {
                        // This might happen if there's a unique constraint or schema mismatch
                        console.error(`Validation Error details: ${createError.message}`);
                    }
                    notPublishedCount++; // Count as not published due to error
                }
            } else {
                console.log(`[publishAllResults] Not enough evaluations for student ${student._id} to publish result.`);
                notPublishedCount++;
            }
        }
    }
    console.log(`[publishAllResults] Publishing process finished. Published: ${publishedCount}, Already Published: ${alreadyPublishedCount}, Not Published: ${notPublishedCount}.`);
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
