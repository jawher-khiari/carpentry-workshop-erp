const mongoose = require('mongoose');

const Model = mongoose.model('Attendance');

const checkOut = async (req, res) => {
  try {
    const { worker: workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Worker ID is required',
      });
    }

    // Find today's attendance record for this worker
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const existing = await Model.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      removed: false,
    }).exec();

    if (!existing) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No check-in record found for this worker today',
      });
    }

    if (existing.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Worker is already checked out for today',
      });
    }

    const result = await Model.findOneAndUpdate(
      { _id: existing._id },
      {
        checkOut: now,
        status: 'checked-out',
      },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Worker checked out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'An error occurred during check-out',
    });
  }
};

module.exports = checkOut;
