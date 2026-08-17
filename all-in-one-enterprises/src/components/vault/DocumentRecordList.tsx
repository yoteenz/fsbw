import { Link } from 'react-router-dom';
import type { VaultDocument } from '../../vault/vaultTypes';
import { labelForCategory } from '../../vault/vaultTaxonomy';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { usePaginatedList } from '../../vault/usePaginatedList';

type Props = {
  documents: VaultDocument[];
  detailHref: (id: string) => string;
  showInternalFields?: boolean;
  onReview?: (id: string) => void;
  pageSize?: number;
};

function lifecycleLabel(doc: VaultDocument): string {
  if (doc.recordLifecycle) return doc.recordLifecycle.replace(/_/g, ' ');
  if (!doc.isCurrent) return 'historical';
  if (doc.status === 'verified') return 'current';
  return doc.status.replace(/_/g, ' ');
}

export function DocumentRecordList({ documents, detailHref, showInternalFields, onReview, pageSize = 25 }: Props) {
  const pagination = usePaginatedList(documents, pageSize);

  if (documents.length === 0) {
    return (
      <div className="aio-doc-vault-empty">
        <h2>No documents yet</h2>
        <p>Upload records or digitize an existing physical file to begin building this client&apos;s secure archive.</p>
      </div>
    );
  }

  return (
    <>
    <ul className="aio-doc-vault-list">
      {pagination.items.map((doc) => (
        <li key={doc.id} className="aio-doc-vault-record">
          <div className="aio-doc-vault-record__main">
            <div className="aio-doc-vault-record__title-row">
              <strong>{doc.title}</strong>
              <span className={`aio-doc-vault-record__status aio-doc-vault-record__status--${doc.isCurrent ? 'current' : 'historical'}`}>
                {lifecycleLabel(doc)}
              </span>
            </div>
            <p className="aio-doc-vault-record__meta">
              {labelForCategory(doc.category)} · {doc.documentType}
              {doc.expiresAt ? ` · Expires ${formatDaysRemaining(doc.expiresAt.slice(0, 10))}` : ''}
            </p>
            {showInternalFields && doc.physicalOriginalStatus && (
              <p className="aio-doc-vault-record__internal">Physical: {doc.physicalOriginalStatus.replace(/_/g, ' ')}</p>
            )}
            {showInternalFields && doc.physicalArchiveLocation && (
              <p className="aio-doc-vault-record__internal">Archive location: {doc.physicalArchiveLocation}</p>
            )}
            {!showInternalFields && doc.visibility === 'customer' && (
              <p className="aio-doc-vault-record__visibility">Available in your portal</p>
            )}
          </div>
          <div className="aio-doc-vault-record__actions">
            <Link to={detailHref(doc.id)} className="aio-btn aio-btn--sm aio-btn--outline-dark">
              Details
            </Link>
            {onReview && doc.reviewStatus !== 'approved' && (
              <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => onReview(doc.id)}>
                Review
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
    {pagination.pageCount > 1 && (
      <nav className="aio-doc-vault-pagination" aria-label="Document list pages">
        <button type="button" className="aio-btn aio-btn--sm aio-btn--outline-dark" disabled={!pagination.hasPrev} onClick={pagination.goPrev}>
          Previous
        </button>
        <span className="aio-doc-vault-pagination__label">
          Page {pagination.page + 1} of {pagination.pageCount} · {pagination.total} records
        </span>
        <button type="button" className="aio-btn aio-btn--sm aio-btn--outline-dark" disabled={!pagination.hasNext} onClick={pagination.goNext}>
          Next
        </button>
      </nav>
    )}
    </>
  );
}
