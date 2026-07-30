import { Router } from 'express';
import { stats, uploads, users } from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/users', users);
router.get('/stats', stats);
router.get('/uploads', uploads);

export default router;
