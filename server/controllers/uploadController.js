const cloudinary = require('../utils/cloudinary');

const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' }, // Automatically detect file type
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
      fileType: result.resource_type, // 'image', 'video', 'raw' (for documents)
    });

  } catch (error) {
    console.error('Error in uploadChatFile:', error);
    res.status(500).json({ message: 'Server error during file upload.', error: error.message });
  }
};

module.exports = { uploadChatFile };
