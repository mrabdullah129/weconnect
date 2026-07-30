import { Router } from 'express';
import { deleteImage, download, history, uploadImages, resizeImages, compressImages, convertImages } from '../controllers/image.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { handleUpload } from '../middleware/upload.middleware.js';

const router = Router();

router.use(requireAuth);
router.post('/upload', handleUpload, uploadImages);
router.post('/resize', handleUpload, resizeImages);
router.post('/compress', handleUpload, compressImages);
router.post('/convert', handleUpload, convertImages);
router.get('/history', history);
router.post('/:id/download', download);
router.delete('/:id', deleteImage);

export default router;
