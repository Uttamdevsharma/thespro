import cloudinary from '../utils/cloudinary.js';
import asyncHandler from 'express-async-handler';

const uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded.');
  }

  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(req.file.buffer);
  });

  const result = await uploadPromise;

  res.status(200).json({
    message: 'File uploaded successfully',
    fileUrl: result.secure_url,
    publicId: result.public_id,
    fileType: result.resource_type,
  });
});

export { uploadChatFile };
