import { Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatBytes, pct } from '../utils/formatters';

export default function ImageHistoryTable({ images, refresh }) {
  const remove = async (id) => {
    await api.delete(`/images/${id}`);
    toast.success('Image deleted.');
    refresh?.();
  };

  const download = async (image) => {
    await api.post(`/images/${image.id}/download`);
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
      a.download = `smart-resized-${image.id}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      // Fallback: download original
      const link = document.createElement('a');
      link.href = url;
      link.download = `smart-resized-${image.id}.${image.format === 'jpeg' ? 'jpg' : image.format}`;
      link.target = '_blank';
      link.click();
    }
  };

  if (!images.length) {
    return <div className="glass rounded-lg p-8 text-center text-slate-500 dark:text-slate-300">No image history yet. Process your first image to fill this space.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3">Resolution</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {images.map((image) => (
              <tr key={image.id} className="text-slate-700 dark:text-slate-200">
                <td className="px-4 py-3">
                  <img src={image.processed_url || image.original_url} alt="" className="h-14 w-20 rounded-md object-cover" />
                </td>
                <td className="px-4 py-3">{image.width} x {image.height}</td>
                <td className="px-4 py-3">
                  {formatBytes(image.original_size)} → {formatBytes(image.processed_size || image.original_size)}
                  <span className="ml-2 text-teal-600">{pct(image.original_size, image.processed_size)}</span>
                </td>
                <td className="px-4 py-3 uppercase">{image.format}</td>
                <td className="px-4 py-3">{new Date(image.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="btn-secondary !px-3" onClick={() => download(image)} aria-label="Download image">
                      <Download size={16} />
                    </button>
                    <button className="btn-secondary !px-3" onClick={() => remove(image.id)} aria-label="Delete image">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
