export const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const maxUploadSize = 12 * 1024 * 1024;

export const formatFromMime = (mime) => {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpeg';
};

export const normalizeOutputFormat = (format) => {
  const value = String(format || '').toLowerCase();
  if (['jpg', 'jpeg'].includes(value)) return 'jpeg';
  if (['png', 'webp'].includes(value)) return value;
  return null;
};

export const publicFileName = (name = 'image') =>
  name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';
