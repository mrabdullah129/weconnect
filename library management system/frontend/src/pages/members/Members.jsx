import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MemberForm from './MemberForm';
import MemberDetail from './MemberDetail';
import { confirmDelete, showSuccess, showError, getStatusBadge, formatDate, getImageUrl, getInitials, debounce } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewMember, setViewMember] = useState(null);

  const fetchMembers = useCallback(async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/members?${new URLSearchParams(q)}`);
      setMembers(res.data.data); setPagination(res.data.pagination);
    } catch { showError('Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(query); }, [query]);
  const debouncedSearch = useCallback(debounce((v) => setQuery(q => ({ ...q, search: v, page: 1 })), 400), []);

  const handleDelete = async (m) => {
    if (!await confirmDelete(`"${m.full_name}"`)) return;
    try { await api.delete(`/members/${m.id}`); showSuccess('Deleted!'); fetchMembers(query); }
    catch (err) { showError(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Members</h1><p className="page-subtitle">Manage library members</p></div>
        <button className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true); }}><FiPlus /> Add Member</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '14px 20px' }}>
          <div className="search-bar">
            <div className="search-input-wrap" style={{ flex: 2 }}>
              <FiSearch className="search-icon" />
              <input type="text" className="form-control" placeholder="Search by name, CNIC, email, phone..." onChange={e => debouncedSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ maxWidth: 160 }} value={query.status} onChange={e => setQuery(q => ({ ...q, status: e.target.value, page: 1 }))}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Member</th><th>Member ID</th><th>Contact</th><th>Department</th><th>Membership</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8}><LoadingSpinner /></td></tr>
                : members.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No members found</div></div></td></tr>
                : members.map((m, idx) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{((query.page - 1) * query.limit) + idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ borderRadius: 8, flexShrink: 0 }}>
                          {m.photo ? <img src={getImageUrl(m.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} alt="" /> : getInitials(m.full_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.full_name}</div>
                          {m.cnic && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.cnic}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{m.member_id}</span></td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        {m.email && <div>{m.email}</div>}
                        {m.phone && <div style={{ color: 'var(--text-secondary)' }}>{m.phone}</div>}
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{m.department || '—'}</td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <div>From: {formatDate(m.membership_date)}</div>
                        <div style={{ color: 'var(--text-muted)' }}>To: {formatDate(m.expiry_date)}</div>
                      </div>
                    </td>
                    <td><span className={`badge ${getStatusBadge(m.status)}`}>{m.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => { setViewMember(m); setShowDetail(true); }} title="View"><FiEye /></button>
                        <button className="btn btn-outline btn-icon btn-sm" onClick={() => { setSelected(m); setShowForm(true); }} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(m)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={page => setQuery(q => ({ ...q, page }))} />
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null); }} title={selected ? 'Edit Member' : 'Register Member'} size="lg">
        <MemberForm member={selected} onSuccess={() => { setShowForm(false); setSelected(null); fetchMembers(query); }} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Member Details" size="lg">
        {viewMember && <MemberDetail memberId={viewMember.id} />}
      </Modal>
    </div>
  );
}
