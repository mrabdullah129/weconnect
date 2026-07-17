const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const [[books]] = await db.query('SELECT COUNT(*) as total, SUM(available_copies) as available FROM books');
    const [[borrowed]] = await db.query("SELECT COUNT(*) as count FROM borrow_records WHERE status = 'borrowed'");
    const [[returned]] = await db.query("SELECT COUNT(*) as count FROM return_records");
    const [[lost]] = await db.query("SELECT COUNT(*) as count FROM books WHERE status = 'lost'");
    const [[members]] = await db.query("SELECT COUNT(*) as count FROM members WHERE status = 'active'");
    const [[categories]] = await db.query('SELECT COUNT(*) as count FROM categories');
    const [[authors]] = await db.query('SELECT COUNT(*) as count FROM authors');
    const [[publishers]] = await db.query('SELECT COUNT(*) as count FROM publishers');
    const [[fines]] = await db.query("SELECT COALESCE(SUM(amount),0) as total, COALESCE(SUM(paid_amount),0) as paid FROM fines");
    const [[todayBorrow]] = await db.query('SELECT COUNT(*) as count FROM borrow_records WHERE DATE(borrow_date) = CURDATE()');
    const [[todayReturn]] = await db.query('SELECT COUNT(*) as count FROM return_records WHERE DATE(return_date) = CURDATE()');

    return successResponse(res, 'Dashboard stats fetched.', {
      totalBooks: books.total || 0,
      availableBooks: books.available || 0,
      borrowedBooks: borrowed.count,
      returnedBooks: returned.count,
      lostBooks: lost.count,
      activeMembers: members.count,
      categories: categories.count,
      authors: authors.count,
      publishers: publishers.count,
      totalFines: fines.total,
      paidFines: fines.paid,
      pendingFines: (fines.total - fines.paid).toFixed(2),
      todayBorrowing: todayBorrow.count,
      todayReturns: todayReturn.count,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return errorResponse(res, 'Failed to fetch dashboard stats.', 500);
  }
};

const getMonthlyBorrowStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(borrow_date, '%b %Y') as month,
             MONTH(borrow_date) as month_num,
             YEAR(borrow_date) as year,
             COUNT(*) as count
      FROM borrow_records
      WHERE borrow_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(borrow_date), MONTH(borrow_date)
      ORDER BY year ASC, month_num ASC
    `);
    return successResponse(res, 'Monthly borrow stats.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch monthly stats.', 500);
  }
};

const getMonthlyReturnStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(return_date, '%b %Y') as month,
             COUNT(*) as count
      FROM return_records
      WHERE return_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(return_date), MONTH(return_date)
      ORDER BY YEAR(return_date) ASC, MONTH(return_date) ASC
    `);
    return successResponse(res, 'Monthly return stats.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch return stats.', 500);
  }
};

const getCategoryDistribution = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.name, COUNT(b.id) as count
      FROM categories c
      LEFT JOIN books b ON b.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
      LIMIT 10
    `);
    return successResponse(res, 'Category distribution.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch category distribution.', 500);
  }
};

const getMostBorrowedBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.title, COUNT(br.id) as borrow_count, b.cover_image
      FROM books b
      LEFT JOIN borrow_records br ON br.book_id = b.id
      GROUP BY b.id, b.title
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    return successResponse(res, 'Most borrowed books.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch most borrowed books.', 500);
  }
};

const getActiveMembers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.full_name, m.member_id, COUNT(br.id) as borrow_count
      FROM members m
      LEFT JOIN borrow_records br ON br.member_id = m.id
      GROUP BY m.id, m.full_name, m.member_id
      ORDER BY borrow_count DESC
      LIMIT 10
    `);
    return successResponse(res, 'Active members.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch active members.', 500);
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT al.*, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);
    return successResponse(res, 'Recent activity.', rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch recent activity.', 500);
  }
};

module.exports = {
  getStats,
  getMonthlyBorrowStats,
  getMonthlyReturnStats,
  getCategoryDistribution,
  getMostBorrowedBooks,
  getActiveMembers,
  getRecentActivity,
};
