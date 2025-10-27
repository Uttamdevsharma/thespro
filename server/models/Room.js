import mongoose from 'mongoose';

const RoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 5, // Max 5 groups per slot
    },
  },
  { timestamps: true }
);

const Room = mongoose.model('Room', RoomSchema);

export default Room;
