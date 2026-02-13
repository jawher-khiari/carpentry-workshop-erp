const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const backup = async (req, res) => {
  try {
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    const dbUri = process.env.DATABASE || 'mongodb://localhost:27017/carpentry-workshop';

    execFile('mongodump', ['--uri', dbUri, '--out', backupPath], (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          success: false,
          result: null,
          message: 'Backup failed: ' + error.message,
        });
      }
      
      return res.status(200).json({
        success: true,
        result: { path: backupPath, timestamp },
        message: 'Database backup created successfully',
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Backup failed: ' + error.message,
    });
  }
};

module.exports = { backup };
