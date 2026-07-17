import { useState } from 'react';
import { FiBarChart2, FiDownload, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency, getStatusBadge, exportToCSV } from '../../utils/helpers';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'books', label: '📚 Books Report', endpoint: '/reports/books' },
  { id: 'members', label: '👥 Members Report', endpoint: '/reports/members' },
  { id: 'borrow', label: '📤 Borrow Report', endpoint: '/reports/borrow' },
  { id: 'return', label: '📥 Return Report', endpoint: '/reports/return' },
  { id: 'fines', label: '💰 Fine Report', endpoint: '/reports/fines' },
  { id: 'inventory', label: '📦 Inventory Report', endpoint: '/reports/inventory' },
];

export default function Reports() {
  const [reportType, setReportType] = useState('books');
  const [filters, setFilters] = useState({ from_date: '', to_date: '', status: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const selected = REPORT_TYPES.find(r => r.id === reportType);

  const generateReport = async () => {
    setLoading(true);
    setData(null);
    try {
      const params = new URLSearchParams();
      if (filters.from_date) params.set('from_date', filters.from_date);
      if (filters.to_date) params.set('to_date', filters.to_date);
      if (filters.status) params.set('status', filters.status);
      const res = await api.get(`${selected.endpoint}?${params}`);
      setData(res.data.data);
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(false); }
  };

  const handleExport = () => {
    if (!data?.length) { toast.error('No data to export'); return; }
    exportToCSV(data, `${reportType}-report-${new Date().toISOString().split('T')[0]}`);
    toast.success('Exported!');
  };

  const renderTable = () => {
    if (!data) return null;
    if (data.length === 0) return <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No data for selected filters</div></div>;

    const cols = {
      books: ['title', 'isbn', 'author_name', 'category_name', 'publisher_name', 'total_copies', 'available_copies', 'status'],
      members: ['member_id', 'full_name', 'email', 'phone', 'department', 'total_borrows', 'active_borrows', 'pending_fines', 'status'],
      borrow: ['borrow_id', 'member_name', 'book_title', 'borrow_date', 'due_date', 'status'],
      return: ['return_id', 'member_name', 'book_title', 'return_date', 'late_days', 'fine'],
      fines: ['member_name', 'member_code', 'book_title', 'amount', 'paid_amount', 'status', 'created_at'],
      inventory: ['title', 'isbn', 'category_name', 'total_copies', 'available_copies', 'currently_borrowed', 'status'],
    };

    const headers = cols[reportType] || Object.keys(data[0]);

    return (
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              {headers.map(h => <th key={h}>{h.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{idx + 1}</td>
                {headers.map(h => (
                  <td key={h} style={{ fontSize: 13 }}>
                    {h === 'status' ? <span className={`badge ${getStatusBadge(row[h])}`}>{row[h]}</span>
                      : h.includes('date') ? formatDate(row[h])
                      : h === 'fine' || h === 'amount' || h === 'paid_amount' || h === 'pending_fines' ? (row[h] > 0 ? formatCurrency(row[h]) : '—')
                      : row[h] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Generate and export library reports</p></div>
        {data && data.length > 0 && (
          <button className="btn btn-outline" onClick={handleExport}><FiDownload /> Export CSV</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {REPORT_TYPES.map(r => (
              <button
                key={r.id}
                className={`btn ${reportType === r.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => { setReportType(r.id); setData(null); }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>From Date</label>
              <input type="date" className="form-control" value={filters.from_date}
                onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: 12 }}>To Date</label>
              <input type="date" className="form-control" value={filters.to_date}
                onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
            </div>
            {['borrow', 'members', 'books', 'fines'].includes(reportType) && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Status</label>
                <select className="form-control" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  {reportType === 'borrow' && <><option value="borrowed">Borrowed</option><option value="returned">Returned</option><option value="overdue">Overdue</option></>}
                  {reportType === 'fines' && <><option value="pending">Pending</option><option value="paid">Paid</option><option value="waived">Waived</option></>}
                </select>
              </div>
            )}
            <button className="btn btn-primary" onClick={generateReport} disabled={loading} style={{ marginTop: 2 }}>
              {loading ? 'Generating...' : <><FiBarChart2 /> Generate Report</>}
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Generating report..." />}

      {data && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">{selected?.label} — {data.length} records</h3>
            <button className="btn btn-outline btn-sm" onClick={handleExport}><FiDownload /> Export</button>
          </div>
          {renderTable()}
        </div>
      )}
    </div>
  );
}
