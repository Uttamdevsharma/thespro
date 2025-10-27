import express from 'express';
import { getStudents, getSupervisors, addSupervisor, assignCellToSupervisor, getUserProfile, updateUserProfile, updatePassword, uploadProfilePicture, getAllUsers, getCommitteeMembers, getAllSupervisors, assignCourseSupervisor, getSupervisorsWithCapacity } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/students', protect, authorizeRoles('committee', 'supervisor', 'student'), getStudents);
router.get('/supervisors', protect, authorizeRoles('committee', 'student', 'supervisor'), getSupervisors);
router.post('/add-supervisor', protect, authorizeRoles('committee'), addSupervisor);
router.put('/:id/assign-cell', protect, authorizeRoles('committee'), assignCellToSupervisor);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);
router.post('/profile-picture', protect, upload, uploadProfilePicture);
router.get('/all', protect, authorizeRoles('committee', 'supervisor'), getAllUsers);
router.get('/committee-members', protect, authorizeRoles('committee'), getCommitteeMembers);
router.get('/supervisors/all', protect, authorizeRoles('committee'), getAllSupervisors);
router.get('/supervisors/capacity', protect, authorizeRoles('student'), getSupervisorsWithCapacity);
router.put('/supervisors/:id/assign-course-supervisor', protect, authorizeRoles('committee'), assignCourseSupervisor);

export default router;