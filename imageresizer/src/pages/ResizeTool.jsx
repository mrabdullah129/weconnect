import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Crop, Download, ImageDown, Lock, Sparkles, Unlock, WandSparkles } from 'lucide-react';
import ImageDropzone from '../components/ImageDropzone';
import { api } from '../services/api';
import { formats, socialPresets } from '../utils/presets';
import { formatBytes, pct } from '../utils/formatters';

export default function ResizeTool() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState([]);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState({
    width: 1080,
    height: 1080,
    percentage: '',
    quality: 82,
    format: 'webp',
    lockAspect: true,
    crop: false,
    watermarkText: ''
  });

  const preview = useMemo(() => (files[0] ? URL.createObjectURL(files[0]) : null), [files]);

  const update = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const process = async (endpoint) => {
    if (!files.length) return toast.error('Add at least one image first.');
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== '' && value !== false) form.append(key, value);
    });
    if (settings.crop) form.set('crop', 'cover');

    setProcessing(true);
    setProgress(0);
    try {
      const { data } = await api.post(`/images/${endpoint}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => setProgress(Math.round((event.loaded * 100) / (event.total || 1)))
      });
      setResult(data.images || []);
      toast.success('Images processed and saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const download = async (image) => {
    const url = image.processed_url || image.original_url;
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const imgBitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgBitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `smart-image-${image.id}.png`;
      a.click();
    } catch (e) {
      // Fallback: download original file if conversion fails
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart-image-${image.id}.${image.format === 'jpeg' ? 'jpg' : image.format}`;
      link.target = '_blank';
      link.click();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[.92fr_1.08fr]">
      <section className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Resize Tool</p>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Process images</h1>
        </div>
        <div className="glass rounded-lg p-5">
          <ImageDropzone files={files} setFiles={setFiles} />
          {progress > 0 && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="glass rounded-lg p-5">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Social presets</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {socialPresets.map((preset) => (
              <button key={preset.label} className="btn-secondary !justify-start !px-3 text-left" onClick={() => setSettings((current) => ({ ...current, width: preset.width, height: preset.height, percentage: '' }))}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="glass rounded-lg p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Width</label>
              <input className="input" type="number" value={settings.width} onChange={(e) => update('width', e.target.value)} />
            </div>
            <div>
              <label className="label">Height</label>
              <input className="input" type="number" value={settings.height} onChange={(e) => update('height', e.target.value)} />
            </div>
            <div>
              <label className="label">Resize by percentage</label>
              <input className="input" type="number" placeholder="Optional" value={settings.percentage} onChange={(e) => update('percentage', e.target.value)} />
            </div>
            <div>
              <label className="label">Output format</label>
              <select className="input" value={settings.format} onChange={(e) => update('format', e.target.value)}>
                {formats.map((format) => <option key={format} value={format}>{format.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Compression quality: {settings.quality}%</label>
            <input className="w-full accent-teal-600" type="range" min="1" max="100" value={settings.quality} onChange={(e) => update('quality', e.target.value)} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button className="btn-secondary" onClick={() => update('lockAspect', !settings.lockAspect)}>
              {settings.lockAspect ? <Lock size={18} /> : <Unlock size={18} />} Aspect
            </button>
            <button className="btn-secondary" onClick={() => update('crop', !settings.crop)}>
              <Crop size={18} /> {settings.crop ? 'Crop on' : 'Crop off'}
            </button>
            <button className="btn-secondary" title="Placeholder for AI enhancement roadmap">
              <Sparkles size={18} /> AI Enhance
            </button>
          </div>
          <div className="mt-4">
            <label className="label">Watermark text</label>
            <input className="input" value={settings.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} placeholder="Optional watermark" />
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button className="btn-primary" disabled={processing} onClick={() => process('resize')}><ImageDown size={18} /> Resize batch</button>
            <button className="btn-secondary" disabled={processing} onClick={() => process('compress')}>Compress</button>
            <button className="btn-secondary" disabled={processing} onClick={() => process('convert')}>Convert</button>
            <button className="btn-secondary" title="Placeholder for background remover roadmap"><WandSparkles size={18} /> Remove BG</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div className="glass rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 font-bold text-slate-950 dark:text-white">Original preview</h2>
            {preview ? <img src={preview} alt="" className="aspect-video w-full rounded-lg object-contain bg-slate-950/5 dark:bg-white/5" /> : <div className="grid aspect-video place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-white/5">Upload an image</div>}
            {files[0] && <p className="mt-3 text-sm text-slate-500">{files[0].name} • {formatBytes(files[0].size)}</p>}
          </motion.div>
          <motion.div className="glass rounded-lg p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-3 font-bold text-slate-950 dark:text-white">Processed preview</h2>
            {result[0] ? <img src={result[0].processed_url || result[0].original_url} alt="" className="aspect-video w-full rounded-lg object-contain bg-slate-950/5 dark:bg-white/5" /> : <div className="grid aspect-video place-items-center rounded-lg bg-slate-100 text-sm text-slate-500 dark:bg-white/5">Process to preview</div>}
            {result[0] && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span>{result[0].width} x {result[0].height} • {formatBytes(result[0].processed_size || result[0].original_size)} • saved {pct(result[0].original_size, result[0].processed_size)}</span>
                <button className="btn-secondary !px-3" onClick={() => download(result[0])}><Download size={16} /> Download</button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
