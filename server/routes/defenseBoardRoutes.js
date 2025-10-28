import express from 'express';
import {
  createDefenseBoard,
  getAllDefenseBoards,
  getDefenseBoardById,
  updateDefenseBoard,
  deleteDefenseBoard,
  getSupervisorDefenseSchedule,
  getStudentDefenseSchedule,
  addOrUpdateComment,
  getSupervisorDefenseResult,
} from '../controllers/defenseBoardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Committee routes
router.route('/')
  .post(protect, authorizeRoles('committee'), createDefenseBoard)
  .get(protect, authorizeRoles('committee', 'supervisor', 'student'), getAllDefenseBoards);

// Supervisor specific routes
router.get('/supervisor-schedule', protect, authorizeRoles('supervisor'), getSupervisorDefenseSchedule);
router.get('/supervisor-results', protect, authorizeRoles('supervisor'), getSupervisorDefenseResult);

// Student specific routes
router.get('/student-schedule', protect, authorizeRoles('student'), getStudentDefenseSchedule);

router.route('/:id')
  .get(protect, authorizeRoles('committee', 'supervisor', 'student'), getDefenseBoardById)
  .put(protect, authorizeRoles('committee'), updateDefenseBoard)
  .delete(protect, authorizeRoles('committee'), deleteDefenseBoard);

router.put('/:id/comments', protect, authorizeRoles('supervisor'), addOrUpdateComment);

export default router;