const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getBooksReport = async (req, res) => {
  try {
    const { category, status, from_date, to_date } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (category) { where += ' AND b.category_id = ?'; params.push(category); }
    if (status) { where += ' AND b.status = ?'; params.push(status); }
    if (from_date) { where += ' AND b.created_at >= ?'; params.push(from_date); }
    if (to_date) { where += ' AND b.created_at <= ?'; params.push(to_date + ' 23:59:59'); }

    const [rows] = await db.query(
      `SELECT b.*, a.name as author_name, c.name as category_name, p.name as publisher_name
       FROM books b
       LEFT JOIN authors a ON a.id = b.author_id
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN publishers p ON p.id = b.publisher_id
       ${where} ORDER BY b.title`,
      params
    );
    return successResponse(res, 'Books report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getMembersReport = async (req, res) => {
  try {
    const { status, department, from_date, to_date } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND m.status = ?'; params.push(status); }
    if (department) { where += ' AND m.department LIKE ?'; params.push(`%${department}%`); }
    if (from_date) { where += ' AND m.created_at >= ?'; params.push(from_date); }
    if (to_date) { where += ' AND m.created_at <= ?'; params.push(to_date + ' 23:59:59'); }

    const [rows] = await db.query(
      `SELECT m.*, 
        COUNT(DISTINCT br.id) as total_borrows,
        COUNT(DISTINCT CASE WHEN br.status IN ('borrowed','overdue') THEN br.id END) as active_borrows,
        COALESCE(SUM(CASE WHEN f.status='pending' THEN f.amount ELSE 0 END),0) as pending_fines
       FROM members m
       LEFT JOIN borrow_records br ON br.member_id = m.id
       LEFT JOIN fines f ON f.member_id = m.id
       ${where} GROUP BY m.id ORDER BY m.full_name`,
      params
    );
    return successResponse(res, 'Members report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getBorrowReport = async (req, res) => {
  try {
    const { status, from_date, to_date, member_id } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND br.status = ?'; params.push(status); }
    if (from_date) { where += ' AND br.borrow_date >= ?'; params.push(from_date); }
    if (to_date) { where += ' AND br.borrow_date <= ?'; params.push(to_date); }
    if (member_id) { where += ' AND br.member_id = ?'; params.push(member_id); }

    const [rows] = await db.query(
      `SELECT br.*, m.full_name as member_name, m.member_id as member_code,
              b.title as book_title, b.isbn, u.name as borrowed_by_name
       FROM borrow_records br
       JOIN members m ON m.id = br.member_id
       JOIN books b ON b.id = br.book_id
       LEFT JOIN users u ON u.id = br.borrowed_by
       ${where} ORDER BY br.borrow_date DESC`,
      params
    );
    return successResponse(res, 'Borrow report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getReturnReport = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (from_date) { where += ' AND rr.return_date >= ?'; params.push(from_date); }
    if (to_date) { where += ' AND rr.return_date <= ?'; params.push(to_date); }

    const [rows] = await db.query(
      `SELECT rr.*, br.borrow_date, br.due_date, br.borrow_id as borrow_code,
              m.full_name as member_name, m.member_id as member_code,
              b.title as book_title, u.name as returned_by_name
       FROM return_records rr
       JOIN borrow_records br ON br.id = rr.borrow_id
       JOIN members m ON m.id = br.member_id
       JOIN books b ON b.id = br.book_id
       LEFT JOIN users u ON u.id = rr.returned_by
       ${where} ORDER BY rr.return_date DESC`,
      params
    );
    return successResponse(res, 'Return report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getFineReport = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND f.status = ?'; params.push(status); }
    if (from_date) { where += ' AND f.created_at >= ?'; params.push(from_date); }
    if (to_date) { where += ' AND f.created_at <= ?'; params.push(to_date + ' 23:59:59'); }

    const [rows] = await db.query(
      `SELECT f.*, m.full_name as member_name, m.member_id as member_code,
              b.title as book_title, br.borrow_id as borrow_code
       FROM fines f
       JOIN members m ON m.id = f.member_id
       JOIN borrow_records br ON br.id = f.borrow_id
       JOIN books b ON b.id = br.book_id
       ${where} ORDER BY f.created_at DESC`,
      params
    );
    return successResponse(res, 'Fine report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const getInventoryReport = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, a.name as author_name, c.name as category_name,
              COUNT(CASE WHEN br.status IN ('borrowed','overdue') THEN 1 END) as currently_borrowed
       FROM books b
       LEFT JOIN authors a ON a.id=b.author_id
       LEFT JOIN categories c ON c.id=b.category_id
       LEFT JOIN borrow_records br ON br.book_id=b.id
       GROUP BY b.id ORDER BY c.name, b.title`
    );
    return successResponse(res, 'Inventory report.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

module.exports = { getBooksReport, getMembersReport, getBorrowReport, getReturnReport, getFineReport, getInventoryReport };
