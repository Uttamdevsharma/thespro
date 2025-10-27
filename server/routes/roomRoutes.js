import express from 'express';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('committee'), createRoom)
  .get(protect, authorizeRoles('committee'), getAllRooms);

router.route('/:id')
  .get(protect, authorizeRoles('committee'), getRoomById)
  .put(protect, authorizeRoles('committee'), updateRoom)
  .delete(protect, authorizeRoles('committee'), deleteRoom);

export default router;
