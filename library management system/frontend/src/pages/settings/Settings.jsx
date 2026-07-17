import { useState, useEffect } from 'react';
import { FiSave, FiUser, FiSettings, FiList, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl, formatDateTime, getStatusBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TABS = [
  { id: 'library', label: 'Library Settings', icon: <FiSettings /> },
  { id: 'profile', label: 'My Profile', icon: <FiUser /> },
  { id: 'users', label: 'Users', icon: <FiUsers /> },
  { id: 'activity', label: 'Activity Logs', icon: <FiList /> },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data.data)).catch(() => {});
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      api.get('/settings/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    }
    if (activeTab === 'activity') {
      setLogsLoading(true);
      api.get('/settings/activity-logs?limit=50').then(r => setActivityLogs(r.data.data || [])).finally(() => setLogsLoading(false));
    }
  }, [activeTab]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(settings).forEach(([k, v]) => { if (v != null) fd.append(k, v); });
      if (logoFile) fd.append('logo', logoFile);
      await api.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', profile.name);
      fd.append('phone', profile.phone || '');
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const S = ({ label, field, type = 'text', placeholder }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input type={type} className="form-control" placeholder={placeholder} value={settings?.[field] || ''}
        onChange={e => setSettings(s => ({ ...s, [field]: e.target.value }))} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage library configuration</p></div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Tabs */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div className="card">
            {TABS.map(tab => (
              <div key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', cursor: 'pointer',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text)',
                  background: activeTab === tab.id ? 'rgba(37,99,235,0.08)' : 'transparent',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: 14, borderLeft: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
              >
                {tab.icon} {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Library Settings */}
          {activeTab === 'library' && settings && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">Library Settings</h3></div>
              <div className="card-body">
                <form onSubmit={handleSaveSettings}>
                  <div className="grid grid-2">
                    <S label="Library Name" field="library_name" />
                    <S label="Email" field="email" type="email" />
                    <S label="Phone" field="phone" />
                    <S label="Fine Per Day ($)" field="fine_per_day" type="number" />
                    <S label="Max Borrow Limit" field="max_borrow_limit" type="number" />
                    <S label="Borrow Duration (days)" field="borrow_duration" type="number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" value={settings.address || ''} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))} rows={2} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Library Logo</label>
                    {settings.logo && <img src={getImageUrl(settings.logo)} alt="logo" style={{ height: 60, borderRadius: 8, marginBottom: 8, display: 'block' }} />}
                    <input type="file" className="form-control" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Settings'}</button>
                </form>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div className="card-header"><h3 className="card-title">My Profile</h3></div>
                <div className="card-body">
                  <form onSubmit={handleSaveProfile}>
                    <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
                      <div className="avatar avatar-xl" style={{ borderRadius: 16, flexShrink: 0 }}>
                        {user?.avatar ? <img src={getImageUrl(user.avatar)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} alt="" /> : user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{user?.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, textTransform: 'capitalize' }}>{user?.role_name}</p>
                        <div className="form-group" style={{ marginBottom: 0, marginTop: 8 }}>
                          <input type="file" className="form-control" accept="image/*" style={{ fontSize: 12 }} onChange={e => setAvatarFile(e.target.files[0])} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-2">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Update Profile'}</button>
                  </form>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3 className="card-title">Change Password</h3></div>
                <div className="card-body">
                  <form onSubmit={handleChangePassword}>
                    <div className="grid grid-2">
                      {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm Password']].map(([field, label]) => (
                        <div key={field} className="form-group">
                          <label className="form-label">{label}</label>
                          <input type="password" className="form-control" value={passwords[field]} onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                      🔒 {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">System Users</h3></div>
              <div className="table-wrapper">
                <table className="table">
                  <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead>
                  <tbody>
                    {users.length === 0 ? <tr><td colSpan={6}><div className="empty-state" style={{ padding: 40 }}>No users</div></td></tr>
                      : users.map((u, i) => (
                        <tr key={u.id}>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ fontWeight: 500 }}>{u.name}</td>
                          <td style={{ fontSize: 13 }}>{u.email}</td>
                          <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{u.role_name}</span></td>
                          <td><span className={`badge ${getStatusBadge(u.status)}`}>{u.status}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDateTime(u.last_login)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Activity Logs */}
          {activeTab === 'activity' && (
            <div className="card">
              <div className="card-header"><h3 className="card-title">Activity Logs</h3></div>
              {logsLoading ? <LoadingSpinner /> : (
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                  {activityLogs.length === 0 ? <div className="empty-state" style={{ padding: 40 }}>No activity</div>
                    : activityLogs.map(log => (
                      <div key={log.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 7, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{log.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            <span className="badge badge-secondary" style={{ fontSize: 10, padding: '2px 6px', marginRight: 6 }}>{log.action}</span>
                            {log.user_name} • {formatDateTime(log.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
