import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database, Download, HardDrive, Trash2, Users } from 'lucide-react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { formatBytes } from '../utils/formatters';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [uploads, setUploads] = useState([]);

  const load = async () => {
      try {
        const [statsResponse, usersResponse, uploadsResponse] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/uploads')]);
        setStats(statsResponse.data);
        setUsersList(usersResponse.data.users || []);
        setUploads(uploadsResponse.data.uploads || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load admin data.');
      }
    };
  useEffect(() => {
    load();
  }, []);

  const removeUpload = async (id) => {
    await api.delete(`/images/${id}`);
    toast.success('Upload removed.');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Admin</p>
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Analytics dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats?.totalUsers ?? '-'} icon={Users} />
        <StatCard label="Uploads" value={stats?.totalImages ?? '-'} icon={Database} />
        <StatCard label="Downloads" value={stats?.totalDownloads ?? '-'} icon={Download} />
        <StatCard label="Storage" value={formatBytes(stats?.totalStorageBytes || 0)} icon={HardDrive} />
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-4 py-3 font-bold dark:border-white/10">Users</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-white/5">
            <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {usersList.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-4 py-3 font-bold dark:border-white/10">Uploads moderation</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-white/5">
              <tr><th className="px-4 py-3">Preview</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Format</th><th className="px-4 py-3">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {uploads.map((image) => (
                <tr key={image.id}>
                  <td className="px-4 py-3"><img src={image.processed_url || image.original_url} alt="" className="h-14 w-20 rounded-md object-cover" /></td>
                  <td className="px-4 py-3">{image.users?.email || 'Unknown'}</td>
                  <td className="px-4 py-3">{formatBytes(Number(image.original_size || 0) + Number(image.processed_size || 0))}</td>
                  <td className="px-4 py-3 uppercase">{image.format}</td>
                  <td className="px-4 py-3"><button className="btn-secondary !px-3" onClick={() => removeUpload(image.id)}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
