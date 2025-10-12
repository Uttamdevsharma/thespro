const Notice = require('../models/Notice');
const User = require('../models/User');
const Proposal = require('../models/Proposal');

const createCommitteeNotice = async (req, res) => {
  const { title, description, sendTo } = req.body;
  const sender = req.user._id;

  try {
    let recipients = [];
    if (sendTo === 'all') {
      const users = await User.find({ role: { $in: ['student', 'supervisor'] }, department: req.user.department });
      recipients = users.map(user => user._id);
    } else {
      const users = await User.find({ role: sendTo, department: req.user.department });
      recipients = users.map(user => user._id);
    }

    const notice = await Notice.create({
      sender,
      title,
      description,
      recipients,
    });

    const io = req.app.get('socketio');
    recipients.forEach(recipientId => {
      io.emit('newNotice', { recipientId, notice });
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Invalid notice data', error: error.message });
  }
};

const getCommitteeSentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ sender: req.user._id }).sort({ createdAt: -1 }).populate('sender', 'name');
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

const sendNoticeToGroup = async (req, res) => {
  const { title, description, groupId } = req.body;
  const sender = req.user._id;

  try {
    let recipients = [];

    if (groupId === 'all') {
      const proposals = await Proposal.find({ supervisorId: sender });
      const members = proposals.flatMap(p => p.members);
      recipients = [...new Set(members)]; // Get unique members
    } else {
      const proposal = await Proposal.findById(groupId);
      if (!proposal) {
        return res.status(404).json({ message: 'Proposal not found' });
      }
      recipients = proposal.members;
    }

    if (recipients.length === 0) {
      return res.status(400).json({ message: 'No recipients found for this notice.' });
    }

    const notice = await Notice.create({
      sender,
      title,
      description,
      recipients,
    });

    const io = req.app.get('socketio');
    recipients.forEach(recipientId => {
      io.emit('newNotice', { recipientId, notice });
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Invalid notice data', error: error.message });
  }
};

const getSupervisorSentNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ sender: req.user._id }).sort({ createdAt: -1 }).populate('sender', 'name');
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

const getNotices = async (req, res) => {
  const userId = req.user._id;

  try {
    let notices;
    if (req.user.role === 'committee') {
      notices = await Notice.find({}).sort({ createdAt: -1 }).populate('sender', 'name');
    } else {
      notices = await Notice.find({ recipients: userId }).sort({ createdAt: -1 }).populate('sender', 'name');
    }
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notices', error: error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('sender', 'name');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (req.user.role !== 'committee' && !notice.recipients.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized to view this notice' });
    }

    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
};

const markNoticeAsRead = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (!notice.readBy.includes(req.user._id)) {
      notice.readBy.push(req.user._id);
      await notice.save();
    }

    res.status(200).json({ message: 'Notice marked as read', notice });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notice as read', error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

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
  createCommitteeNotice,
  getCommitteeSentNotices,
  sendNoticeToGroup,
  getSupervisorSentNotices,
  getNotices,
  getNoticeById,
  markNoticeAsRead,
  deleteNotice,
};