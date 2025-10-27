import mongoose from 'mongoose';

const ScheduleSlotSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ScheduleSlot = mongoose.model('ScheduleSlot', ScheduleSlotSchema);

export default ScheduleSlot;
