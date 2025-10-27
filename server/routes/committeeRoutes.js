import express from 'express';
import { setSubmissionDates, getSubmissionDates } from '../controllers/committeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/submission-dates')
  .post(protect, authorizeRoles('committee'), setSubmissionDates)
  .get(protect, getSubmissionDates);

export default router;