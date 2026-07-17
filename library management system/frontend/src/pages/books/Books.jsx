import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiDownload, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BookForm from './BookForm';
import BookDetail from './BookDetail';
import { confirmDelete, showSuccess, showError, getStatusBadge, formatDate, getImageUrl, exportToCSV, truncate, debounce } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', category: '', status: '', sortBy: 'b.created_at', sortOrder: 'DESC' });
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewBook, setViewBook] = useState(null);

  useEffect(() => {
    api.get('/categories/all').then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const fetchBooks = useCallback(async (q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(q).toString();
      const res = await api.get(`/books?${params}`);
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      showError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(query); }, [query]);

  const debouncedSearch = useCallback(debounce((val) => {
    setQuery(q => ({ ...q, search: val, page: 1 }));
  }, 400), []);

  const handleDelete = async (book) => {
    if (!await confirmDelete(`"${book.title}"`)) return;
    try {
      await api.delete(`/books/${book.id}`);
      showSuccess('Book deleted successfully');
      fetchBooks(query);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedBook(null);
    fetchBooks(query);
  };

  const handleExport = () => {
    exportToCSV(books.map(b => ({
      ID: b.id, Title: b.title, ISBN: b.isbn || '', Author: b.author_name || '',
      Category: b.category_name || '', Publisher: b.publisher_name || '',
      'Total Copies': b.total_copies, 'Available': b.available_copies, Status: b.status,
    })), 'books-export');
    toast.success('Exported successfully!');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">Manage your library book collection</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExport}><FiDownload /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => { setSelectedBook(null); setShowForm(true); }}>
            <FiPlus /> Add Book
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="search-bar">
            <div className="search-input-wrap" style={{ flex: 2 }}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, ISBN, author..."
                onChange={e => debouncedSearch(e.target.value)}
              />
            </div>
            <select className="form-control" style={{ maxWidth: 180 }}
              value={query.category}
              onChange={e => setQuery(q => ({ ...q, category: e.target.value, page: 1 }))}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="form-control" style={{ maxWidth: 150 }}
              value={query.status}
              onChange={e => setQuery(q => ({ ...q, status: e.target.value, page: 1 }))}>
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="lost">Lost</option>
            </select>
            <select className="form-control" style={{ maxWidth: 180 }}
              value={`${query.sortBy}_${query.sortOrder}`}
              onChange={e => { const [sortBy, sortOrder] = e.target.value.split('_'); setQuery(q => ({ ...q, sortBy, sortOrder, page: 1 })); }}>
              <option value="b.created_at_DESC">Newest First</option>
              <option value="b.created_at_ASC">Oldest First</option>
              <option value="b.title_ASC">Title A-Z</option>
              <option value="b.title_DESC">Title Z-A</option>
              <option value="b.available_copies_DESC">Most Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>ISBN</th>
                <th>Author</th>
                <th>Category</th>
                <th>Copies</th>
                <th>Available</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}><LoadingSpinner /></td></tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📚</div>
                      <div className="empty-state-title">No books found</div>
                      <p>Try adjusting your search or add a new book</p>
                    </div>
                  </td>
                </tr>
              ) : books.map((book, idx) => (
                <tr key={book.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {((query.page - 1) * query.limit) + idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {book.cover_image
                        ? <img src={getImageUrl(book.cover_image)} alt={book.title} style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 48, background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📚</div>
                      }
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{truncate(book.title, 40)}</div>
                        {book.subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{truncate(book.subtitle, 40)}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{book.isbn || '—'}</td>
                  <td>{book.author_name || '—'}</td>
                  <td>{book.category_name || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{book.total_copies}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, color: book.available_copies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {book.available_copies}
                    </span>
                  </td>
                  <td><span className={`badge ${getStatusBadge(book.status)}`}>{book.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(book.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-icon btn-sm" onClick={() => { setViewBook(book); setShowDetail(true); }} title="View"><FiEye /></button>
                      <button className="btn btn-outline btn-icon btn-sm" onClick={() => { setSelectedBook(book); setShowForm(true); }} title="Edit"><FiEdit2 /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(book)} title="Delete"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelectedBook(null); }} title={selectedBook ? 'Edit Book' : 'Add New Book'} size="lg">
        <BookForm book={selectedBook} onSuccess={handleFormSuccess} onCancel={() => { setShowForm(false); setSelectedBook(null); }} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Book Details" size="lg">
        {viewBook && <BookDetail book={viewBook} />}
      </Modal>
    </div>
  );
}
