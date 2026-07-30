import sharp from 'sharp';
import { AppError } from '../utils/AppError.js';
import { formatFromMime, normalizeOutputFormat } from '../utils/file.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getMetadata = async (buffer) => {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) throw new AppError('Unable to read image dimensions.', 400);
  return metadata;
};

export const processImageBuffer = async (buffer, options = {}) => {
  const inputMetadata = await getMetadata(buffer);
  const format = normalizeOutputFormat(options.format) || formatFromMime(options.mimeType) || inputMetadata.format || 'jpeg';
  const quality = Math.min(100, Math.max(1, Number(options.quality || 82)));
  let pipeline = sharp(buffer, { failOn: 'none' }).rotate();

  if (options.crop === 'cover' && options.width && options.height) {
    pipeline = pipeline.resize(Number(options.width), Number(options.height), { fit: 'cover', position: 'center' });
  } else if (options.width || options.height || options.percentage) {
    const width = options.percentage ? Math.round(inputMetadata.width * (Number(options.percentage) / 100)) : Number(options.width) || null;
    const height = options.percentage ? Math.round(inputMetadata.height * (Number(options.percentage) / 100)) : Number(options.height) || null;
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: options.allowUpscale !== 'true'
    });
  }

  if (options.watermarkText) {
    const text = String(options.watermarkText).slice(0, 80);
    const svg = Buffer.from(
      `<svg width="${inputMetadata.width}" height="90"><text x="24" y="58" font-size="34" font-family="Arial" fill="rgba(255,255,255,.78)" stroke="rgba(15,23,42,.35)" stroke-width="1">${text.replace(/[<>&"]/g, '')}</text></svg>`
    );
    pipeline = pipeline.composite([{ input: svg, gravity: 'southeast' }]);
  }

  if (format === 'png') pipeline = pipeline.png({ quality, compressionLevel: 9 });
  if (format === 'webp') pipeline = pipeline.webp({ quality });
  if (format === 'jpeg') pipeline = pipeline.jpeg({ quality, mozjpeg: true });

  const output = await pipeline.toBuffer();
  const outputMetadata = await sharp(output).metadata();
  return { buffer: output, format, metadata: outputMetadata };
};

export const createImageRecord = async ({ userId, original, processed, file, format, metadata }) => {
  const { data, error } = await supabaseAdmin
    .from('images')
    .insert({
      user_id: userId,
      original_url: original.url,
      original_path: original.path,
      processed_url: processed?.url || null,
      processed_path: processed?.path || null,
      original_size: file.size,
      processed_size: processed?.size || null,
      format,
      width: metadata.width,
      height: metadata.height
    })
    .select('*')
    .single();
  if (error) throw new AppError(error.message, 500);
  return data;
};

export const recordDownload = async ({ userId, imageId }) => {
  await supabaseAdmin.from('downloads').insert({ user_id: userId, image_id: imageId });
};
