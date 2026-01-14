import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  defenseType: {
    type: String,
    enum: ['Pre-Defense', 'Final Defense'],
    required: true,
  },
  evaluationType: {
    type: String,
    enum: ['supervisor', 'committee'],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
  },
  comments: {
    type: String,
  },
}, { timestamps: true });

// Validation for marks based on defense and evaluation type
evaluationSchema.path('marks').validate(function (value) {
  if (this.defenseType === 'Pre-Defense') {
    if (this.evaluationType === 'supervisor') {
      return value <= 20;
    }
    if (this.evaluationType === 'committee') {
      return value <= 10;
    }
  }
  if (this.defenseType === 'Final Defense') {
    if (this.evaluationType === 'supervisor') {
      return value <= 40;
    }
    if (this.evaluationType === 'committee') {
      return value <= 30;
    }
  }
  return false;
}, 'Marks exceed the limit for the selected evaluation type.');

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
