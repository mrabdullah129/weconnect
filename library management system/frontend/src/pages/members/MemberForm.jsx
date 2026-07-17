import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MemberForm({ member, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    full_name: '', father_name: '', cnic: '', email: '', phone: '',
    address: '', city: '', department: '', class: '', roll_number: '',
    membership_date: '', expiry_date: '', status: 'active',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setForm({
        full_name: member.full_name || '',
        father_name: member.father_name || '',
        cnic: member.cnic || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        city: member.city || '',
        department: member.department || '',
        class: member.class || '',
        roll_number: member.roll_number || '',
        membership_date: member.membership_date?.slice(0, 10) || '',
        expiry_date: member.expiry_date?.slice(0, 10) || '',
        status: member.status || 'active',
      });
    } else {
      setForm({
        full_name: '', father_name: '', cnic: '', email: '', phone: '',
        address: '', city: '', department: '', class: '', roll_number: '',
        membership_date: '', expiry_date: '', status: 'active',
      });
    }
    setPhotoFile(null);
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (member) {
        await api.put(`/members/${member.id}`, fd, cfg);
        toast.success('Member updated!');
      } else {
        await api.post('/members', fd, cfg);
        toast.success('Member registered!');
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
          <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input name="full_name" type="text" className="form-control"
            value={form.full_name} onChange={handleChange} placeholder="Enter full name" />
        </div>

        <div className="form-group">
          <label className="form-label">Father's Name</label>
          <input name="father_name" type="text" className="form-control"
            value={form.father_name} onChange={handleChange} placeholder="Father's name" />
        </div>

        <div className="form-group">
          <label className="form-label">CNIC</label>
          <input name="cnic" type="text" className="form-control"
            value={form.cnic} onChange={handleChange} placeholder="xxxxx-xxxxxxx-x" />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-control"
            value={form.email} onChange={handleChange} placeholder="email@example.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input name="phone" type="tel" className="form-control"
            value={form.phone} onChange={handleChange} placeholder="+1-xxx-xxx-xxxx" />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input name="city" type="text" className="form-control"
            value={form.city} onChange={handleChange} placeholder="City" />
        </div>

        <div className="form-group">
          <label className="form-label">Department</label>
          <input name="department" type="text" className="form-control"
            value={form.department} onChange={handleChange} placeholder="Department" />
        </div>

        <div className="form-group">
          <label className="form-label">Class</label>
          <input name="class" type="text" className="form-control"
            value={form.class} onChange={handleChange} placeholder="Class/Year" />
        </div>

        <div className="form-group">
          <label className="form-label">Roll Number</label>
          <input name="roll_number" type="text" className="form-control"
            value={form.roll_number} onChange={handleChange} placeholder="Roll number" />
        </div>

        <div className="form-group">
          <label className="form-label">Membership Date</label>
          <input name="membership_date" type="date" className="form-control"
            value={form.membership_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input name="expiry_date" type="date" className="form-control"
            value={form.expiry_date} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select name="status" className="form-control" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>
        </div>

      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea name="address" className="form-control" rows={2}
          value={form.address} onChange={handleChange} placeholder="Full address..." />
      </div>

      <div className="form-group">
        <label className="form-label">Member Photo</label>
        <input type="file" className="form-control" accept="image/*"
          onChange={e => setPhotoFile(e.target.files[0])} />
        {photoFile && (
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--success)' }}>✓ {photoFile.name}</div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : member ? 'Update Member' : 'Register Member'}
        </button>
      </div>
    </form>
  );
}
