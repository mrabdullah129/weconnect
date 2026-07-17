import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate, getImageUrl, getInitials, getStatusBadge } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MemberDetail({ memberId }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/members/${memberId}`)
      .then(r => setMember(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) return <LoadingSpinner />;
  if (!member) return <div>Not found</div>;

  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <div className="avatar avatar-xl" style={{ borderRadius: 12, flexShrink: 0 }}>
          {member.photo
            ? <img src={getImageUrl(member.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} alt="" />
            : getInitials(member.full_name)
          }
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{member.full_name}</h2>
          <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>{member.member_id}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${getStatusBadge(member.status)}`}>{member.status}</span>
            {member.department && <span className="badge badge-info">{member.department}</span>}
          </div>
        </div>
      </div>

      <div className="divider" />
      <div className="grid grid-3" style={{ gap: 16, marginBottom: 20 }}>
        <Field label="CNIC" value={member.cnic} />
        <Field label="Email" value={member.email} />
        <Field label="Phone" value={member.phone} />
        <Field label="Father's Name" value={member.father_name} />
        <Field label="City" value={member.city} />
        <Field label="Class" value={member.class} />
        <Field label="Roll Number" value={member.roll_number} />
        <Field label="Membership Date" value={formatDate(member.membership_date)} />
        <Field label="Expiry Date" value={formatDate(member.expiry_date)} />
      </div>
      {member.address && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 3 }}>Address</div>
          <div style={{ fontSize: 14 }}>{member.address}</div>
        </div>
      )}

      {member.recent_borrows?.length > 0 && (
        <>
          <div className="divider" />
          <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Recent Borrows</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {member.recent_borrows.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{b.book_title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(b.borrow_date)} → {formatDate(b.due_date)}</div>
                </div>
                <span className={`badge ${getStatusBadge(b.status)}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {member.pending_fines?.length > 0 && (
        <>
          <div className="divider" />
          <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>Pending Fines</h4>
          {member.pending_fines.map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(239,68,68,0.07)', borderRadius: 8, fontSize: 13, marginBottom: 6 }}>
              <span>Fine #{f.id}</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)' }}>${f.amount}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
