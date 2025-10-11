const Notice = require('../models/Notice');

// @desc    Add a new notice
// @route   POST /api/notices
// @access  Private (Supervisor)
const addNotice = async (req, res) => {
  const { proposalId, groupMembers, title, description } = req.body;
  const supervisorId = req.user._id; // From protect middleware

  try {
    const notice = await Notice.create({
      proposalId,
      groupMembers,
      supervisorId,
      title,
      description,
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ message: 'Invalid notice data', error: error.message });
  }
};

module.exports = { addNotice };