import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiDollarSign, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { getStatusBadge, formatDate, formatCurrency, debounce, showError, showSuccess, confirmDelete } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const fetchFines = useCallback(async (q) => {
    setLoading(true);
    try {
      const [fRes, sRes] = await Promise.all([
        api.get(`/fines?${new URLSearchParams(q)}`),
        api.get('/fines/stats'),
      ]);
      setFines(fRes.data.data); setPagination(fRes.data.pagination);
      setStats(sRes.data.data);
    } catch { showError('Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFines(query); }, [query]);
  const debouncedSearch = useCallback(debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400), []);

  const handlePay = async () => {
    if (!payAmount) { toast.error('Enter amount'); return; }
    try {
      await api.put(`/fines/${payModal.id}/pay`, { paid_amount: payAmount });
      showSuccess('Fine paid!');
      setPayModal(null); setPayAmount('');
      fetchFines(query);
    } catch (err) { showError(err.response?.data?.message || 'Failed'); }
  };

  const handleWaive = async (fine) => {
    if (!await confirmDelete('this fine (waive it)')) return;
    try {
      await api.put(`/fines/${fine.id}/waive`);
      showSuccess('Fine waived!');
      fetchFines(query);
    } catch (err) { showError(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Fine Management</h1><p className="page-subtitle">Track and manage library fines</p></div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Fines', value: formatCurrency(stats.total_amount), color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
            { label: 'Paid', value: formatCurrency(stats.paid_amount), color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Pending', value: formatCurrency(stats.pending_amount), color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Waived', value: stats.waived_count + ' fines', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}><FiDollarSign /></div>
              <div><div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-bar">
            <div className="search-input-wrap" style={{ flex: 2 }}>
              <FiSearch className="search-icon" />
              <input type="text" className="form-control" placeholder="Search by member..." onChange={e => debouncedSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ maxWidth: 150 }} value={query.status} onChange={e => setQuery(q => ({ ...q, status: e.target.value, page: 1 }))}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Member</th><th>Book</th><th>Borrow</th><th>Amount</th><th>Paid</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={9}><LoadingSpinner /></td></tr>
                : fines.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><div className="empty-state-icon">💰</div><div className="empty-state-title">No fines found</div></div></td></tr>
                : fines.map((f, idx) => (
                  <tr key={f.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{((query.page - 1) * query.limit) + idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{f.member_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.member_code}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{f.book_title?.slice(0, 30)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{f.borrow_code}</td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(f.amount)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>{f.paid_amount > 0 ? formatCurrency(f.paid_amount) : '—'}</td>
                    <td><span className={`badge ${getStatusBadge(f.status)}`}>{f.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(f.created_at)}</td>
                    <td>
                      {f.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-success btn-sm" onClick={() => { setPayModal(f); setPayAmount(f.amount); }}>
                            <FiCheck size={12} /> Pay
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleWaive(f)} style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}>
                            <FiX size={12} /> Waive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Pay Fine" size="sm">
        {payModal && (
          <div>
            <div style={{ marginBottom: 16, padding: '12px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
              <div><strong>{payModal.member_name}</strong></div>
              <div style={{ color: 'var(--text-secondary)' }}>Fine Amount: <strong style={{ color: 'var(--danger)' }}>{formatCurrency(payModal.amount)}</strong></div>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Amount</label>
              <input type="number" className="form-control" value={payAmount} onChange={e => setPayAmount(e.target.value)} step="0.01" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setPayModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handlePay}>Confirm Payment</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
