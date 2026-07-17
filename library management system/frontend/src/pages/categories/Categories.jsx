import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CategoryForm from './CategoryForm';
import { confirmDelete, showSuccess, showError, getStatusBadge, formatDate, debounce } from '../../utils/helpers';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchCategories = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?${new URLSearchParams(q)}`);
      setCategories(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(query); }, [query]);

  const debouncedSearch = useCallback(
    debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400),
    []
  );

  const handleDelete = async (cat) => {
    if (!await confirmDelete(`"${cat.name}"`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      showSuccess('Category deleted!');
      fetchCategories(query);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelected(null);
    fetchCategories(query);
  };

  const handleOpenAdd = () => { setSelected(null); setShowForm(true); };
  const handleOpenEdit = (cat) => { setSelected(cat); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setSelected(null); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your books by category</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-input-wrap" style={{ maxWidth: 400 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
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
                <th>Name</th>
                <th>Description</th>
                <th>Books</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7}><LoadingSpinner /></td></tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏷️</div>
                      <div className="empty-state-title">No categories yet</div>
                      <p>Add your first category to get started</p>
                    </div>
                  </td>
                </tr>
              ) : categories.map((cat, idx) => (
                <tr key={cat.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {((query.page - 1) * query.limit) + idx + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {cat.description || '—'}
                  </td>
                  <td><span className="badge badge-primary">{cat.book_count} books</span></td>
                  <td>
                    <span className={`badge ${getStatusBadge(cat.status)}`}>{cat.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatDate(cat.created_at)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-outline btn-icon btn-sm"
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDelete(cat)}
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
        <Pagination
          pagination={pagination}
          onPageChange={page => setQuery(q => ({ ...q, page }))}
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={selected ? 'Edit Category' : 'Add Category'}
        size="sm"
      >
        <CategoryForm
          category={selected}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
}
