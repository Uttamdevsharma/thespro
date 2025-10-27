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
} from '../controllers/defenseBoardController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Committee routes
router.route('/')
  .post(protect, authorizeRoles('committee'), createDefenseBoard)
  .get(protect, authorizeRoles('committee', 'supervisor', 'student'), getAllDefenseBoards);

router.route('/:id')
  .get(protect, authorizeRoles('committee', 'supervisor', 'student'), getDefenseBoardById)
  .put(protect, authorizeRoles('committee'), updateDefenseBoard)
  .delete(protect, authorizeRoles('committee'), deleteDefenseBoard);

// Supervisor specific routes
router.get('/supervisor-schedule', protect, authorizeRoles('supervisor'), getSupervisorDefenseSchedule);
router.put('/:id/comments', protect, authorizeRoles('supervisor'), addOrUpdateComment);

// Student specific routes
router.get('/student-schedule', protect, authorizeRoles('student'), getStudentDefenseSchedule);

export default router;