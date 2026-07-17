const express = require('express');
const router = express.Router();
const { getBooks, getBook, createBook, updateBook, deleteBook, globalSearch } = require('../controllers/bookController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multi-field upload for books (cover + pdf)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'books');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  },
});
const uploadFields = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/search', authenticate, globalSearch);
router.get('/', authenticate, getBooks);
router.get('/:id', authenticate, getBook);
router.post('/', authenticate, uploadFields.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'pdf_file', maxCount: 1 }]), createBook);
router.put('/:id', authenticate, uploadFields.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'pdf_file', maxCount: 1 }]), updateBook);
router.delete('/:id', authenticate, deleteBook);

module.exports = router;
