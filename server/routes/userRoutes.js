const express = require('express');
const { getStudents, getSupervisors, addSupervisor, assignCellToSupervisor, getUserProfile, updateUserProfile, updatePassword, uploadProfilePicture, getAllUsers, getCommitteeMembers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/students', protect, authorizeRoles('committee', 'supervisor', 'student'), getStudents);
router.get('/supervisors', protect, authorizeRoles('committee', 'student'), getSupervisors);
router.post('/add-supervisor', protect, authorizeRoles('committee'), addSupervisor);
router.put('/:id/assign-cell', protect, authorizeRoles('committee'), assignCellToSupervisor);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);
router.post('/profile-picture', protect, upload, uploadProfilePicture);
router.get('/all', protect, authorizeRoles('committee', 'supervisor'), getAllUsers);
router.get('/committee-members', protect, authorizeRoles('committee'), getCommitteeMembers);

module.exports = router;