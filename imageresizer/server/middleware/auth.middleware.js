import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const requireAuth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Authentication required.', 401);

    const decoded = verifyToken(token);
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id,name,email,role,created_at')
      .eq('id', decoded.sub)
      .single();

    if (error || !user) throw new AppError('Invalid session.', 401);
    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new AppError('Invalid or expired token.', 401));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new AppError('Admin access required.', 403));
  return next();
};
