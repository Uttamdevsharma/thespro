import express from 'express';
import {
  createScheduleSlot,
  getAllScheduleSlots,
  getScheduleSlotById,
  updateScheduleSlot,
  deleteScheduleSlot,
} from '../controllers/scheduleSlotController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('committee'), createScheduleSlot)
  .get(protect, authorizeRoles('committee'), getAllScheduleSlots);

router.route('/:id')
  .get(protect, authorizeRoles('committee'), getScheduleSlotById)
  .put(protect, authorizeRoles('committee'), updateScheduleSlot)
  .delete(protect, authorizeRoles('committee'), deleteScheduleSlot);

export default router;
