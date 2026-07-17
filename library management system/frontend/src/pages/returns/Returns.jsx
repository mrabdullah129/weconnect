import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReturnForm from './ReturnForm';
import { formatDate, debounce, showError, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchReturns = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/returns?${new URLSearchParams(q)}`);
      setReturns(res.data.data); setPagination(res.data.pagination);
    } catch { showError('Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReturns(query); }, [query]);
  const debouncedSearch = useCallback(debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400), []);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Return Books</h1><p className="page-subtitle">Process book returns and calculate fines</p></div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}><FiPlus /> Return Book</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-input-wrap" style={{ maxWidth: 400 }}>
            <FiSearch className="search-icon" />
            <input type="text" className="form-control" placeholder="Search by member, book, return ID..." onChange={e => debouncedSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Return ID</th><th>Member</th><th>Book</th><th>Borrow Date</th><th>Due Date</th><th>Return Date</th><th>Late Days</th><th>Fine</th><th>By</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={10}><LoadingSpinner /></td></tr>
                : returns.length === 0 ? <tr><td colSpan={10}><div className="empty-state"><div className="empty-state-icon">🔄</div><div className="empty-state-title">No return records</div></div></td></tr>
                : returns.map((r, idx) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{((query.page - 1) * query.limit) + idx + 1}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{r.return_id}</span></td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.member_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.member_code}</div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{r.book_title?.slice(0, 30)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.borrow_date)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.due_date)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(r.return_date)}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: r.late_days > 0 ? 'var(--danger)' : 'var(--success)' }}>{r.late_days}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: r.fine > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {r.fine > 0 ? formatCurrency(r.fine) : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.returned_by_name || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Return Book">
        <ReturnForm onSuccess={() => { setShowForm(false); fetchReturns(query); }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
