import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CategoryForm({ category, onSuccess, onCancel }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setForm({ name: category.name, description: category.description || '', status: category.status });
    } else {
      setForm({ name: '', description: '', status: 'active' });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setLoading(true);
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', form);
        toast.success('Category created!');
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
      <div className="form-group">
        <label className="form-label">
          Name <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          name="name"
          className="form-control"
          value={form.name}
          onChange={handleChange}
          placeholder="Category name"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="form-control"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Optional description..."
        />
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
