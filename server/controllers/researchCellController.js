import ResearchCell from '../models/ResearchCell.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all research cells
// @route   GET /api/researchcells
// @access  Public
const getResearchCells = asyncHandler(async (req, res) => {
  const researchCells = await ResearchCell.find({ department: req.user.department });
  res.json(researchCells);
});

// @desc    Add a new research cell (by committee member)
// @route   POST /api/researchcells
// @access  Private (Committee)
const addResearchCell = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const department = req.user.department;

  const cellExists = await ResearchCell.findOne({ title, department });

  if (cellExists) {
    res.status(400);
    throw new Error('Research cell with this title already exists in your department');
  }

  const researchCell = await ResearchCell.create({
    title,
    description,
    department,
  });

  res.status(201).json(researchCell);
});

export { getResearchCells, addResearchCell };