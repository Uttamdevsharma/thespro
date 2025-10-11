const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer'); // Import multer
const { uploadChatFile } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for chat file uploads (using memory storage for Cloudinary)
const uploadChat = multer({ storage: multer.memoryStorage() });

router.post('/chat-file', protect, uploadChat.single('file'), uploadChatFile);

module.exports = router;
