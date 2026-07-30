import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatBytes } from '../utils/formatters';

const maxSize = 12 * 1024 * 1024;

export default function ImageDropzone({ files, setFiles }) {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length) toast.error('Some files were rejected. Use JPG, PNG, or WEBP under 12MB.');
      setFiles((current) => [...current, ...accepted]);
    },
    [setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize,
    multiple: true
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`grid cursor-pointer place-items-center rounded-lg border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-teal-500 bg-teal-500/10' : 'border-slate-300 bg-white/70 hover:border-slate-500 dark:border-white/15 dark:bg-white/5'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mb-4 text-teal-600 dark:text-teal-300" size={42} />
        <p className="text-base font-bold text-slate-950 dark:text-white">Drop images here or choose files</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">JPG, PNG, WEBP. Up to 12MB each. Batch uploads supported.</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950">
              <span className="truncate text-slate-700 dark:text-slate-200">{file.name}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-slate-500">{formatBytes(file.size)}</span>
                <button aria-label="Remove file" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
