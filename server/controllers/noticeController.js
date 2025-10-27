import Notice from '../models/Notice.js';
import User from '../models/User.js';
import Proposal from '../models/Proposal.js';
import asyncHandler from 'express-async-handler';

const createCommitteeNotice = asyncHandler(async (req, res) => {
  const { title, description, sendTo } = req.body;
  const sender = req.user._id;

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
});

const getCommitteeSentNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ sender: req.user._id }).sort({ createdAt: -1 }).populate('sender', 'name');
  res.status(200).json(notices);
});

const sendNoticeToGroup = asyncHandler(async (req, res) => {
  const { title, description, groupId } = req.body;
  const sender = req.user._id;

  let recipients = [];

  if (groupId === 'all') {
    const proposals = await Proposal.find({ supervisorId: sender });
    const members = proposals.flatMap(p => p.members);
    recipients = [...new Set(members)];
  } else {
    const proposal = await Proposal.findById(groupId);
    if (!proposal) {
      res.status(404);
      throw new Error('Proposal not found');
    }
    recipients = proposal.members;
  }

  if (recipients.length === 0) {
    res.status(400);
    throw new Error('No recipients found for this notice.');
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
});

const getSupervisorSentNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find({ sender: req.user._id }).sort({ createdAt: -1 }).populate('sender', 'name');
  res.status(200).json(notices);
});

const getNotices = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let notices;
  if (req.user.role === 'committee') {
    notices = await Notice.find({}).sort({ createdAt: -1 }).populate('sender', 'name role');
  } else {
    notices = await Notice.find({ recipients: userId }).sort({ createdAt: -1 }).populate('sender', 'name role');
  }
  res.status(200).json(notices);
});

const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('sender', 'name');

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  if (req.user.role !== 'committee' && !notice.recipients.includes(req.user._id)) {
    res.status(403);
    throw new Error('Unauthorized to view this notice');
  }

  res.status(200).json(notice);
});

const markNoticeAsRead = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  if (!notice.readBy.includes(req.user._id)) {
    notice.readBy.push(req.user._id);
    await notice.save();
  }

  res.status(200).json({ message: 'Notice marked as read', notice });
});

const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    res.status(404);
    throw new Error('Notice not found');
  }

  if (notice.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notice');
  }

  await notice.deleteOne();

  res.status(200).json({ message: 'Notice removed' });
});

export { createCommitteeNotice, getCommitteeSentNotices, sendNoticeToGroup, getSupervisorSentNotices, getNotices, getNoticeById, markNoticeAsRead, deleteNotice, };