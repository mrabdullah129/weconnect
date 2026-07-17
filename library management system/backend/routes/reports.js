const express = require('express');
const router = express.Router();
const {
  getBooksReport, getMembersReport, getBorrowReport,
  getReturnReport, getFineReport, getInventoryReport
} = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/books', authenticate, getBooksReport);
router.get('/members', authenticate, getMembersReport);
router.get('/borrow', authenticate, getBorrowReport);
router.get('/return', authenticate, getReturnReport);
router.get('/fines', authenticate, getFineReport);
router.get('/inventory', authenticate, getInventoryReport);

module.exports = router;
