import mongoose from 'mongoose';

const DefenseBoardSchema = mongoose.Schema(
  {
    defenseType: {
      type: String,
      required: true,
      enum: ['Pre-Defense', 'Final Defense'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleSlot',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: true,
      },
    ],
    comments: [
      {
        group: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Proposal',
        },
        text: {
          type: String,
        },
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    boardMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    logs: [
      {
        action: {
          type: String, // e.g., 'CREATED', 'UPDATED', 'DELETED'
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const DefenseBoard = mongoose.model('DefenseBoard', DefenseBoardSchema);

export default DefenseBoard;