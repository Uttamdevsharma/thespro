import express from 'express';
import { getStudents, getSupervisors, addSupervisor, assignCellToSupervisor, getUserProfile, updateUserProfile, updatePassword, uploadProfilePicture, getAllUsers, getCommitteeMembers, getAllSupervisors, assignCourseSupervisor, getSupervisorsWithCapacity, getUserById, removeCellFromSupervisor } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/students', protect, authorizeRoles('committee', 'supervisor', 'student', 'admin'), getStudents);
router.get('/supervisors', protect, authorizeRoles('committee', 'student', 'supervisor', 'admin'), getSupervisors);
router.post('/add-supervisor', protect, authorizeRoles('admin'), addSupervisor);
router.put('/:id/assign-cell', protect, authorizeRoles('admin', 'committee'), assignCellToSupervisor);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);
router.post('/profile-picture', protect, upload, uploadProfilePicture);
router.get('/all', protect, authorizeRoles('committee', 'supervisor', 'admin'), getAllUsers);
router.get('/committee-members', protect, authorizeRoles('admin', 'committee'), getCommitteeMembers);
router.get('/supervisors/all', protect, authorizeRoles('admin', 'committee'), getAllSupervisors);
router.get('/supervisors/capacity', protect, authorizeRoles('student', 'admin'), getSupervisorsWithCapacity);
router.put('/supervisors/:id/assign-course-supervisor', protect, authorizeRoles('admin'), assignCourseSupervisor);
router.get('/:id', protect, authorizeRoles('admin', 'committee'), getUserById);
router.put('/:id/remove-cell', protect, authorizeRoles('admin', 'committee'), removeCellFromSupervisor);

export default router;