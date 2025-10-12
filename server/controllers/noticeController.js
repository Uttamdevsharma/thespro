const Notice = require('../models/Notice');

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Committee)
const createNotice = async (req, res) => {
  const { title, description, sendTo } = req.body;
  const sender = req.user._id; // Committee member creating the notice
  const file = req.file ? `/uploads/notices/${req.file.filename}` : null; // Path to uploaded file

  try {
    const notice = await Notice.create({
      sender,
      title,
      description,
      file,
      sendTo,
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Invalid notice data', error: error.message });
  }
};

// @desc    Get notices for the authenticated user
// @route   GET /api/notices
// @access  Private (Student, Supervisor, Committee)
const getNotices = async (req, res) => {
  const userRole = req.user.role;
  const userId = req.user._id;

  let query = {};

  if (userRole === 'student') {
    query = { $or: [{ sendTo: 'students' }, { sendTo: 'all' }] };
  } else if (userRole === 'supervisor') {
    query = { $or: [{ sendTo: 'supervisors' }, { sendTo: 'all' }] };
  } else if (userRole === 'committee') {
    // Committee can see all notices
    query = {};
  } else {
    return res.status(403).json({ message: 'Unauthorized role to view notices' });
  }

  try {
    const notices = await Notice.find(query).sort({ createdAt: -1 }).populate('sender', 'name');
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

// @desc    Get a single notice by ID
// @route   GET /api/notices/:id
// @access  Private (Student, Supervisor, Committee)
const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('sender', 'name');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Ensure the user is authorized to view this notice
    const userRole = req.user.role;
    const isAuthorized = (
      (userRole === 'student' && (notice.sendTo === 'students' || notice.sendTo === 'all')) ||
      (userRole === 'supervisor' && (notice.sendTo === 'supervisors' || notice.sendTo === 'all')) ||
      (userRole === 'committee')
    );

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Unauthorized to view this notice' });
    }

    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
};

// @desc    Mark a notice as read for the authenticated user
// @route   PUT /api/notices/:id/read
// @access  Private (Student, Supervisor, Committee)
const markNoticeAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Add user to readBy array if not already present
    if (!notice.readBy.includes(req.user._id)) {
      notice.readBy.push(req.user._id);
      await notice.save();
    }

    res.status(200).json({ message: 'Notice marked as read', notice });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notice as read', error: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Committee)
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Ensure only the sender (committee) can delete the notice
    if (notice.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await notice.deleteOne();

    res.status(200).json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  markNoticeAsRead,
  deleteNotice,
};