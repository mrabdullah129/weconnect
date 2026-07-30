import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { allowedMimeTypes, maxUploadSize } from '../utils/file.js';

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: maxUploadSize, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new AppError('Only JPG, PNG, and WEBP images are supported.', 400));
      return;
    }
    cb(null, true);
  }
}).array('images', 12);

export const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) return next(err.statusCode ? err : new AppError(err.message, 400));
    return next();
  });
};
