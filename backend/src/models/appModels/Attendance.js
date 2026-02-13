const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  worker: {
    type: mongoose.Schema.ObjectId,
    ref: 'Worker',
    required: true,
    autopopulate: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkIn: {
    type: Date,
    default: null,
  },
  checkOut: {
    type: Date,
    default: null,
  },
  // Lateness in minutes from 08:00 AM start time
  latenessMinutes: {
    type: Number,
    default: 0,
  },
  // Number of 30-min penalty blocks
  penaltyBlocks: {
    type: Number,
    default: 0,
  },
  // Deduction amount based on lateness
  deduction: {
    type: Number,
    default: 0,
  },
  // Net pay for the day after deductions
  netDailyPay: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['checked-in', 'checked-out', 'absent'],
    default: 'absent',
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries - find attendance by worker and date range
attendanceSchema.index({ worker: 1, date: -1 });
// Auto-delete records older than 6 months (180 days)
attendanceSchema.index({ date: 1 }, { expireAfterSeconds: 15552000 });

attendanceSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Attendance', attendanceSchema);
