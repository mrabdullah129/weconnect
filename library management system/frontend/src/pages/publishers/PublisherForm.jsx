import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PublisherForm({ publisher, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', website: '', status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publisher) {
      setForm({
        name: publisher.name || '',
        address: publisher.address || '',
        phone: publisher.phone || '',
        email: publisher.email || '',
        website: publisher.website || '',
        status: publisher.status || 'active',
      });
    } else {
      setForm({ name: '', address: '', phone: '', email: '', website: '', status: 'active' });
    }
  }, [publisher]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Publisher name is required'); return; }
    setLoading(true);
    try {
      if (publisher) {
        await api.put(`/publishers/${publisher.id}`, form);
        toast.success('Publisher updated!');
      } else {
        await api.post('/publishers', form);
        toast.success('Publisher created!');
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
          placeholder="Publisher name"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          name="address"
          className="form-control"
          value={form.address}
          onChange={handleChange}
          rows={2}
          placeholder="Publisher address"
        />
      </div>

      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            name="phone"
            type="tel"
            className="form-control"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1-xxx-xxx-xxxx"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            placeholder="info@publisher.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input
            name="website"
            className="form-control"
            value={form.website}
            onChange={handleChange}
            placeholder="www.publisher.com"
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
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : publisher ? 'Update Publisher' : 'Create Publisher'}
        </button>
      </div>
    </form>
  );
}
