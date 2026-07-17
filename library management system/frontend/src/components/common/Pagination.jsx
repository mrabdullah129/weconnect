import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  const left = page - delta;
  const right = page + delta + 1;
  let prev = null;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i < right)) {
      if (prev && i - prev > 1) pages.push('...');
      pages.push(i);
      prev = i;
    }
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {start}–{end} of {total} results
      </div>
      <div className="pagination-buttons">
        <button className="page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          <FiChevronLeft />
        </button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
            : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
        )}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
