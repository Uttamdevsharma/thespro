import express from 'express';
import { createProposal, getSupervisorProposals, getSupervisorPendingProposals, getStudentProposals, getCommitteeProposals, updateProposalStatus, getPendingProposalsByCell, forwardProposalToSupervisor, rejectProposal, getApprovedProposals, getSupervisorAllGroups, getAvailableProposals, getMySupervisions, publishResult, getProposalById } from '../controllers/proposalController.js';
import { protect, committee } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, authorizeRoles('student'), createProposal);
router.route('/').get(protect, authorizeRoles('committee'), getCommitteeProposals);
router.get('/supervisor-proposals', protect, authorizeRoles('supervisor'), getSupervisorProposals);
router.get('/supervisor-pending-proposals', protect, authorizeRoles('supervisor'), getSupervisorPendingProposals);
router.get('/student-proposals', protect, authorizeRoles('student'), getStudentProposals);
router.get('/committee-proposals', protect, authorizeRoles('committee'), getCommitteeProposals);
router.get('/pending-by-cell', protect, authorizeRoles('committee'), getPendingProposalsByCell);
router.put('/:id/status', protect, authorizeRoles('supervisor'), updateProposalStatus);
router.put('/:id/forward', protect, authorizeRoles('committee'), forwardProposalToSupervisor);
router.put('/:id/reject', protect, authorizeRoles('committee'), rejectProposal);
router.put('/:id/publish', protect, committee, publishResult);
router.get('/approved-proposals', protect, authorizeRoles('committee'), getApprovedProposals);
router.get('/available-proposals', protect, authorizeRoles('committee'), getAvailableProposals);
router.get('/my-supervisions', protect, authorizeRoles('supervisor'), getMySupervisions);
router.get('/:id', protect, authorizeRoles('supervisor', 'committee', 'student'), getProposalById);
router.get('/supervisor-all-groups', protect, authorizeRoles('supervisor'), getSupervisorAllGroups);

export default router;