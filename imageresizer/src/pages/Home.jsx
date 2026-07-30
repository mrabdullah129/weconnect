import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cloud, Crop, Gauge, ImagePlus, Lock, WandSparkles } from 'lucide-react';

const features = [
  { icon: Gauge, title: 'Resize and compress', text: 'Batch optimize images with custom dimensions, percentage scaling, and quality controls.' },
  { icon: Cloud, title: 'Cloud history', text: 'Originals and processed files are stored in user folders with Supabase Storage.' },
  { icon: Crop, title: 'Creator presets', text: 'Instagram, YouTube, Facebook, and LinkedIn sizes are ready in one click.' },
  { icon: Lock, title: 'Secure workspace', text: 'JWT protected APIs, Supabase RLS policies, validation, and rate limiting.' }
];

export default function Home() {
  return (
    <div className="space-y-14">
      <section className="grid min-h-[72vh] items-center gap-10 py-8 lg:grid-cols-[1.02fr_.98fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-sm font-semibold text-teal-700 dark:text-teal-200">
            <WandSparkles size={16} /> Premium image automation
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
            Smart Image Resizer
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Resize, compress, convert, crop, watermark, preview, store, and download production-ready images from one polished SaaS dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/resize" className="btn-primary">
              Start resizing <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn-secondary">
              Create free account
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass rounded-lg p-4">
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold">
                <ImagePlus size={20} /> Live job
              </div>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">Optimized</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="aspect-square rounded-lg bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80')] bg-cover bg-center" />
              <div className="space-y-3">
                {['1080 x 1080', 'WEBP output', '72% smaller', 'Cloud saved'].map((item) => (
                  <div key={item} className="rounded-lg bg-white/10 p-4 text-sm font-semibold">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <motion.div key={feature.title} whileHover={{ y: -4 }} className="glass rounded-lg p-5">
            <feature.icon className="text-teal-600 dark:text-teal-300" size={26} />
            <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
