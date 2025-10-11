const express = require('express');
const { addNotice } = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorizeRoles('supervisor'), addNotice);

module.exports = router;