const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const generateReturnId = async () => {
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM return_records');
  return `RET-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

const getReturns = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (m.full_name LIKE ? OR bk.title LIKE ? OR rr.return_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM return_records rr
       JOIN borrow_records br ON br.id = rr.borrow_id
       JOIN members m ON m.id = br.member_id
       JOIN books bk ON bk.id = br.book_id ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT rr.*, br.borrow_id as borrow_code, br.borrow_date, br.due_date,
              m.full_name as member_name, m.member_id as member_code,
              bk.title as book_title, bk.isbn,
              u.name as returned_by_name
       FROM return_records rr
       JOIN borrow_records br ON br.id = rr.borrow_id
       JOIN members m ON m.id = br.member_id
       JOIN books bk ON bk.id = br.book_id
       LEFT JOIN users u ON u.id = rr.returned_by
       ${where}
       ORDER BY rr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return paginatedResponse(res, 'Returns fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch returns.', 500);
  }
};

const returnBook = async (req, res) => {
  try {
    const { borrow_id, return_date, remarks } = req.body;
    if (!borrow_id) return errorResponse(res, 'Borrow ID is required.', 400);

    const [borrows] = await db.query(
      `SELECT br.*, b.title as book_title, b.id as book_id_val, m.full_name as member_name, m.id as member_id_val
       FROM borrow_records br JOIN books b ON b.id=br.book_id JOIN members m ON m.id=br.member_id WHERE br.id=?`,
      [borrow_id]
    );
    if (borrows.length === 0) return errorResponse(res, 'Borrow record not found.', 404);
    const borrow = borrows[0];

    if (borrow.status === 'returned') return errorResponse(res, 'Book already returned.', 400);

    const [settings] = await db.query('SELECT fine_per_day FROM settings WHERE id = 1');
    const finePerDay = settings[0]?.fine_per_day || 5;

    const retDate = return_date ? new Date(return_date) : new Date();
    const dueDate = new Date(borrow.due_date);
    const late_days = Math.max(0, Math.floor((retDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = late_days * finePerDay;

    const return_id = await generateReturnId();
    const retDateStr = retDate.toISOString().split('T')[0];

    const [result] = await db.query(
      'INSERT INTO return_records (return_id, borrow_id, return_date, late_days, fine, remarks, returned_by) VALUES (?,?,?,?,?,?,?)',
      [return_id, borrow_id, retDateStr, late_days, fine, remarks || null, req.user.id]
    );

    await db.query("UPDATE borrow_records SET status = 'returned' WHERE id = ?", [borrow_id]);
    await db.query('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?', [borrow.book_id_val]);

    if (fine > 0) {
      await db.query(
        "INSERT INTO fines (borrow_id, member_id, amount, status) VALUES (?,?,?,'pending')",
        [borrow_id, borrow.member_id_val, fine]
      );
    }

    await logActivity(req.user.id, 'BOOK_RETURNED',
      `"${borrow.book_title}" returned by ${borrow.member_name}. Fine: ${fine}`, req.ip);

    const [ret] = await db.query(
      `SELECT rr.*, br.borrow_date, br.due_date, m.full_name as member_name, bk.title as book_title
       FROM return_records rr JOIN borrow_records br ON br.id=rr.borrow_id
       JOIN members m ON m.id=br.member_id JOIN books bk ON bk.id=br.book_id WHERE rr.id=?`,
      [result.insertId]
    );

    return successResponse(res, 'Book returned successfully.', { ...ret[0], fine, late_days }, 201);
  } catch (err) {
    console.error('Return error:', err);
    return errorResponse(res, 'Failed to return book.', 500);
  }
};

const calculateFine = async (req, res) => {
  try {
    const { borrow_id, return_date } = req.query;
    const [borrows] = await db.query('SELECT due_date FROM borrow_records WHERE id = ?', [borrow_id]);
    if (borrows.length === 0) return errorResponse(res, 'Borrow record not found.', 404);

    const [settings] = await db.query('SELECT fine_per_day FROM settings WHERE id = 1');
    const finePerDay = settings[0]?.fine_per_day || 5;

    const retDate = return_date ? new Date(return_date) : new Date();
    const dueDate = new Date(borrows[0].due_date);
    const late_days = Math.max(0, Math.floor((retDate - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = late_days * finePerDay;

    return successResponse(res, 'Fine calculated.', { late_days, fine, fine_per_day: finePerDay });
  } catch (err) {
    return errorResponse(res, 'Failed to calculate fine.', 500);
  }
};

module.exports = { getReturns, returnBook, calculateFine };
