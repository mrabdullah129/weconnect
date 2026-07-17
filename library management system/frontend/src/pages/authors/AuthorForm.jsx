import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AuthorForm({ author, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', country: '', biography: '', status: 'active' });
  const [imgFile, setImgFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (author) {
      setForm({
        name: author.name || '',
        country: author.country || '',
        biography: author.biography || '',
        status: author.status || 'active',
      });
    } else {
      setForm({ name: '', country: '', biography: '', status: 'active' });
    }
    setImgFile(null);
  }, [author]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Author name is required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('image', imgFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (author) {
        await api.put(`/authors/${author.id}`, fd, cfg);
        toast.success('Author updated!');
      } else {
        await api.post('/authors', fd, cfg);
        toast.success('Author created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">
            Name <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            name="name"
            className="form-control"
            value={form.name}
            onChange={handleChange}
            placeholder="Author name"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <input
            name="country"
            className="form-control"
            value={form.country}
            onChange={handleChange}
            placeholder="e.g. United Kingdom"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Biography</label>
        <textarea
          name="biography"
          className="form-control"
          value={form.biography}
          onChange={handleChange}
          rows={3}
          placeholder="Short biography..."
        />
      </div>

      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Photo</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={e => setImgFile(e.target.files[0])}
          />
          {imgFile && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)' }}>
              ✓ {imgFile.name}
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-control"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : author ? 'Update Author' : 'Create Author'}
        </button>
      </div>
    </form>
  );
}
