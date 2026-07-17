import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiGlobe, FiMail, FiPhone } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PublisherForm from './PublisherForm';
import { confirmDelete, showSuccess, showError, debounce } from '../../utils/helpers';

export default function Publishers() {
  const [publishers, setPublishers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPublishers = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/publishers?${new URLSearchParams(q)}`);
      setPublishers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      showError('Failed to load publishers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPublishers(query); }, [query]);

  const debouncedSearch = useCallback(
    debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400),
    []
  );

  const handleDelete = async (p) => {
    if (!await confirmDelete(`"${p.name}"`)) return;
    try {
      await api.delete(`/publishers/${p.id}`);
      showSuccess('Publisher deleted!');
      fetchPublishers(query);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelected(null);
    fetchPublishers(query);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Publishers</h1>
          <p className="page-subtitle">Manage book publishers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true); }}>
          <FiPlus /> Add Publisher
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-input-wrap" style={{ maxWidth: 400 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search publishers..."
              onChange={e => debouncedSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Publisher</th>
                <th>Contact</th>
                <th>Books</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><LoadingSpinner /></td></tr>
              ) : publishers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏢</div>
                      <div className="empty-state-title">No publishers yet</div>
                    </div>
                  </td>
                </tr>
              ) : publishers.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {((query.page - 1) * query.limit) + idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.address && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.address}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {p.phone && <span style={{ fontSize: 12 }}><FiPhone size={11} /> {p.phone}</span>}
                      {p.email && <span style={{ fontSize: 12 }}><FiMail size={11} /> {p.email}</span>}
                      {p.website && (
                        <a
                          href={`https://${p.website.replace(/^https?:\/\//, '')}`}
                          target="_blank" rel="noreferrer"
                          style={{ fontSize: 12, color: 'var(--primary)' }}
                        >
                          <FiGlobe size={11} /> {p.website}
                        </a>
                      )}
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{p.book_count} books</span></td>
                  <td>
                    <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-outline btn-icon btn-sm"
                        onClick={() => { setSelected(p); setShowForm(true); }}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDelete(p)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelected(null); }}
        title={selected ? 'Edit Publisher' : 'Add Publisher'}
      >
        <PublisherForm
          publisher={selected}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setSelected(null); }}
        />
      </Modal>
    </div>
  );
}
