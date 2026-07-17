const express = require('express');
const router = express.Router();
const { getFines, payFine, waiveFine, getFineStats } = require('../controllers/fineController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, getFineStats);
router.get('/', authenticate, getFines);
router.put('/:id/pay', authenticate, payFine);
router.put('/:id/waive', authenticate, authorize('admin'), waiveFine);

module.exports = router;
