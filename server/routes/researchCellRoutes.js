import express from 'express';
import { getResearchCells, addResearchCell } from '../controllers/researchCellController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('committee', 'supervisor', 'student'), getResearchCells)
  .post(protect, authorizeRoles('committee'), addResearchCell);

export default router;