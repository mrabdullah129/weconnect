const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getPublishers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND (p.name LIKE ? OR p.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM publishers p ${where}`, params);
    const [rows] = await db.query(
      `SELECT p.*, COUNT(b.id) as book_count FROM publishers p LEFT JOIN books b ON b.publisher_id = p.id ${where} GROUP BY p.id ORDER BY p.name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return paginatedResponse(res, 'Publishers fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch publishers.', 500);
  }
};

const getAllPublishers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM publishers WHERE status = 'active' ORDER BY name");
    return successResponse(res, 'Publishers.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const createPublisher = async (req, res) => {
  try {
    const { name, address, phone, email, website, status } = req.body;
    if (!name) return errorResponse(res, 'Publisher name is required.', 400);
    const [r] = await db.query(
      'INSERT INTO publishers (name, address, phone, email, website, status) VALUES (?,?,?,?,?,?)',
      [name, address || null, phone || null, email || null, website || null, status || 'active']
    );
    await logActivity(req.user.id, 'PUBLISHER_ADDED', `Publisher "${name}" added`, req.ip);
    const [pub] = await db.query('SELECT * FROM publishers WHERE id = ?', [r.insertId]);
    return successResponse(res, 'Publisher created.', pub[0], 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create publisher.', 500);
  }
};

const updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT id FROM publishers WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Publisher not found.', 404);
    const { name, address, phone, email, website, status } = req.body;
    await db.query(
      'UPDATE publishers SET name=?, address=?, phone=?, email=?, website=?, status=? WHERE id=?',
      [name, address || null, phone || null, email || null, website || null, status || 'active', id]
    );
    await logActivity(req.user.id, 'PUBLISHER_UPDATED', `Publisher "${name}" updated`, req.ip);
    const [pub] = await db.query('SELECT * FROM publishers WHERE id = ?', [id]);
    return successResponse(res, 'Publisher updated.', pub[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to update publisher.', 500);
  }
};

const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT name FROM publishers WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Publisher not found.', 404);
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE publisher_id = ?', [id]);
    if (count > 0) return errorResponse(res, 'Cannot delete publisher with associated books.', 400);
    await db.query('DELETE FROM publishers WHERE id = ?', [id]);
    await logActivity(req.user.id, 'PUBLISHER_DELETED', `Publisher "${ex[0].name}" deleted`, req.ip);
    return successResponse(res, 'Publisher deleted.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete publisher.', 500);
  }
};

module.exports = { getPublishers, getAllPublishers, createPublisher, updatePublisher, deletePublisher };
