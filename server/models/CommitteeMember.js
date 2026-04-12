import mongoose from 'mongoose';

const CommitteeMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  }
}, { timestamps: true });

// Ensure a user can only be assigned to a department as a committee member once
CommitteeMemberSchema.index({ userId: 1, departmentId: 1 }, { unique: true });

export default mongoose.model('CommitteeMember', CommitteeMemberSchema);
