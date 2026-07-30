import { v4 as uuid } from 'uuid';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

const bucket = 'images';

export const uploadBuffer = async ({ userId, buffer, mimeType, folder, extension }) => {
  const path = `${userId}/${folder}/${uuid()}.${extension}`;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType: mimeType,
    cacheControl: '31536000',
    upsert: false
  });
  if (error) throw new AppError(error.message, 500);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
};

export const deleteStoragePath = async (path) => {
  if (!path) return;
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new AppError(error.message, 500);
};
