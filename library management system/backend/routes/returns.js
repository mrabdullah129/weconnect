const express = require('express');
const router = express.Router();
const { getReturns, returnBook, calculateFine } = require('../controllers/returnController');
const { authenticate } = require('../middleware/auth');

router.get('/calculate-fine', authenticate, calculateFine);
router.get('/', authenticate, getReturns);
router.post('/', authenticate, returnBook);

module.exports = router;
