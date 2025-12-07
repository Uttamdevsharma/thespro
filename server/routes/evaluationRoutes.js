import express from 'express';
import { submitOrUpdateEvaluation, getEvaluationsByProposal, getMyResults } from '../controllers/evaluationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc   Submit or update an evaluation for a student
// @route  POST /api/evaluations
// @access Private (Committee, Supervisor)
router.post('/', protect, submitOrUpdateEvaluation);

// @desc   Get all evaluations for a specific proposal (group)
// @route  GET /api/evaluations/proposal/:proposalId
// @access Private (Committee, Supervisor)
router.get('/proposal/:proposalId', protect, getEvaluationsByProposal);

// @desc   Get my evaluation results
// @route  GET /api/evaluations/my-results
// @access Private (Student)
router.get('/my-results', protect, getMyResults);

export default router;
