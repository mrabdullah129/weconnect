const db = require('../config/db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { logActivity } = require('../utils/logger');

const generateMemberId = async () => {
  const year = new Date().getFullYear();
  const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM members');
  return `MEM-${year}-${String(count + 1).padStart(4, '0')}`;
};

const getMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', department = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = 'WHERE 1=1';
    const params = [];
    if (search) {
      where += ' AND (full_name LIKE ? OR member_id LIKE ? OR cnic LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (department) { where += ' AND department LIKE ?'; params.push(`%${department}%`); }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM members ${where}`, params);
    const [rows] = await db.query(
      `SELECT * FROM members ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    return paginatedResponse(res, 'Members fetched.', rows, {
      total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch members.', 500);
  }
};

const getMember = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return errorResponse(res, 'Member not found.', 404);

    const [borrows] = await db.query(
      `SELECT br.*, b.title as book_title, b.isbn FROM borrow_records br
       JOIN books b ON b.id = br.book_id WHERE br.member_id = ? ORDER BY br.created_at DESC LIMIT 10`,
      [req.params.id]
    );
    const [fines] = await db.query(
      "SELECT * FROM fines WHERE member_id = ? AND status = 'pending'",
      [req.params.id]
    );

    return successResponse(res, 'Member fetched.', { ...rows[0], recent_borrows: borrows, pending_fines: fines });
  } catch (err) {
    return errorResponse(res, 'Failed.', 500);
  }
};

const createMember = async (req, res) => {
  try {
    const {
      full_name, father_name, cnic, email, phone, address, city,
      department, class: cls, roll_number, membership_date, expiry_date, status
    } = req.body;

    if (!full_name) return errorResponse(res, 'Full name is required.', 400);

    const member_id = await generateMemberId();
    const photo = req.file ? `/uploads/members/${req.file.filename}` : null;

    const [r] = await db.query(
      `INSERT INTO members (member_id, photo, full_name, father_name, cnic, email, phone, address,
        city, department, class, roll_number, membership_date, expiry_date, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [member_id, photo, full_name, father_name || null, cnic || null, email || null, phone || null,
       address || null, city || null, department || null, cls || null, roll_number || null,
       membership_date || null, expiry_date || null, status || 'active']
    );

    await logActivity(req.user.id, 'MEMBER_REGISTERED', `Member "${full_name}" registered`, req.ip);
    const [member] = await db.query('SELECT * FROM members WHERE id = ?', [r.insertId]);
    return successResponse(res, 'Member registered successfully.', member[0], 201);
  } catch (err) {
    console.error('Create member error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.message.includes('cnic')) return errorResponse(res, 'CNIC already registered.', 400);
      if (err.message.includes('email')) return errorResponse(res, 'Email already registered.', 400);
    }
    return errorResponse(res, 'Failed to create member.', 500);
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Member not found.', 404);

    const {
      full_name, father_name, cnic, email, phone, address, city,
      department, class: cls, roll_number, membership_date, expiry_date, status
    } = req.body;

    const photo = req.file ? `/uploads/members/${req.file.filename}` : ex[0].photo;

    await db.query(
      `UPDATE members SET photo=?, full_name=?, father_name=?, cnic=?, email=?, phone=?,
       address=?, city=?, department=?, class=?, roll_number=?, membership_date=?, expiry_date=?, status=?
       WHERE id=?`,
      [photo, full_name, father_name || null, cnic || null, email || null, phone || null,
       address || null, city || null, department || null, cls || null, roll_number || null,
       membership_date || null, expiry_date || null, status || 'active', id]
    );

    await logActivity(req.user.id, 'MEMBER_UPDATED', `Member "${full_name}" updated`, req.ip);
    const [member] = await db.query('SELECT * FROM members WHERE id = ?', [id]);
    return successResponse(res, 'Member updated.', member[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return errorResponse(res, 'CNIC or Email already exists.', 400);
    return errorResponse(res, 'Failed to update member.', 500);
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const [ex] = await db.query('SELECT full_name FROM members WHERE id = ?', [id]);
    if (ex.length === 0) return errorResponse(res, 'Member not found.', 404);
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM borrow_records WHERE member_id = ? AND status = 'borrowed'", [id]
    );
    if (count > 0) return errorResponse(res, 'Cannot delete member with active borrows.', 400);
    await db.query('DELETE FROM members WHERE id = ?', [id]);
    await logActivity(req.user.id, 'MEMBER_DELETED', `Member "${ex[0].full_name}" deleted`, req.ip);
    return successResponse(res, 'Member deleted.');
  } catch (err) {
    return errorResponse(res, 'Failed to delete member.', 500);
  }
};

module.exports = { getMembers, getMember, createMember, updateMember, deleteMember };
