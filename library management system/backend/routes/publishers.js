const express = require('express');
const router = express.Router();
const { getPublishers, getAllPublishers, createPublisher, updatePublisher, deletePublisher } = require('../controllers/publisherController');
const { authenticate } = require('../middleware/auth');

router.get('/all', authenticate, getAllPublishers);
router.get('/', authenticate, getPublishers);
router.post('/', authenticate, createPublisher);
router.put('/:id', authenticate, updatePublisher);
router.delete('/:id', authenticate, deletePublisher);

module.exports = router;
