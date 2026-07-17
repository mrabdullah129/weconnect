import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AuthorForm from './AuthorForm';
import { confirmDelete, showSuccess, showError, formatDate, getImageUrl, getInitials, debounce } from '../../utils/helpers';

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchAuthors = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/authors?${new URLSearchParams(q)}`);
      setAuthors(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      showError('Failed to load authors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuthors(query); }, [query]);

  const debouncedSearch = useCallback(
    debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400),
    []
  );

  const handleDelete = async (a) => {
    if (!await confirmDelete(`"${a.name}"`)) return;
    try {
      await api.delete(`/authors/${a.id}`);
      showSuccess('Author deleted!');
      fetchAuthors(query);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelected(null);
    fetchAuthors(query);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">Manage book authors</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true); }}>
          <FiPlus /> Add Author
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-input-wrap" style={{ maxWidth: 400 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search authors..."
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
                <th>Author</th>
                <th>Country</th>
                <th>Books</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}><LoadingSpinner /></td></tr>
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">✍️</div>
                      <div className="empty-state-title">No authors yet</div>
                    </div>
                  </td>
                </tr>
              ) : authors.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {((query.page - 1) * query.limit) + idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: '#7C3AED', borderRadius: 8, flexShrink: 0 }}
                      >
                        {a.image
                          ? <img src={getImageUrl(a.image)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} alt="" />
                          : getInitials(a.name)
                        }
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</div>
                        {a.biography && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {a.biography.slice(0, 60)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{a.country || '—'}</td>
                  <td><span className="badge badge-primary">{a.book_count} books</span></td>
                  <td>
                    <span className={`badge ${a.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-outline btn-icon btn-sm"
                        onClick={() => { setSelected(a); setShowForm(true); }}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDelete(a)}
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
        title={selected ? 'Edit Author' : 'Add Author'}
      >
        <AuthorForm
          author={selected}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setSelected(null); }}
        />
      </Modal>
    </div>
  );
}
