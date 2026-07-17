const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND (a.name LIKE ? OR a.country LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM authors a ${where}`, params);
    const [rows] = await db.query(
      `SELECT a.*, COUNT(b.id) as book_count FROM authors a LEFT JOIN books b ON b.author_id = a.id ${where} GROUP BY a.id ORDER BY a.name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return paginatedResponse(res, 'Authors fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch authors.', 500);
  }
};

const getAllAuthors = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM authors WHERE status = 'active' ORDER BY name");
    return successResponse(res, 'Authors.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getAuthor = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM authors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return errorResponse(res, 'Author not found.', 404);
    return successResponse(res, 'Author fetched.', rows[0]);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const createAuthor = async (req, res) => {
  try {
    const { name, country, biography, status } = req.body;
    if (!name) return errorResponse(res, 'Author name is required.', 400);
    const image = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    const [r] = await db.query(
      'INSERT INTO authors (name, country, biography, image, status) VALUES (?,?,?,?,?)',
      [name, country || null, biography || null, image, status || 'active']
    );
    await logActivity(req.user.id, 'AUTHOR_ADDED', `Author "${name}" added`, req.ip);
    const [author] = await db.query('SELECT * FROM authors WHERE id = ?', [r.insertId]);
    return successResponse(res, 'Author created.', author[0], 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create author.', 500);
  }
};

const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT * FROM authors WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Author not found.', 404);
    const { name, country, biography, status } = req.body;
    const image = req.file ? `/uploads/avatars/${req.file.filename}` : ex[0].image;
    await db.query(
      'UPDATE authors SET name=?, country=?, biography=?, image=?, status=? WHERE id=?',
      [name, country || null, biography || null, image, status || 'active', id]
    );
    await logActivity(req.user.id, 'AUTHOR_UPDATED', `Author "${name}" updated`, req.ip);
    const [author] = await db.query('SELECT * FROM authors WHERE id = ?', [id]);
    return successResponse(res, 'Author updated.', author[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to update author.', 500);
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT name FROM authors WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Author not found.', 404);
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE author_id = ?', [id]);
    if (count > 0) return errorResponse(res, 'Cannot delete author with associated books.', 400);
    await db.query('DELETE FROM authors WHERE id = ?', [id]);
    await logActivity(req.user.id, 'AUTHOR_DELETED', `Author "${ex[0].name}" deleted`, req.ip);
    return successResponse(res, 'Author deleted.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete author.', 500);
  }
};

module.exports = { getAuthors, getAllAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor };
