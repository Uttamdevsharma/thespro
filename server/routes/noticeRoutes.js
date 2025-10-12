const express = require('express');
const {
  createNotice,
  getNotices,
  getNoticeById,
  markNoticeAsRead,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const uploadNotice = require('../middleware/noticeUploadMiddleware');

const router = express.Router();

// Committee can create notices with optional file upload
router.post(
  '/',
  protect,
  authorizeRoles('committee'),
  uploadNotice,
  createNotice
);

// All authenticated users (students, supervisors, committee) can get notices
router.get('/', protect, getNotices);

// All authenticated users can get a single notice by ID
router.get('/:id', protect, getNoticeById);

// All authenticated users can mark a notice as read
router.put('/:id/read', protect, markNoticeAsRead);

// Committee can delete notices
router.delete('/:id', protect, authorizeRoles('committee'), deleteNotice);

module.exports = router;