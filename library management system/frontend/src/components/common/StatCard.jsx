export default function StatCard({ icon, label, value, color = '#2563EB', bg = 'rgba(37,99,235,0.1)', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {trend !== undefined && (
          <div style={{ fontSize: 11, marginTop: 4, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}
