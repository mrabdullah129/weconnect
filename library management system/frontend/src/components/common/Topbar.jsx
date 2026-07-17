import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell, FiSun, FiMoon, FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getImageUrl, getInitials } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults([]);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get(`/books/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data.data || []);
    } catch {}
    setSearching(false);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="topbar">
      <button className="topbar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        <FiMenu />
      </button>

      <div className="topbar-search" ref={searchRef}>
        <span className="topbar-search-icon"><FiSearch /></span>
        <input
          type="text"
          placeholder="Search books, members..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden'
          }}>
            {searchResults.map(book => (
              <div
                key={book.id}
                onClick={() => { navigate('/books'); setSearchResults([]); setSearchQuery(''); }}
                style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>📚</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{book.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{book.author_name} • {book.category_name}</div>
                </div>
                <span className={`badge ms-auto ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 'auto' }}>
                  {book.available_copies > 0 ? 'Available' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <button className="topbar-btn" onClick={toggleTheme} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 10, transition: 'var(--transition)' }}
            onClick={() => setDropdownOpen(v => !v)}
          >
            <div className="user-avatar">
              {user?.avatar
                ? <img src={getImageUrl(user.avatar)} alt={user?.name} />
                : getInitials(user?.name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role_name}</span>
            </div>
            <FiChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 180,
              overflow: 'hidden', zIndex: 200, animation: 'slideUp 0.15s ease'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              {[
                { icon: <FiUser />, label: 'Profile', action: () => { navigate('/settings'); setDropdownOpen(false); } },
                { icon: <FiSettings />, label: 'Settings', action: () => { navigate('/settings'); setDropdownOpen(false); } },
                { icon: <FiLogOut />, label: 'Logout', action: handleLogout, danger: true },
              ].map(item => (
                <div
                  key={item.label}
                  onClick={item.action}
                  style={{
                    padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13.5, color: item.danger ? 'var(--danger)' : 'var(--text)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {item.icon} {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
