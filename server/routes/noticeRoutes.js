
import express from 'express';
import { createCommitteeNotice, getCommitteeSentNotices, sendNoticeToGroup, getSupervisorSentNotices, getNotices, getNoticeById, markNoticeAsRead, deleteNotice, } from '../controllers/noticeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/committee')
  .post(protect, authorizeRoles('committee'), createCommitteeNotice);

router.route('/committee/sent')
  .get(protect, authorizeRoles('committee'), getCommitteeSentNotices);

router.route('/supervisor')
  .post(protect, authorizeRoles('supervisor'), sendNoticeToGroup);

router.route('/supervisor/sent')
  .get(protect, authorizeRoles('supervisor'), getSupervisorSentNotices);

router.route('/')
  .get(protect, getNotices);

router.route('/:id')
  .get(protect, getNoticeById)
  .delete(protect, authorizeRoles('committee'), deleteNotice);

router.route('/:id/read').put(protect, markNoticeAsRead);

export default router;
