import express from 'express';
import { getDefenseResultsForSupervisor } from '../controllers/defenseResultController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/supervisor').get(protect, authorizeRoles('supervisor'), getDefenseResultsForSupervisor);

export default router;
