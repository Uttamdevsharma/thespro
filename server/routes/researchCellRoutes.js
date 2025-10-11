const express = require('express');
const { getResearchCells, addResearchCell } = require('../controllers/researchCellController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(getResearchCells)
  .post(protect, authorizeRoles('committee'), addResearchCell);

module.exports = router;