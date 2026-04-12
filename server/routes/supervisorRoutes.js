import express from 'express';
import multer from 'multer';
import { updateSupervisorProfile } from '../controllers/supervisorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Update supervisor profile
// @route   PUT /api/supervisor/profile
// @access  Private (Supervisor/Committee)
router.put('/profile', protect, upload.single('profileImage'), updateSupervisorProfile);

export default router;
