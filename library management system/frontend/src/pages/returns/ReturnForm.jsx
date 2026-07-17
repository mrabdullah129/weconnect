import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function ReturnForm({ onSuccess, onCancel }) {
  const [borrowSearch, setBorrowSearch] = useState('');
  const [borrows, setBorrows] = useState([]);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [fineInfo, setFineInfo] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (borrowSearch.length < 2) { setBorrows([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/borrow?search=${borrowSearch}&status=borrowed&limit=8`);
        setBorrows(res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [borrowSearch]);

  const handleSelectBorrow = async (b) => {
    setSelectedBorrow(b);
    setBorrowSearch(`${b.member_name} — ${b.book_title}`);
    setBorrows([]);
    // Calculate fine
    try {
      const res = await api.get(`/returns/calculate-fine?borrow_id=${b.id}&return_date=${returnDate}`);
      setFineInfo(res.data.data);
    } catch {}
  };

  useEffect(() => {
    if (selectedBorrow && returnDate) {
      api.get(`/returns/calculate-fine?borrow_id=${selectedBorrow.id}&return_date=${returnDate}`)
        .then(r => setFineInfo(r.data.data))
        .catch(() => {});
    }
  }, [returnDate, selectedBorrow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBorrow) { toast.error('Please select a borrow record'); return; }
    setLoading(true);
    try {
      const res = await api.post('/returns', { borrow_id: selectedBorrow.id, return_date: returnDate, remarks });
      const { fine, late_days } = res.data.data;
      if (fine > 0) {
        toast.success(`Book returned! Fine generated: ${formatCurrency(fine)} (${late_days} late days)`);
      } else {
        toast.success('Book returned successfully!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Search Active Borrow <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input className="form-control" placeholder="Type member name or book title..." value={borrowSearch}
          onChange={e => { setBorrowSearch(e.target.value); if (!e.target.value) { setSelectedBorrow(null); setFineInfo(null); } }} />
        {borrows.length > 0 && !selectedBorrow && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            {borrows.map(b => (
              <div key={b.id} onClick={() => handleSelectBorrow(b)}
                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontWeight: 600 }}>{b.member_name} — {b.book_title?.slice(0, 40)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Borrow: {formatDate(b.borrow_date)} • Due: {formatDate(b.due_date)} • {b.borrow_id}
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedBorrow && (
          <div style={{ marginTop: 8, padding: '12px 16px', background: 'rgba(37,99,235,0.07)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)', fontSize: 13 }}>
            <div><strong>Member:</strong> {selectedBorrow.member_name}</div>
            <div><strong>Book:</strong> {selectedBorrow.book_title}</div>
            <div><strong>Due Date:</strong> {formatDate(selectedBorrow.due_date)}</div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Return Date</label>
        <input type="date" className="form-control" value={returnDate}
          onChange={e => setReturnDate(e.target.value)} />
      </div>

      {fineInfo && (
        <div style={{ padding: '14px 16px', borderRadius: 10, marginBottom: 16, border: '1px solid', ...fineInfo.fine > 0 ? { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' } : { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' } }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Fine Calculation</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Late Days:</span> <strong>{fineInfo.late_days}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Rate:</span> <strong>{formatCurrency(fineInfo.fine_per_day)}/day</strong></div>
            <div><span style={{ color: fineInfo.fine > 0 ? 'var(--danger)' : 'var(--success)' }}>Fine: <strong>{formatCurrency(fineInfo.fine)}</strong></span></div>
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Remarks</label>
        <textarea className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Optional remarks..." />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-success" disabled={loading || !selectedBorrow}>
          {loading ? 'Processing...' : 'Return Book'}
        </button>
      </div>
    </form>
  );
}
