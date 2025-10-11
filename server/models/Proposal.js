const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Thesis', 'Project'],
    default: 'Thesis',
  },
  researchCellId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchCell',
    required: true,
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  feedback: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);