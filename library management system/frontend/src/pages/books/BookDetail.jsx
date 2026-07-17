import { getImageUrl, formatDate, formatCurrency } from '../../utils/helpers';

export default function BookDetail({ book }) {
  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {book.cover_image
          ? <img src={getImageUrl(book.cover_image)} alt={book.title} style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
          : <div style={{ width: 120, height: 160, background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, flexShrink: 0 }}>📚</div>
        }
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{book.title}</h2>
          {book.subtitle && <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{book.subtitle}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {book.author_name && <span className="badge badge-primary">✍️ {book.author_name}</span>}
            {book.category_name && <span className="badge badge-info">🏷️ {book.category_name}</span>}
            {book.publisher_name && <span className="badge badge-secondary">🏢 {book.publisher_name}</span>}
            <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
              {book.available_copies}/{book.total_copies} Available
            </span>
          </div>
          {book.description && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{book.description}</p>}
        </div>
      </div>

      <div className="divider" />

      <div className="grid grid-3" style={{ gap: 16 }}>
        <Field label="ISBN" value={book.isbn} />
        <Field label="Barcode" value={book.barcode} />
        <Field label="Edition" value={book.edition} />
        <Field label="Language" value={book.language} />
        <Field label="Shelf Number" value={book.shelf_number} />
        <Field label="Rack Number" value={book.rack_number} />
        <Field label="Purchase Date" value={formatDate(book.purchase_date)} />
        <Field label="Purchase Price" value={book.purchase_price ? formatCurrency(book.purchase_price) : null} />
        <Field label="Status" value={book.status} />
        <Field label="Total Copies" value={book.total_copies} />
        <Field label="Available Copies" value={book.available_copies} />
        <Field label="Added On" value={formatDate(book.created_at)} />
      </div>

      {book.pdf_file && (
        <div style={{ marginTop: 16 }}>
          <a href={getImageUrl(book.pdf_file)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            📄 View PDF
          </a>
        </div>
      )}
    </div>
  );
}
