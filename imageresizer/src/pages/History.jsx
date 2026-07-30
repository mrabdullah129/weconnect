import ImageHistoryTable from '../components/ImageHistoryTable';
import { useImages } from '../hooks/useImages';

export default function History() {
  const { images, loading, refresh } = useImages();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Library</p>
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Image history</h1>
      </div>
      {loading ? <div className="glass h-80 animate-pulse rounded-lg" /> : <ImageHistoryTable images={images} refresh={refresh} />}
    </div>
  );
}
