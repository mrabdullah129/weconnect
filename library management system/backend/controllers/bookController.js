const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

// GET /api/books
const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '', author = '', status = '', sortBy = 'b.created_at', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (b.title LIKE ? OR b.isbn LIKE ? OR b.barcode LIKE ? OR a.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { where += ' AND b.category_id = ?'; params.push(category); }
    if (author) { where += ' AND b.author_id = ?'; params.push(author); }
    if (status) { where += ' AND b.status = ?'; params.push(status); }

    const validSorts = ['b.title', 'b.created_at', 'b.available_copies', 'b.total_copies'];
    const safeSort = validSorts.includes(sortBy) ? sortBy : 'b.created_at';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM books b LEFT JOIN authors a ON a.id = b.author_id LEFT JOIN categories c ON c.id = b.category_id ${where}`,
      params
    );

    const [books] = await db.query(
      `SELECT b.*, a.name as author_name, c.name as category_name, p.name as publisher_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN publishers p ON p.id = b.publisher_id
       ${where}
       ORDER BY ${safeSort} ${safeOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return paginatedResponse(res, 'Books fetched.', books, {
      total, page: parseInt(page), limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get books error:', err);
    return errorResponse(res, 'Failed to fetch books.', 500);
  }
};

// GET /api/books/:id
const getBook = async (req, res) => {
  try {
    const [books] = await db.query(
      `SELECT b.*, a.name as author_name, c.name as category_name, p.name as publisher_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN publishers p ON p.id = b.publisher_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (books.length === 0) return errorResponse(res, 'Book not found.', 404);
    return successResponse(res, 'Book fetched.', books[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch book.', 500);
  }
};

// POST /api/books
const createBook = async (req, res) => {
  try {
    const {
      isbn, barcode, title, subtitle, author_id, category_id, publisher_id,
      edition, language, shelf_number, rack_number, purchase_date, purchase_price,
      total_copies, description, status
    } = req.body;

    if (!title) return errorResponse(res, 'Book title is required.', 400);

    const cover_image = req.files?.cover_image ? `/uploads/books/${req.files.cover_image[0].filename}` : null;
    const pdf_file = req.files?.pdf_file ? `/uploads/books/${req.files.pdf_file[0].filename}` : null;
    const available_copies = parseInt(total_copies) || 1;

    const [result] = await db.query(
      `INSERT INTO books (isbn, barcode, title, subtitle, author_id, category_id, publisher_id,
        edition, language, shelf_number, rack_number, purchase_date, purchase_price,
        total_copies, available_copies, description, cover_image, pdf_file, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [isbn||null, barcode||null, title, subtitle||null, author_id||null, category_id||null, publisher_id||null,
       edition||null, language||'English', shelf_number||null, rack_number||null, purchase_date||null, purchase_price||null,
       available_copies, available_copies, description||null, cover_image, pdf_file, status||'available']
    );

    await logActivity(req.user.id, 'BOOK_ADDED', `Book "${title}" added`, req.ip);
    const [book] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    return successResponse(res, 'Book created successfully.', book[0], 201);
  } catch (err) {
    console.error('Create book error:', err);
    if (err.code === 'ER_DUP_ENTRY') return errorResponse(res, 'ISBN already exists.', 400);
    return errorResponse(res, 'Failed to create book.', 500);
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (existing.length === 0) return errorResponse(res, 'Book not found.', 404);

    const {
      isbn, barcode, title, subtitle, author_id, category_id, publisher_id,
      edition, language, shelf_number, rack_number, purchase_date, purchase_price,
      total_copies, description, status
    } = req.body;

    const cover_image = req.files?.cover_image
      ? `/uploads/books/${req.files.cover_image[0].filename}`
      : existing[0].cover_image;
    const pdf_file = req.files?.pdf_file
      ? `/uploads/books/${req.files.pdf_file[0].filename}`
      : existing[0].pdf_file;

    const tc = parseInt(total_copies) || existing[0].total_copies;
    const diff = tc - existing[0].total_copies;
    const available = Math.max(0, existing[0].available_copies + diff);

    await db.query(
      `UPDATE books SET isbn=?, barcode=?, title=?, subtitle=?, author_id=?, category_id=?,
       publisher_id=?, edition=?, language=?, shelf_number=?, rack_number=?, purchase_date=?,
       purchase_price=?, total_copies=?, available_copies=?, description=?, cover_image=?, pdf_file=?, status=?
       WHERE id = ?`,
      [isbn||null, barcode||null, title, subtitle||null, author_id||null, category_id||null, publisher_id||null,
       edition||null, language||'English', shelf_number||null, rack_number||null, purchase_date||null, purchase_price||null,
       tc, available, description||null, cover_image, pdf_file, status||'available', id]
    );

    await logActivity(req.user.id, 'BOOK_UPDATED', `Book "${title}" updated`, req.ip);
    const [book] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    return successResponse(res, 'Book updated successfully.', book[0]);
  } catch (err) {
    console.error('Update book error:', err);
    return errorResponse(res, 'Failed to update book.', 500);
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const [books] = await db.query('SELECT title FROM books WHERE id = ?', [id]);
    if (books.length === 0) return errorResponse(res, 'Book not found.', 404);

    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM borrow_records WHERE book_id = ? AND status = 'borrowed'", [id]
    );
    if (count > 0) return errorResponse(res, 'Cannot delete book with active borrows.', 400);

    await db.query('DELETE FROM books WHERE id = ?', [id]);
    await logActivity(req.user.id, 'BOOK_DELETED', `Book "${books[0].title}" deleted`, req.ip);
    return successResponse(res, 'Book deleted successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete book.', 500);
  }
};

// GET /api/books/search/global
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return successResponse(res, 'Search results.', []);

    const [books] = await db.query(
      `SELECT b.id, b.title, b.isbn, b.cover_image, b.available_copies, b.status,
              a.name as author_name, c.name as category_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.title LIKE ? OR b.isbn LIKE ? OR a.name LIKE ? OR c.name LIKE ?
       LIMIT 20`,
      [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
    );
    return successResponse(res, 'Search results.', books);
  } catch (err) {
    return errorResponse(res, 'Search failed.', 500);
  }
};

module.exports = { getBooks, getBook, createBook, updateBook, deleteBook, globalSearch };
