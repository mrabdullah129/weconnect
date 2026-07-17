const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', destination);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed!'));
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new Error('Only PDF files are allowed!'));
};

const anyFileFilter = (req, file, cb) => cb(null, true);

const uploadBookCover = multer({
  storage: createStorage('books'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadBookPDF = multer({
  storage: createStorage('books'),
  fileFilter: anyFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadMemberPhoto = multer({
  storage: createStorage('members'),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadAvatar = multer({
  storage: createStorage('avatars'),
  fileFilter: imageFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const uploadBookFiles = multer({
  storage: createStorage('books'),
  fileFilter: anyFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { uploadBookCover, uploadBookPDF, uploadMemberPhoto, uploadAvatar, uploadBookFiles };
