export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="page-loader">
      <div className="loading-spinner" />
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{message}</span>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton" style={{ height: 16, borderRadius: 4, width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '40%' }} />
    </div>
  );
}
