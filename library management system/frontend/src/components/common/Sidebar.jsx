import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiBook, FiHome, FiUsers, FiTag, FiUser, FiTruck, FiRotateCcw,
  FiDollarSign, FiBarChart2, FiSettings, FiBookOpen, FiLayers
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', icon: <FiHome />, to: '/dashboard', section: 'main' },
  { label: 'Books', icon: <FiBook />, to: '/books', section: 'library' },
  { label: 'Categories', icon: <FiTag />, to: '/categories', section: 'library' },
  { label: 'Authors', icon: <FiUser />, to: '/authors', section: 'library' },
  { label: 'Publishers', icon: <FiLayers />, to: '/publishers', section: 'library' },
  { label: 'Members', icon: <FiUsers />, to: '/members', section: 'circulation' },
  { label: 'Borrow Books', icon: <FiBookOpen />, to: '/borrow', section: 'circulation' },
  { label: 'Return Books', icon: <FiRotateCcw />, to: '/returns', section: 'circulation' },
  { label: 'Fines', icon: <FiDollarSign />, to: '/fines', section: 'circulation' },
  { label: 'Reports', icon: <FiBarChart2 />, to: '/reports', section: 'other' },
  { label: 'Settings', icon: <FiSettings />, to: '/settings', section: 'other' },
];

const sections = {
  main: 'Main',
  library: 'Library',
  circulation: 'Circulation',
  other: 'System',
};

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📚</div>
        {!collapsed && <div className="sidebar-logo-text">LibraryMS</div>}
      </div>

      <nav className="sidebar-nav">
        {Object.entries(groupedItems).map(([section, items]) => (
          <div key={section}>
            {!collapsed && <div className="nav-section-title">{sections[section]}</div>}
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {!collapsed && <span className="nav-item-text">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-sm" style={{ background: '#2563EB', fontSize: 12, borderRadius: 8, flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ color: '#64748B', fontSize: 11, textTransform: 'capitalize' }}>{user?.role_name}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
