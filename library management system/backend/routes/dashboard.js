const express = require('express');
const router = express.Router();
const {
  getStats, getMonthlyBorrowStats, getMonthlyReturnStats,
  getCategoryDistribution, getMostBorrowedBooks, getActiveMembers, getRecentActivity
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, getStats);
router.get('/monthly-borrows', authenticate, getMonthlyBorrowStats);
router.get('/monthly-returns', authenticate, getMonthlyReturnStats);
router.get('/category-distribution', authenticate, getCategoryDistribution);
router.get('/most-borrowed', authenticate, getMostBorrowedBooks);
router.get('/active-members', authenticate, getActiveMembers);
router.get('/recent-activity', authenticate, getRecentActivity);

module.exports = router;
