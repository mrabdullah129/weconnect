import { useState, useEffect } from 'react';
import { FiBook, FiUsers, FiRotateCcw, FiDollarSign, FiTag, FiUser, FiTruck, FiLayers } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import { BorrowChart, ReturnChart, CategoryChart, MostBorrowedChart } from '../../components/charts/DashboardCharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [borrowData, setBorrowData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [s, b, r, c, m, a] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/monthly-borrows'),
        api.get('/dashboard/monthly-returns'),
        api.get('/dashboard/category-distribution'),
        api.get('/dashboard/most-borrowed'),
        api.get('/dashboard/recent-activity'),
      ]);
      setStats(s.data.data);
      setBorrowData(b.data.data);
      setReturnData(r.data.data);
      setCategoryData(c.data.data);
      setMostBorrowed(m.data.data);
      setRecentActivity(a.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Books', value: stats?.totalBooks || 0, icon: <FiBook />, color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    { label: 'Available Books', value: stats?.availableBooks || 0, icon: <FiBook />, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Borrowed Books', value: stats?.borrowedBooks || 0, icon: <FiTruck />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Active Members', value: stats?.activeMembers || 0, icon: <FiUsers />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Categories', value: stats?.categories || 0, icon: <FiTag />, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
    { label: 'Authors', value: stats?.authors || 0, icon: <FiUser />, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
    { label: 'Publishers', value: stats?.publishers || 0, icon: <FiLayers />, color: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
    { label: 'Total Fines', value: formatCurrency(stats?.totalFines), icon: <FiDollarSign />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Here's what's happening in your library today
          </p>
        </div>
        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.9)' }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Today</div>
          <div style={{ fontWeight: 600 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stats?.todayBorrowing || 0}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Borrowed</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stats?.todayReturns || 0}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>Returned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {statCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Borrowing</h3>
          </div>
          <div className="card-body">
            <BorrowChart data={borrowData} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Returns</h3>
          </div>
          <div className="card-body">
            <ReturnChart data={returnData} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
          </div>
          <div className="card-body">
            <CategoryChart data={categoryData} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Most Borrowed Books</h3>
          </div>
          <div className="card-body">
            <MostBorrowedChart data={mostBorrowed} />
          </div>
        </div>
      </div>

      {/* Fine Summary + Activity */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fine Summary</h3>
          </div>
          <div className="card-body">
            {[
              { label: 'Total Fines', value: formatCurrency(stats?.totalFines), color: 'var(--text)' },
              { label: 'Paid Fines', value: formatCurrency(stats?.paidFines), color: 'var(--success)' },
              { label: 'Pending Fines', value: formatCurrency(stats?.pendingFines), color: 'var(--danger)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: 15 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity</div>
            ) : recentActivity.map(log => (
              <div key={log.id} style={{
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 12, alignItems: 'flex-start'
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{log.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {log.user_name} • {formatDateTime(log.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
