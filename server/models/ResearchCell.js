const mongoose = require('mongoose');

const ResearchCellSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ResearchCell', ResearchCellSchema);