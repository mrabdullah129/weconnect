import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../utils/AppError.js';

export const users = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ users: data });
});

export const stats = asyncHandler(async (_req, res) => {
  const [{ data: usersData }, { data: imagesData }, { data: downloadsData }] = await Promise.all([
    supabaseAdmin.from('users').select('id'),
    supabaseAdmin.from('images').select('original_size,processed_size,created_at'),
    supabaseAdmin.from('downloads').select('id')
  ]);

  const totalOriginal = (imagesData || []).reduce((sum, image) => sum + Number(image.original_size || 0), 0);
  const totalProcessed = (imagesData || []).reduce((sum, image) => sum + Number(image.processed_size || 0), 0);

  res.json({
    totalUsers: usersData?.length || 0,
    totalImages: imagesData?.length || 0,
    totalDownloads: downloadsData?.length || 0,
    totalStorageBytes: totalOriginal + totalProcessed
  });
});

export const uploads = asyncHandler(async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('images')
    .select('*, users(name,email)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new AppError(error.message, 500);
  res.json({ uploads: data });
});
