import mongoose from 'mongoose';

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

export default mongoose.model('ResearchCell', ResearchCellSchema);