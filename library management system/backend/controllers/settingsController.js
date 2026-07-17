const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
    return successResponse(res, 'Settings fetched.', rows[0] || {});
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const updateSettings = async (req, res) => {
  try {
    const {
      library_name, address, email, phone,
      fine_per_day, max_borrow_limit, borrow_duration, theme
    } = req.body;

    const logo = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    let query = `UPDATE settings SET library_name=?, address=?, email=?, phone=?,
      fine_per_day=?, max_borrow_limit=?, borrow_duration=?, theme=?`;
    let params = [library_name, address, email, phone, fine_per_day, max_borrow_limit, borrow_duration, theme || 'light'];

    if (logo) {
      query += ', logo=?';
      params.push(logo);
    }
    query += ' WHERE id = 1';

    await db.query(query, params);
    await logActivity(req.user.id, 'SETTINGS_UPDATED', 'Library settings updated', req.ip);

    const [settings] = await db.query('SELECT * FROM settings WHERE id = 1');
    return successResponse(res, 'Settings updated.', settings[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to update settings.', 500);
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      where += ' AND (al.action LIKE ? OR al.description LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM activity_logs al LEFT JOIN users u ON u.id=al.user_id ${where}`, params
    );
    const [rows] = await db.query(
      `SELECT al.*, u.name as user_name FROM activity_logs al LEFT JOIN users u ON u.id=al.user_id
       ${where} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({
      success: true, message: 'Activity logs.', data: rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.avatar, u.status, u.last_login, u.created_at, r.name as role_name FROM users u JOIN roles r ON r.id=u.role_id ORDER BY u.created_at DESC'
    );
    return successResponse(res, 'Users fetched.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const createUser = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, phone, role_id } = req.body;
    if (!name || !email || !password) return errorResponse(res, 'Name, email and password are required.', 400);

    const hashed = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO users (name, email, password, phone, role_id) VALUES (?,?,?,?,?)',
      [name, email, hashed, phone || null, role_id || 2]
    );
    await logActivity(req.user.id, 'USER_CREATED', `User "${name}" created`, req.ip);
    const [user] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.status, r.name as role_name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?',
      [r.insertId]
    );
    return successResponse(res, 'User created.', user[0], 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return errorResponse(res, 'Email already exists.', 400);
    return errorResponse(res, 'Failed.', 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status, role_id } = req.body;
    await db.query('UPDATE users SET name=?, phone=?, status=?, role_id=? WHERE id=?',
      [name, phone || null, status || 'active', role_id || 2, id]);
    await logActivity(req.user.id, 'USER_UPDATED', `User "${name}" updated`, req.ip);
    return successResponse(res, 'User updated.');
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return errorResponse(res, 'Cannot delete your own account.', 400);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(req.user.id, 'USER_DELETED', `User #${id} deleted`, req.ip);
    return successResponse(res, 'User deleted.');
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

module.exports = { getSettings, updateSettings, getActivityLogs, getUsers, createUser, updateUser, deleteUser };
