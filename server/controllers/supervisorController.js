import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import cloudinary from '../utils/cloudinary.js';

// @desc    Update supervisor profile
// @route   PUT /api/supervisor/profile
// @access  Private (Supervisor/Committee)
const updateSupervisorProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Handle Text Fields
  user.name = req.body.name || user.name;
  user.education = req.body.education || user.education;
  user.experience = req.body.experience || user.experience;
  user.research = req.body.research || user.research;

  // Handle Image Upload to Cloudinary
  if (req.file) {
    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'thespro/profiles',
            resource_type: 'image' 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      user.profilePicture = result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      res.status(500);
      throw new Error('Failed to upload profile picture to Cloudinary');
    }
  }

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profilePicture: updatedUser.profilePicture,
    education: updatedUser.education,
    experience: updatedUser.experience,
    research: updatedUser.research,
    department: updatedUser.department,
  });
});

export { updateSupervisorProfile };
