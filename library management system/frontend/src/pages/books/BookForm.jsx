import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = ['English', 'Urdu', 'Arabic', 'French', 'German', 'Spanish', 'Chinese', 'Other'];

export default function BookForm({ book, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    isbn: '', barcode: '', title: '', subtitle: '',
    author_id: '', category_id: '', publisher_id: '',
    edition: '', language: 'English', shelf_number: '', rack_number: '',
    purchase_date: '', purchase_price: '', total_copies: 1,
    description: '', status: 'available',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/categories/all'),
      api.get('/authors/all'),
      api.get('/publishers/all'),
    ]).then(([c, a, p]) => {
      setCategories(c.data.data || []);
      setAuthors(a.data.data || []);
      setPublishers(p.data.data || []);
    }).catch(() => {});

    if (book) {
      setForm({
        isbn: book.isbn || '', barcode: book.barcode || '',
        title: book.title || '', subtitle: book.subtitle || '',
        author_id: book.author_id || '', category_id: book.category_id || '',
        publisher_id: book.publisher_id || '', edition: book.edition || '',
        language: book.language || 'English',
        shelf_number: book.shelf_number || '', rack_number: book.rack_number || '',
        purchase_date: book.purchase_date?.slice(0, 10) || '',
        purchase_price: book.purchase_price || '',
        total_copies: book.total_copies || 1,
        description: book.description || '', status: book.status || 'available',
      });
      setCoverPreview(null);
    } else {
      setForm({
        isbn: '', barcode: '', title: '', subtitle: '',
        author_id: '', category_id: '', publisher_id: '',
        edition: '', language: 'English', shelf_number: '', rack_number: '',
        purchase_date: '', purchase_price: '', total_copies: 1,
        description: '', status: 'available',
      });
      setCoverPreview(null);
    }
    setCoverFile(null);
    setPdfFile(null);
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (coverFile) fd.append('cover_image', coverFile);
      if (pdfFile) fd.append('pdf_file', pdfFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (book) {
        await api.put(`/books/${book.id}`, fd, cfg);
        toast.success('Book updated successfully!');
      } else {
        await api.post('/books', fd, cfg);
        toast.success('Book added successfully!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-2">

        <div className="form-group">
          <label className="form-label">Book Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input name="title" type="text" className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            value={form.title} onChange={handleChange} placeholder="Enter book title" />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Subtitle</label>
          <input name="subtitle" type="text" className="form-control"
            value={form.subtitle} onChange={handleChange} placeholder="Optional subtitle" />
        </div>

        <div className="form-group">
          <label className="form-label">ISBN</label>
          <input name="isbn" type="text" className="form-control"
            value={form.isbn} onChange={handleChange} placeholder="978-x-xxx-xxxxx-x" />
        </div>

        <div className="form-group">
          <label className="form-label">Barcode</label>
          <input name="barcode" type="text" className="form-control"
            value={form.barcode} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Author</label>
          <select name="author_id" className="form-control" value={form.author_id} onChange={handleChange}>
            <option value="">Select Author</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select name="category_id" className="form-control" value={form.category_id} onChange={handleChange}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Publisher</label>
          <select name="publisher_id" className="form-control" value={form.publisher_id} onChange={handleChange}>
            <option value="">Select Publisher</option>
            {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Language</label>
          <select name="language" className="form-control" value={form.language} onChange={handleChange}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Edition</label>
          <input name="edition" type="text" className="form-control"
            value={form.edition} onChange={handleChange} placeholder="e.g. 2nd Edition" />
        </div>

        <div className="form-group">
          <label className="form-label">Total Copies</label>
          <input name="total_copies" type="number" className="form-control"
            value={form.total_copies} onChange={handleChange} min="1" />
        </div>

        <div className="form-group">
          <label className="form-label">Shelf Number</label>
          <input name="shelf_number" type="text" className="form-control"
            value={form.shelf_number} onChange={handleChange} placeholder="e.g. A-12" />
        </div>

        <div className="form-group">
          <label className="form-label">Rack Number</label>
          <input name="rack_number" type="text" className="form-control"
            value={form.rack_number} onChange={handleChange} placeholder="e.g. R-3" />
        </div>

        <div className="form-group">
          <label className="form-label">Purchase Date</label>
          <input name="purchase_date" type="date" className="form-control"
            value={form.purchase_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Purchase Price</label>
          <input name="purchase_price" type="number" className="form-control"
            value={form.purchase_price} onChange={handleChange} step="0.01" min="0" placeholder="0.00" />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-control" value={form.status} onChange={handleChange}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="lost">Lost</option>
          </select>
        </div>

      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-control" rows={3}
          value={form.description} onChange={handleChange} placeholder="Book description..." />
      </div>

      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Cover Image</label>
          <input type="file" className="form-control" accept="image/*"
            onChange={e => {
              const f = e.target.files[0];
              setCoverFile(f);
              if (f) setCoverPreview(URL.createObjectURL(f));
            }} />
          {coverPreview && (
            <img src={coverPreview} alt="cover preview"
              style={{ width: 80, height: 110, objectFit: 'cover', marginTop: 8, borderRadius: 6 }} />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">PDF File</label>
          <input type="file" className="form-control" accept=".pdf"
            onChange={e => setPdfFile(e.target.files[0])} />
          {pdfFile && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)' }}>✓ {pdfFile.name}</div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}
