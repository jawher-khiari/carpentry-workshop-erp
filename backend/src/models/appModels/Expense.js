const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['material', 'salary', 'utility', 'maintenance', 'other'],
    default: 'other',
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    default: '',
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

expenseSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Expense', expenseSchema);
