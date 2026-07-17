const db = require('../config/db');

const logActivity = async (userId, action, description, ipAddress = null) => {
  try {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
      [userId || null, action, description, ipAddress]
    );
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
