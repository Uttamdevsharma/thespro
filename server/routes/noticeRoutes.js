
const express = require('express');
const {
  createCommitteeNotice,
  getCommitteeSentNotices,
  sendNoticeToGroup,
  getSupervisorSentNotices,
  getNotices,
  getNoticeById,
  markNoticeAsRead,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

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

module.exports = router;
