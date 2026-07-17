const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (search) { where += ' AND name LIKE ?'; params.push(`%${search}%`); }
    if (status) { where += ' AND status = ?'; params.push(status); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM categories ${where}`, params);
    const [rows] = await db.query(
      `SELECT c.*, COUNT(b.id) as book_count FROM categories c LEFT JOIN books b ON b.category_id = c.id ${where} GROUP BY c.id ORDER BY c.name ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return paginatedResponse(res, 'Categories fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch categories.', 500);
  }
};

const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM categories WHERE status = 'active' ORDER BY name");
    return successResponse(res, 'Categories.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return errorResponse(res, 'Category name is required.', 400);
    const [r] = await db.query('INSERT INTO categories (name, description, status) VALUES (?,?,?)', [name, description || null, status || 'active']);
    await logActivity(req.user.id, 'CATEGORY_ADDED', `Category "${name}" added`, req.ip);
    const [cat] = await db.query('SELECT * FROM categories WHERE id = ?', [r.insertId]);
    return successResponse(res, 'Category created.', cat[0], 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return errorResponse(res, 'Category name already exists.', 400);
    return errorResponse(res, 'Failed to create category.', 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    if (!name) return errorResponse(res, 'Category name is required.', 400);
    const [ex] = await db.query('SELECT id FROM categories WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Category not found.', 404);
    await db.query('UPDATE categories SET name=?, description=?, status=? WHERE id=?', [name, description || null, status || 'active', id]);
    await logActivity(req.user.id, 'CATEGORY_UPDATED', `Category "${name}" updated`, req.ip);
    const [cat] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return successResponse(res, 'Category updated.', cat[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return errorResponse(res, 'Category name already exists.', 400);
    return errorResponse(res, 'Failed to update category.', 500);
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT name FROM categories WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Category not found.', 404);
    const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM books WHERE category_id = ?', [id]);
    if (count > 0) return errorResponse(res, 'Cannot delete category with associated books.', 400);
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    await logActivity(req.user.id, 'CATEGORY_DELETED', `Category "${ex[0].name}" deleted`, req.ip);
    return successResponse(res, 'Category deleted.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete category.', 500);
  }
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
