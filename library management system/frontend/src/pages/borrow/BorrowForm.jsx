import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BorrowForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({ member_id: '', book_id: '', borrow_date: new Date().toISOString().split('T')[0], due_date: '' });
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [settings, setSettings] = useState({ borrow_duration: 14 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => {
      const s = r.data.data;
      setSettings(s);
      const due = new Date();
      due.setDate(due.getDate() + (s.borrow_duration || 14));
      setForm(f => ({ ...f, due_date: due.toISOString().split('T')[0] }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (memberSearch.length < 2) { setMembers([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/members?search=${memberSearch}&limit=8`);
        setMembers(res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch]);

  useEffect(() => {
    if (bookSearch.length < 2) { setBooks([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/books?search=${bookSearch}&status=available&limit=8`);
        setBooks(res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [bookSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.member_id || !form.book_id) { toast.error('Please select member and book'); return; }
    setLoading(true);
    try {
      await api.post('/borrow', form);
      toast.success('Book borrowed successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to borrow');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Member Search */}
      <div className="form-group">
        <label className="form-label">Search Member <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input className="form-control" placeholder="Type member name, ID or CNIC..." value={memberSearch}
          onChange={e => { setMemberSearch(e.target.value); if (!e.target.value) { setSelectedMember(null); setForm(f => ({ ...f, member_id: '' })); } }} />
        {members.length > 0 && !selectedMember && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            {members.map(m => (
              <div key={m.id} onClick={() => { setSelectedMember(m); setForm(f => ({ ...f, member_id: m.id })); setMemberSearch(m.full_name); setMembers([]); }}
                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.member_id} • {m.status}</div>
              </div>
            ))}
          </div>
        )}
        {selectedMember && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(34,197,94,0.07)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', fontSize: 13 }}>
            ✅ <strong>{selectedMember.full_name}</strong> ({selectedMember.member_id}) — {selectedMember.status}
          </div>
        )}
      </div>

      {/* Book Search */}
      <div className="form-group">
        <label className="form-label">Search Book <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input className="form-control" placeholder="Type book title or ISBN..." value={bookSearch}
          onChange={e => { setBookSearch(e.target.value); if (!e.target.value) { setSelectedBook(null); setForm(f => ({ ...f, book_id: '' })); } }} />
        {books.length > 0 && !selectedBook && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            {books.map(b => (
              <div key={b.id} onClick={() => { setSelectedBook(b); setForm(f => ({ ...f, book_id: b.id })); setBookSearch(b.title); setBooks([]); }}
                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 600 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.author_name} • {b.available_copies} available</div>
              </div>
            ))}
          </div>
        )}
        {selectedBook && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(37,99,235,0.07)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)', fontSize: 13 }}>
            📚 <strong>{selectedBook.title}</strong> — {selectedBook.available_copies} copies available
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="form-group">
          <label className="form-label">Borrow Date</label>
          <input type="date" className="form-control" value={form.borrow_date}
            onChange={e => setForm(f => ({ ...f, borrow_date: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-control" value={form.due_date}
            onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
        ℹ️ Borrow duration: <strong>{settings.borrow_duration} days</strong> • Max borrow limit: <strong>{settings.max_borrow_limit} books</strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || !form.member_id || !form.book_id}>
          {loading ? 'Processing...' : 'Borrow Book'}
        </button>
      </div>
    </form>
  );
}
