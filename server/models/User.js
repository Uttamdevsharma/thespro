const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() { return this.role !== 'student'; } // Name is required for committee and supervisor
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'supervisor', 'committee'],
    default: 'student',
  },
  department: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; }, // Student ID is required only for students
    unique: function() { return this.role === 'student'; } // Student ID must be unique for students
  },
  profilePicture: {
    type: String,
    default: '',
  },
  researchCells: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchCell',
    default: [],
  }],
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);