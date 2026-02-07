const fs = require('fs');
const path = require('path');

// Log activity with timestamp
function logActivity(username, action, details, logsFile) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    username,
    action,
    details,
    ipAddress: '127.0.0.1' // In production, get from request
  };

  try {
    fs.appendFileSync(logsFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

// Get activity log
function getActivityLog(logsFile, limit = 100) {
  try {
    if (!fs.existsSync(logsFile)) {
      return [];
    }

    const logs = fs.readFileSync(logsFile, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .slice(-limit);

    return logs;
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

// Clear old logs (keep last N entries)
function clearOldLogs(logsFile, keepEntries = 1000) {
  try {
    const logs = getActivityLog(logsFile, keepEntries);
    fs.writeFileSync(logsFile, logs.map(l => JSON.stringify(l)).join('\n') + '\n');
  } catch (error) {
    console.error('Error clearing old logs:', error);
  }
}

module.exports = {
  logActivity,
  getActivityLog,
  clearOldLogs
};
