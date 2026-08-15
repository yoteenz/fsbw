import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, searchVaultDocuments } from '../../demo/vaultActions';
import { VAULT_CATEGORIES } from '../../vault/vaultConfig';
import { VaultUpload } from '../../components/VaultUpload';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { aioPaths } from '../../utils/paths';
import { formatDaysRemaining } from '../../calendar/calendarService';

export function VaultPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const docs = useMemo(
    () => searchVaultDocuments(orgId, query, filter ? { status: filter } : undefined),
    [orgId, query, filter, store.documents],
  );

  const requested = docs.filter((d) => d.status === 'requested');
  const attention = docs.filter((d) => ['uploaded', 'under_review', 'rejected', 'expired'].includes(d.status));

  return (
    <div className="aio-vault">
      <header className="aio-vault__header">
        <h1>All In One Vault</h1>
        <p>Your secure business document hub — uploads are reviewed by All In One before verification.</p>
        <button type="button" className="aio-btn aio-btn--gold" onClick={() => setShowUpload((v) => !v)}>
          {showUpload ? 'Hide Upload' : 'Upload Document'}
        </button>
      </header>

      {showUpload && <VaultUpload onUploaded={() => setShowUpload(false)} />}

      {requested.length > 0 && (
        <section className="aio-vault-banner aio-vault-banner--warn">
          <strong>{requested.length} document(s) requested</strong> — All In One is waiting for these files.
        </section>
      )}

      <div className="aio-vault-toolbar">
        <input className="aio-intake-input" placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search vault" />
        <select className="aio-intake-input" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="uploaded">Uploaded</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {docs.length === 0 ? (
        <div className="aio-empty-state">
          <p className="aio-empty-state__text">No documents match your search.</p>
        </div>
      ) : (
        <ul className="aio-vault-grid">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Link to={aioPaths.portalVaultDocument(doc.id)} className="aio-vault-card">
                <span className="aio-vault-card__cat">{VAULT_CATEGORIES.find((c) => c.id === doc.category)?.label ?? doc.category}</span>
                <strong>{doc.title}</strong>
                <span>{doc.documentType}</span>
                <div className="aio-vault-card__badges">
                  <RoadReadyStatusBadge kind="status" value={doc.status === 'verified' ? 'completed' : doc.status === 'requested' ? 'action_needed' : doc.status === 'rejected' ? 'action_needed' : 'in_progress'} />
                  <RoadReadyStatusBadge kind="verification" value={doc.verificationStatus} />
                </div>
                {doc.expiresAt && <span className="aio-vault-card__exp">{formatDaysRemaining(doc.expiresAt.slice(0, 10))}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {attention.length === 0 && requested.length === 0 && docs.length > 0 && (
        <p className="aio-vault-caught-up">All requested documents have been received. No documents currently need your attention.</p>
      )}
    </div>
  );
}
