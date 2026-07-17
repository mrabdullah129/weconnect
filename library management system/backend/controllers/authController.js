const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const [users] = await db.query(
      'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const user = users[0];
    if (user.status !== 'active') {
      return errorResponse(res, 'Your account has been deactivated. Contact admin.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    await logActivity(user.id, 'LOGIN', `User ${user.name} logged in`, req.ip);

    const token = generateToken(user);
    const { password: pwd, reset_token, reset_token_expire, ...userData } = user;

    return successResponse(res, 'Login successful.', { token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, 'Server error during login.', 500);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    await logActivity(req.user.id, 'LOGOUT', `User ${req.user.name} logged out`, req.ip);
    return successResponse(res, 'Logged out successfully.');
  } catch (err) {
    return errorResponse(res, 'Server error.', 500);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.avatar, u.status, u.last_login, u.created_at, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [req.user.id]
    );
    if (users.length === 0) return errorResponse(res, 'User not found.', 404);
    return successResponse(res, 'Profile fetched.', users[0]);
  } catch (err) {
    return errorResponse(res, 'Server error.', 500);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new password are required.', 400);
    }
    if (newPassword.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters.', 400);
    }

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect.', 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    await logActivity(req.user.id, 'CHANGE_PASSWORD', 'Password changed successfully', req.ip);

    return successResponse(res, 'Password changed successfully.');
  } catch (err) {
    return errorResponse(res, 'Server error.', 500);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    let query = 'UPDATE users SET name = ?, phone = ?';
    let params = [name, phone];

    if (avatar) {
      query += ', avatar = ?';
      params.push(avatar);
    }
    query += ' WHERE id = ?';
    params.push(req.user.id);

    await db.query(query, params);
    await logActivity(req.user.id, 'UPDATE_PROFILE', 'Profile updated', req.ip);

    const [updated] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.avatar, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [req.user.id]
    );

    return successResponse(res, 'Profile updated successfully.', updated[0]);
  } catch (err) {
    return errorResponse(res, 'Server error.', 500);
  }
};

module.exports = { login, logout, getMe, changePassword, updateProfile };
