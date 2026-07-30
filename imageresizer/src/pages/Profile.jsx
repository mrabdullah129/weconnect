import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Profile</h1>
      <div className="glass rounded-lg p-6">
        <div className="grid gap-4">
          <div className="flex items-center gap-3"><UserRound className="text-teal-600" /> <span>{user?.name}</span></div>
          <div className="flex items-center gap-3"><Mail className="text-teal-600" /> <span>{user?.email}</span></div>
          <div className="flex items-center gap-3"><ShieldCheck className="text-teal-600" /> <span className="capitalize">{user?.role}</span></div>
        </div>
      </div>
    </div>
  );
}
