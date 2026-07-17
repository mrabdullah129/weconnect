const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const getFines = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (m.full_name LIKE ? OR m.member_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) { where += ' AND f.status = ?'; params.push(status); }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM fines f
       JOIN members m ON m.id = f.member_id
       JOIN borrow_records br ON br.id = f.borrow_id ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT f.*, m.full_name as member_name, m.member_id as member_code, m.phone as member_phone,
              b.title as book_title, br.borrow_id as borrow_code, br.borrow_date, br.due_date
       FROM fines f
       JOIN members m ON m.id = f.member_id
       JOIN borrow_records br ON br.id = f.borrow_id
       JOIN books b ON b.id = br.book_id
       ${where}
       ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return paginatedResponse(res, 'Fines fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch fines.', 500);
  }
};

const payFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_amount, remarks } = req.body;

    const [fines] = await db.query(
      `SELECT f.*, m.full_name as member_name FROM fines f JOIN members m ON m.id=f.member_id WHERE f.id=?`, [id]
    );
    if (fines.length === 0) return errorResponse(res, 'Fine not found.', 404);
    if (fines[0].status === 'paid') return errorResponse(res, 'Fine already paid.', 400);

    const amount = parseFloat(paid_amount) || fines[0].amount;

    await db.query(
      "UPDATE fines SET paid_amount=?, status='paid', paid_date=CURDATE(), remarks=? WHERE id=?",
      [amount, remarks || null, id]
    );

    await logActivity(req.user.id, 'FINE_PAID',
      `Fine of ${amount} paid by ${fines[0].member_name}`, req.ip);

    const [fine] = await db.query('SELECT * FROM fines WHERE id = ?', [id]);
    return successResponse(res, 'Fine paid successfully.', fine[0]);
  } catch (err) {
    return errorResponse(res, 'Failed to pay fine.', 500);
  }
};

const waiveFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const [fines] = await db.query('SELECT * FROM fines WHERE id = ?', [id]);
    if (fines.length === 0) return errorResponse(res, 'Fine not found.', 404);

    await db.query("UPDATE fines SET status='waived', remarks=? WHERE id=?", [remarks || null, id]);
    await logActivity(req.user.id, 'FINE_WAIVED', `Fine #${id} waived`, req.ip);

    return successResponse(res, 'Fine waived successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to waive fine.', 500);
  }
};

const getFineStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*) as total_fines,
        COALESCE(SUM(amount),0) as total_amount,
        COALESCE(SUM(CASE WHEN status='paid' THEN paid_amount ELSE 0 END),0) as paid_amount,
        COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) as pending_amount,
        COUNT(CASE WHEN status='paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status='pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status='waived' THEN 1 END) as waived_count
      FROM fines
    `);
    return successResponse(res, 'Fine stats.', stats);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch fine stats.', 500);
  }
};

module.exports = { getFines, payFine, waiveFine, getFineStats };
