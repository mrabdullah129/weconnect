import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ admin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center text-slate-600 dark:text-slate-300">Loading workspace...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
