import SubmissionDate from '../models/SubmissionDate.js';
import asyncHandler from 'express-async-handler';

// @desc    Set proposal submission dates
// @route   POST /api/committee/submission-dates
// @access  Private (Committee)
const setSubmissionDates = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  await SubmissionDate.updateMany({ isActive: true }, { $set: { isActive: false } });

  const newSubmissionDate = await SubmissionDate.create({
    startDate,
    endDate,
    createdBy: req.user._id,
    isActive: true,
  });

  res.status(201).json(newSubmissionDate);
});

// @desc    Get active proposal submission dates
// @route   GET /api/committee/submission-dates
// @access  Private
const getSubmissionDates = asyncHandler(async (req, res) => {
  const activeSubmissionDate = await SubmissionDate.findOne({ isActive: true });

  if (!activeSubmissionDate) {
    res.status(404);
    throw new Error('No active submission dates found');
  }

  res.json(activeSubmissionDate);
});

export { setSubmissionDates, getSubmissionDates };