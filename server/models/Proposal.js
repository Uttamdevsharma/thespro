import mongoose from 'mongoose';

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
  coSupervisors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  courseSupervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  numberOfMembers: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending Committee', 'Pending Supervisor', 'Approved', 'Not Approved'],
    default: 'Pending Committee',
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
  defenseBoardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DefenseBoard',
    default: null,
  },
  published: {
    type: Boolean,
    default: false,
  },
  grade: {
    type: String,
    default: null,
  },
  point: {
    type: Number,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Proposal', ProposalSchema);