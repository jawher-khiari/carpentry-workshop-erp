const mongoose = require('mongoose');

const Model = mongoose.model('Attendance');
const Worker = mongoose.model('Worker');

const checkIn = async (req, res) => {
  try {
    const { worker: workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Worker ID is required',
      });
    }

    // Fetch the worker to get their dailyWage
    const workerDoc = await Worker.findOne({
      _id: workerId,
      removed: false,
    }).exec();

    if (!workerDoc) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Worker not found',
      });
    }

    const { dailyWage } = workerDoc;

    // Build start and end of today for querying
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Check if an attendance record already exists for this worker today
    const existing = await Model.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      removed: false,
    }).exec();

    if (existing && existing.status === 'checked-in') {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Worker is already checked in for today',
      });
    }

    // Calculate lateness from 08:00 AM standard start time
    const standardStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);

    let latenessMinutes = 0;
    let penaltyBlocks = 0;
    let deduction = 0;

    if (now > standardStart) {
      latenessMinutes = Math.floor((now - standardStart) / (1000 * 60));
      penaltyBlocks = Math.floor(latenessMinutes / 30);
      // Each penalty block costs half-hour worth of daily wage
      // 8-hour day = 16 half-hours, so half-hour rate = dailyWage / 16
      deduction = penaltyBlocks * (dailyWage / 16);
    }

    const netDailyPay = dailyWage - deduction;

    const attendanceData = {
      worker: workerId,
      date: startOfDay,
      checkIn: now,
      latenessMinutes,
      penaltyBlocks,
      deduction,
      netDailyPay,
      status: 'checked-in',
      createdBy: req.admin._id,
    };

    let result;

    if (existing) {
      // Update the existing record (e.g., re-checking in after being marked absent)
      result = await Model.findOneAndUpdate(
        { _id: existing._id },
        attendanceData,
        { new: true }
      ).exec();
    } else {
      result = await new Model(attendanceData).save();
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Worker checked in successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'An error occurred during check-in',
    });
  }
};

module.exports = checkIn;
