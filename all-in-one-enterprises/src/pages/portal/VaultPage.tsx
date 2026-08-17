import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId, searchVaultDocuments } from '../../demo/vaultActions';
import { computeDocumentVaultMetrics } from '../../vault/documentVaultMetrics';
import { categoriesForTaxonomyGroup, type VaultTaxonomyGroup } from '../../vault/vaultTaxonomy';
import { DocumentVaultMetricsBar } from '../../components/vault/DocumentVaultMetricsBar';
import { DocumentCategoryNav } from '../../components/vault/DocumentCategoryNav';
import { VaultUpload } from '../../components/VaultUpload';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { aioPaths } from '../../utils/paths';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { labelForCategory } from '../../vault/vaultTaxonomy';

export function VaultPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<VaultTaxonomyGroup | 'all'>('all');
  const [showUpload, setShowUpload] = useState(false);

  const docs = useMemo(() => {
    let list = searchVaultDocuments(orgId, query, filter ? { status: filter } : undefined);
    if (categoryGroup !== 'all') {
      const cats = categoriesForTaxonomyGroup(categoryGroup);
      list = list.filter((d) => cats.includes(d.category));
    }
    return list.filter((d) => d.visibility === 'customer');
  }, [orgId, query, filter, categoryGroup, store.documents]);

  const metrics = useMemo(() => computeDocumentVaultMetrics(docs), [docs]);
  const requested = docs.filter((d) => d.status === 'requested');
  const attention = docs.filter((d) => ['uploaded', 'under_review', 'rejected', 'expired'].includes(d.status));

  return (
    <div className="aio-vault">
      <header className="aio-vault__header">
        <h1>Document Vault</h1>
        <p>Your business records, filings, permits, and historical documents in one secure place.</p>
        <button type="button" className="aio-btn aio-btn--gold" onClick={() => setShowUpload((v) => !v)}>
          {showUpload ? 'Hide Upload' : 'Upload Document'}
        </button>
      </header>

      <DocumentVaultMetricsBar metrics={metrics} />

      {showUpload && <VaultUpload onUploaded={() => setShowUpload(false)} />}

      {requested.length > 0 && (
        <section className="aio-vault-banner aio-vault-banner--warn">
          <strong>{requested.length} document(s) requested</strong> — All In One is waiting for these files.
        </section>
      )}

      <div className="aio-vault-toolbar">
        <input className="aio-intake-input" placeholder="Search your business records…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search vault" />
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

      <DocumentCategoryNav active={categoryGroup} onChange={setCategoryGroup} />

      {docs.length === 0 ? (
        <div className="aio-doc-vault-empty">
          <h2>No documents yet</h2>
          <p>When All In One makes records available, they will appear here for secure viewing and download.</p>
        </div>
      ) : (
        <ul className="aio-vault-grid">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Link to={aioPaths.portalVaultDocument(doc.id)} className="aio-vault-card">
                <span className="aio-vault-card__cat">{labelForCategory(doc.category)}</span>
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
