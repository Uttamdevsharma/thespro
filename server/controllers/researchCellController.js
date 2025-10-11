const ResearchCell = require('../models/ResearchCell');

// @desc    Get all research cells
// @route   GET /api/researchcells
// @access  Public
const getResearchCells = async (req, res) => {
  try {
    const researchCells = await ResearchCell.find({ department: req.user.department });
    res.json(researchCells);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new research cell (by committee member)
// @route   POST /api/researchcells
// @access  Private (Committee)
const addResearchCell = async (req, res) => {
  const { title, description } = req.body;
  const department = req.user.department; // Get department from logged-in user

  const cellExists = await ResearchCell.findOne({ title, department });

  if (cellExists) {
    res.status(400).json({ message: 'Research cell with this title already exists in your department' });
    return;
  }

  try {
    const researchCell = await ResearchCell.create({
      title,
      description,
      department,
    });

    res.status(201).json(researchCell);
  } catch (error) {
    res.status(400).json({ message: 'Invalid research cell data', error: error.message });
  }
};

module.exports = { getResearchCells, addResearchCell };