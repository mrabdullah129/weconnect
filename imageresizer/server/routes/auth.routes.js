import { Router } from 'express';
import { exchangeSupabaseSession, login, logout, me, signup } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/supabase', exchangeSupabaseSession);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
