import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BorrowForm from './BorrowForm';
import { getStatusBadge, formatDate, debounce, showError } from '../../utils/helpers';

export default function Borrow() {
  const [borrows, setBorrows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [showForm, setShowForm] = useState(false);

  const fetchBorrows = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/borrow?${new URLSearchParams(q)}`);
      setBorrows(res.data.data); setPagination(res.data.pagination);
    } catch { showError('Failed to load'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBorrows(query); }, [query]);
  const debouncedSearch = useCallback(debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400), []);

  const isOverdue = (b) => b.status === 'borrowed' && new Date(b.due_date) < new Date();

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Borrow Books</h1><p className="page-subtitle">Manage book borrowing</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><FiPlus /> Borrow Book</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-bar">
            <div className="search-input-wrap" style={{ flex: 2 }}>
              <FiSearch className="search-icon" />
              <input type="text" className="form-control" placeholder="Search by member, book, borrow ID..." onChange={e => debouncedSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ maxWidth: 160 }} value={query.status} onChange={e => setQuery(q => ({ ...q, status: e.target.value, page: 1 }))}>
              <option value="">All Status</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Borrow ID</th><th>Member</th><th>Book</th><th>Borrow Date</th><th>Due Date</th><th>Status</th><th>By</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8}><LoadingSpinner /></td></tr>
                : borrows.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">📚</div><div className="empty-state-title">No borrow records</div></div></td></tr>
                : borrows.map((b, idx) => {
                  const overdue = isOverdue(b);
                  return (
                    <tr key={b.id} style={{ background: overdue ? 'rgba(239,68,68,0.04)' : undefined }}>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{((query.page - 1) * query.limit) + idx + 1}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{b.borrow_id}</span></td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.member_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.member_code}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {b.cover_image
                            ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${b.cover_image}`} style={{ width: 28, height: 38, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} alt="" />
                            : <span style={{ fontSize: 22 }}>📚</span>
                          }
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{b.book_title?.slice(0, 35)}</div>
                            {b.isbn && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.isbn}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{formatDate(b.borrow_date)}</td>
                      <td style={{ fontSize: 13, color: overdue ? 'var(--danger)' : 'var(--text)' }}>
                        {formatDate(b.due_date)}
                        {overdue && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger)' }}>OVERDUE</div>}
                      </td>
                      <td><span className={`badge ${getStatusBadge(overdue ? 'overdue' : b.status)}`}>{overdue ? 'overdue' : b.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.borrowed_by_name || '—'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Borrow Book">
        <BorrowForm onSuccess={() => { setShowForm(false); fetchBorrows(query); }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
