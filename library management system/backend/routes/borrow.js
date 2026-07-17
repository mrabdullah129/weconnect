const express = require('express');
const router = express.Router();
const { getBorrows, borrowBook, getBorrow } = require('../controllers/borrowController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getBorrows);
router.get('/:id', authenticate, getBorrow);
router.post('/', authenticate, borrowBook);

module.exports = router;
