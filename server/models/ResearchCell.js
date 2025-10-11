const mongoose = require('mongoose');

const ResearchCellSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ResearchCell', ResearchCellSchema);