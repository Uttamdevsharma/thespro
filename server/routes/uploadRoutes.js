import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer'; // Import multer
import { uploadChatFile } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for chat file uploads (using memory storage for Cloudinary)
const uploadChat = multer({ storage: multer.memoryStorage() });

router.post('/chat-file', protect, uploadChat.single('file'), uploadChatFile);

export default router;
