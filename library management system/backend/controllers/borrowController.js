const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const generateBorrowId = async () => {
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM borrow_records');
  return `BRW-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

const getBorrows = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', member_id = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (m.full_name LIKE ? OR b.title LIKE ? OR br.borrow_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { where += ' AND br.status = ?'; params.push(status); }
    if (member_id) { where += ' AND br.member_id = ?'; params.push(member_id); }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM borrow_records br
       JOIN members m ON m.id = br.member_id
       JOIN books b ON b.id = br.book_id ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT br.*, m.full_name as member_name, m.member_id as member_code,
              b.title as book_title, b.isbn, b.cover_image,
              u.name as borrowed_by_name
       FROM borrow_records br
       JOIN members m ON m.id = br.member_id
       JOIN books b ON b.id = br.book_id
       LEFT JOIN users u ON u.id = br.borrowed_by
       ${where}
       ORDER BY br.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Mark overdue
    const today = new Date().toISOString().split('T')[0];
    rows.forEach(r => {
      if (r.status === 'borrowed' && r.due_date < today) r.status = 'overdue';
    });

    return paginatedResponse(res, 'Borrows fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch borrows.', 500);
  }
};

const borrowBook = async (req, res) => {
  try {
    const { member_id, book_id, borrow_date, due_date } = req.body;
    if (!member_id || !book_id) return errorResponse(res, 'Member and book are required.', 400);

    // Check member
    const [members] = await db.query('SELECT * FROM members WHERE id = ?', [member_id]);
    if (members.length === 0) return errorResponse(res, 'Member not found.', 404);
    if (members[0].status !== 'active') return errorResponse(res, 'Member is not active.', 400);

    // Check expiry
    if (members[0].expiry_date && new Date(members[0].expiry_date) < new Date()) {
      return errorResponse(res, 'Member membership has expired.', 400);
    }

    // Check book
    const [books] = await db.query('SELECT * FROM books WHERE id = ?', [book_id]);
    if (books.length === 0) return errorResponse(res, 'Book not found.', 404);
    if (books[0].available_copies <= 0) return errorResponse(res, 'No copies available for borrowing.', 400);

    // Check borrow limit
    const [settings] = await db.query('SELECT max_borrow_limit, borrow_duration FROM settings WHERE id = 1');
    const maxLimit = settings[0]?.max_borrow_limit || 5;
    const duration = settings[0]?.borrow_duration || 14;

    const [[{ activeBorrows }]] = await db.query(
      "SELECT COUNT(*) as activeBorrows FROM borrow_records WHERE member_id = ? AND status IN ('borrowed','overdue')",
      [member_id]
    );
    if (activeBorrows >= maxLimit) {
      return errorResponse(res, `Borrow limit of ${maxLimit} books reached.`, 400);
    }

    // Check duplicate
    const [[{ dupCount }]] = await db.query(
      "SELECT COUNT(*) as dupCount FROM borrow_records WHERE member_id = ? AND book_id = ? AND status IN ('borrowed','overdue')",
      [member_id, book_id]
    );
    if (dupCount > 0) return errorResponse(res, 'Member already has this book borrowed.', 400);

    const today = borrow_date || new Date().toISOString().split('T')[0];
    const dueDate = due_date || (() => {
      const d = new Date(); d.setDate(d.getDate() + duration);
      return d.toISOString().split('T')[0];
    })();

    const borrow_id = await generateBorrowId();

    const [result] = await db.query(
      'INSERT INTO borrow_records (borrow_id, member_id, book_id, borrow_date, due_date, borrowed_by, status) VALUES (?,?,?,?,?,?,?)',
      [borrow_id, member_id, book_id, today, dueDate, req.user.id, 'borrowed']
    );

    await db.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);

    await logActivity(req.user.id, 'BOOK_BORROWED',
      `"${books[0].title}" borrowed by ${members[0].full_name}`, req.ip);

    const [borrow] = await db.query(
      `SELECT br.*, m.full_name as member_name, b.title as book_title
       FROM borrow_records br JOIN members m ON m.id=br.member_id JOIN books b ON b.id=br.book_id WHERE br.id=?`,
      [result.insertId]
    );

    return successResponse(res, 'Book borrowed successfully.', borrow[0], 201);
  } catch (err) {
    console.error('Borrow error:', err);
    return errorResponse(res, 'Failed to borrow book.', 500);
  }
};

const getBorrow = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT br.*, m.full_name as member_name, m.member_id as member_code, m.phone as member_phone,
              b.title as book_title, b.isbn, b.cover_image, u.name as borrowed_by_name
       FROM borrow_records br
       JOIN members m ON m.id = br.member_id
       JOIN books b ON b.id = br.book_id
       LEFT JOIN users u ON u.id = br.borrowed_by
       WHERE br.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return errorResponse(res, 'Borrow record not found.', 404);
    return successResponse(res, 'Borrow record fetched.', rows[0]);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

module.exports = { getBorrows, borrowBook, getBorrow };
