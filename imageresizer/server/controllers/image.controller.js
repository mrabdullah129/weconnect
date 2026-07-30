import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../utils/AppError.js';
import { formatFromMime, normalizeOutputFormat } from '../utils/file.js';
import { createImageRecord, getMetadata, processImageBuffer, recordDownload } from '../services/image.service.js';
import { deleteStoragePath, uploadBuffer } from '../services/storage.service.js';

const mimeForFormat = (format) => `image/${format === 'jpeg' ? 'jpeg' : format}`;

const uploadOriginalAndMaybeProcessed = async (req, transform = {}) => {
  const files = req.files || [];
  if (!files.length) throw new AppError('Upload at least one image.', 400);

  const results = [];
  for (const file of files) {
    const inputFormat = formatFromMime(file.mimetype);
    const metadata = await getMetadata(file.buffer);
    const original = await uploadBuffer({
      userId: req.user.id,
      buffer: file.buffer,
      mimeType: file.mimetype,
      folder: 'originals',
      extension: inputFormat === 'jpeg' ? 'jpg' : inputFormat
    });

    let processed = null;
    let processedMetadata = metadata;
    let outputFormat = normalizeOutputFormat(transform.format) || inputFormat;
    if (Object.keys(transform).length) {
      const processedImage = await processImageBuffer(file.buffer, { ...transform, mimeType: file.mimetype });
      outputFormat = processedImage.format;
      processedMetadata = processedImage.metadata;
      const stored = await uploadBuffer({
        userId: req.user.id,
        buffer: processedImage.buffer,
        mimeType: mimeForFormat(outputFormat),
        folder: 'processed',
        extension: outputFormat === 'jpeg' ? 'jpg' : outputFormat
      });
      processed = { ...stored, size: processedImage.buffer.length };
    }

    const record = await createImageRecord({
      userId: req.user.id,
      original,
      processed,
      file,
      format: outputFormat,
      metadata: processedMetadata
    });
    results.push(record);
  }
  return results;
};

export const uploadImages = asyncHandler(async (req, res) => {
  const images = await uploadOriginalAndMaybeProcessed(req);
  res.status(201).json({ images });
});

export const resizeImages = asyncHandler(async (req, res) => {
  const images = await uploadOriginalAndMaybeProcessed(req, req.body);
  res.status(201).json({ images });
});

export const compressImages = asyncHandler(async (req, res) => {
  const images = await uploadOriginalAndMaybeProcessed(req, { quality: req.body.quality, format: req.body.format });
  res.status(201).json({ images });
});

export const convertImages = asyncHandler(async (req, res) => {
  const format = normalizeOutputFormat(req.body.format);
  if (!format) throw new AppError('Choose a valid output format.', 400);
  const images = await uploadOriginalAndMaybeProcessed(req, { format, quality: req.body.quality || 90 });
  res.status(201).json({ images });
});

export const history = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('images')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);
  res.json({ images: data });
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { data: image, error } = await supabaseAdmin
    .from('images')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error || !image) throw new AppError('Image not found.', 404);
  if (image.user_id !== req.user.id && req.user.role !== 'admin') throw new AppError('Not allowed.', 403);

  await deleteStoragePath(image.original_path);
  await deleteStoragePath(image.processed_path);
  await supabaseAdmin.from('images').delete().eq('id', image.id);
  res.json({ message: 'Image deleted.' });
});

export const download = asyncHandler(async (req, res) => {
  await recordDownload({ userId: req.user.id, imageId: req.params.id });
  res.json({ message: 'Download recorded.' });
});
