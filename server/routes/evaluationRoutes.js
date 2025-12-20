import express from 'express';
import { submitOrUpdateEvaluation, getEvaluationsByProposal, getMyResults, getBoardResults, publishAllResults } from '../controllers/evaluationController.js';
import { protect, committee } from '../middleware/authMiddleware.js';

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

// @desc   Get all board results
// @route  GET /api/evaluations/board-results
// @access Private (Committee)
router.get('/board-results', protect, committee, getBoardResults);

// @desc   Publish all results
// @route  POST /api/evaluations/publish-all-results
// @access Private (Committee)
router.post('/publish-all-results', protect, committee, publishAllResults);

export default router;

