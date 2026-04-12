import mongoose from 'mongoose';

const PublishedResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each student can have only one published result
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  point: {
    type: Number,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const PublishedResult = mongoose.model('PublishedResult', PublishedResultSchema);

export default PublishedResult;
