const express = require('express');
const router = express.Router();
const { getAuthors, getAllAuthors, getAuthor, createAuthor, updateAuthor, deleteAuthor } = require('../controllers/authorController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/all', authenticate, getAllAuthors);
router.get('/', authenticate, getAuthors);
router.get('/:id', authenticate, getAuthor);
router.post('/', authenticate, uploadAvatar.single('image'), createAuthor);
router.put('/:id', authenticate, uploadAvatar.single('image'), updateAuthor);
router.delete('/:id', authenticate, deleteAuthor);

module.exports = router;
