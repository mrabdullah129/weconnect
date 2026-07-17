import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 20, textAlign: 'center', padding: 20 }}>
      <div style={{ fontSize: 100 }}>📚</div>
      <h1 style={{ fontSize: 80, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );
}
