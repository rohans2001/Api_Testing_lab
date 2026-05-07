const { sendSuccess } = require('../utils/responseUtils');

const getSystemLogs = (req, res) => {
  // Simulate returning system logs
  const logs = [
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'System startup complete' },
    { timestamp: new Date().toISOString(), level: 'WARNING', message: 'High CPU load detected' }
  ];
  sendSuccess(res, 200, 'Logs retrieved', logs);
};

const toggleMaintenance = (req, res) => {
  const { enabled } = req.body;
  process.env.ENABLE_MAINTENANCE_MODE = enabled ? 'true' : 'false';
  sendSuccess(res, 200, `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
};

module.exports = { getSystemLogs, toggleMaintenance };
