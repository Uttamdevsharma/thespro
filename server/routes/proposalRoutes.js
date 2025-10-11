const express = require('express');
const { createProposal, getSupervisorProposals, getSupervisorPendingProposals, getStudentProposals, updateProposalStatus } = require('../controllers/proposalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/').post(protect, createProposal);
router.get('/supervisor-proposals', protect, authorizeRoles('supervisor'), getSupervisorProposals);
router.get('/supervisor-pending-proposals', protect, authorizeRoles('supervisor'), getSupervisorPendingProposals);
router.get('/student-proposals', protect, authorizeRoles('student'), getStudentProposals);
router.put('/:id/status', protect, authorizeRoles('supervisor'), updateProposalStatus);

module.exports = router;