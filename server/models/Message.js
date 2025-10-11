const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  content: {
    type: String,
  },
  fileUrl: {
    type: String,
  },
  fileType: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
