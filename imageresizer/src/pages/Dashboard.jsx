import { Download, HardDrive, Image, UserRound } from 'lucide-react';
import StatCard from '../components/StatCard';
import ImageHistoryTable from '../components/ImageHistoryTable';
import { useAuth } from '../context/AuthContext';
import { useImages } from '../hooks/useImages';
import { formatBytes } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const { images, loading, refresh } = useImages();
  const storage = images.reduce((sum, image) => sum + Number(image.original_size || 0) + Number(image.processed_size || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Workspace</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-950 dark:text-white">Welcome, {user?.name || 'Creator'}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Uploaded images" value={images.length} icon={Image} />
        <StatCard label="Processed images" value={images.filter((image) => image.processed_url).length} icon={Download} />
        <StatCard label="Storage usage" value={formatBytes(storage)} icon={HardDrive} />
        <StatCard label="Role" value={user?.role || 'user'} icon={UserRound} />
      </div>
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-950 dark:text-white">Recent activity</h2>
        {loading ? <div className="glass h-64 animate-pulse rounded-lg" /> : <ImageHistoryTable images={images.slice(0, 6)} refresh={refresh} />}
      </section>
    </div>
  );
}
