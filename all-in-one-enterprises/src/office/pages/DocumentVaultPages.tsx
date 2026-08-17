import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { documentRepository } from '../../repositories/documentRepository';
import { computeDocumentVaultMetrics, computeMigrationDashboardMetrics } from '../../vault/documentVaultMetrics';
import { categoriesForTaxonomyGroup, type VaultTaxonomyGroup } from '../../vault/vaultTaxonomy';
import { VAULT_CATEGORY_OPTIONS, DOCUMENT_TYPES } from '../../vault/vaultConfig';
import { DocumentVaultMetricsBar } from '../../components/vault/DocumentVaultMetricsBar';
import { DocumentCategoryNav } from '../../components/vault/DocumentCategoryNav';
import { DocumentRecordList } from '../../components/vault/DocumentRecordList';
import { DocumentRecordDetailPanel } from '../../components/vault/DocumentRecordDetailPanel';
import { SecureDocumentUploader } from '../../components/vault/SecureDocumentUploader';
import {
  addFilesToMigrationBatch,
  approveMigrationBatch,
  createMigrationBatch,
  getArchiveMigrationBatch,
  getBatchFiles,
  getPendingMigrationDocuments,
  reviewMigrationDocument,
  searchClientsForMigration,
} from '../../demo/archiveMigrationActions';
import { CLIENT_MIGRATION_STATUS_LABELS, MIGRATION_BATCH_STATE_LABELS } from '../../vault/archiveMigrationTypes';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { aioPaths } from '../../utils/paths';
import type { RejectionReason, VaultDocument } from '../../vault/vaultTypes';

export function OfficeDocumentVaultPage() {
  const store = useDemoStore();
  const { clientId } = useParams<{ clientId?: string }>();
  const [query, setQuery] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<VaultTaxonomyGroup | 'all'>('all');

  const orgId = clientId ?? undefined;
  const client = clientId ? store.clients.find((c) => c.id === clientId) : undefined;

  const docs = useMemo(() => {
    let list = documentRepository.searchOffice(orgId, query, undefined, store);
    if (categoryGroup !== 'all') {
      const cats = categoriesForTaxonomyGroup(categoryGroup);
      list = list.filter((d) => cats.includes(d.category));
    }
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [orgId, query, categoryGroup, store]);

  const metrics = useMemo(() => computeDocumentVaultMetrics(docs), [docs]);

  return (
    <div className="aio-office-page aio-doc-vault-page">
      <header className="aio-doc-vault-header">
        <div>
          {client && <Link to={aioPaths.officeClient(client.id)} className="aio-office-link">← {client.companyName}</Link>}
          <h1>Document Vault</h1>
          <p>Your business records, filings, permits, and historical documents in one secure place.</p>
        </div>
        <Link to={aioPaths.officeArchiveMigrationDigitize} className="aio-btn aio-btn--gold">
          Digitize Physical File →
        </Link>
      </header>

      <DocumentVaultMetricsBar metrics={metrics} />

      <div className="aio-doc-vault-toolbar">
        <input
          className="aio-intake-input"
          placeholder="Search POA, IFTA, authority, dates…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search documents"
        />
      </div>

      <DocumentCategoryNav active={categoryGroup} onChange={setCategoryGroup} />

      <DocumentRecordList
        documents={docs}
        detailHref={(id) => aioPaths.officeVaultDocument(id)}
        showInternalFields
      />
    </div>
  );
}

export function ArchiveMigrationDashboardPage() {
  const store = useDemoStore();
  const metrics = useMemo(
    () =>
      computeMigrationDashboardMetrics({
        clients: store.clients,
        documents: store.documents,
        batches: store.archiveMigrationBatches ?? [],
      }),
    [store],
  );

  const batches = store.archiveMigrationBatches ?? [];

  return (
    <div className="aio-office-page aio-doc-vault-page">
      <header className="aio-doc-vault-header">
        <div>
          <h1>Physical Archive Migration</h1>
          <p>Convert historical paper client files into structured, searchable digital records.</p>
        </div>
        <Link to={aioPaths.officeArchiveMigrationDigitize} className="aio-btn aio-btn--gold">
          Digitize Physical File →
        </Link>
      </header>

      {metrics.totalClients === 0 ? (
        <div className="aio-doc-vault-empty">
          <h2>Ready to digitize your physical archive</h2>
          <p>Select a client to begin converting historical paper records into organized digital records.</p>
        </div>
      ) : (
        <>
          <div className="aio-doc-vault-metrics aio-doc-vault-metrics--migration">
            <div className="aio-doc-vault-metrics__item">
              <span className="aio-doc-vault-metrics__value">{metrics.clientsDigitized} / {metrics.totalClients}</span>
              <span className="aio-doc-vault-metrics__label">Clients Digitized</span>
            </div>
            <div className="aio-doc-vault-metrics__item">
              <span className="aio-doc-vault-metrics__value">{metrics.documentsPreserved}</span>
              <span className="aio-doc-vault-metrics__label">Documents Preserved</span>
            </div>
            <div className="aio-doc-vault-metrics__item">
              <span className="aio-doc-vault-metrics__value">{metrics.needsReview}</span>
              <span className="aio-doc-vault-metrics__label">Needs Review</span>
            </div>
            <div className="aio-doc-vault-metrics__item">
              <span className="aio-doc-vault-metrics__value">{metrics.possibleDuplicates}</span>
              <span className="aio-doc-vault-metrics__label">Possible Duplicates</span>
            </div>
            <div className="aio-doc-vault-metrics__item">
              <span className="aio-doc-vault-metrics__value">{metrics.percentComplete}%</span>
              <span className="aio-doc-vault-metrics__label">Archive Complete</span>
            </div>
          </div>

          <section className="aio-oc-panel">
            <h2 className="aio-oc-panel__title">Client Migration Status</h2>
            <ul className="aio-doc-vault-list">
              {store.clients.map((c) => (
                <li key={c.id} className="aio-doc-vault-record">
                  <div>
                    <strong>{c.companyName}</strong>
                    <p className="aio-doc-vault-record__meta">
                      {CLIENT_MIGRATION_STATUS_LABELS[c.archiveMigrationStatus ?? 'not_started']}
                    </p>
                  </div>
                  <Link to={aioPaths.officeClientDocuments(c.id)} className="aio-btn aio-btn--sm aio-btn--outline-dark">
                    Document Vault
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="aio-oc-panel">
            <h2 className="aio-oc-panel__title">Migration Batches</h2>
            {batches.length === 0 ? (
              <p className="aio-empty-state__text">No migration batches yet.</p>
            ) : (
              <ul className="aio-doc-vault-list">
                {batches.map((b) => {
                  const client = store.clients.find((c) => c.id === b.clientId);
                  return (
                    <li key={b.id} className="aio-doc-vault-record">
                      <div>
                        <strong>{client?.companyName ?? b.clientId}</strong>
                        <p className="aio-doc-vault-record__meta">
                          {MIGRATION_BATCH_STATE_LABELS[b.state]} · {b.fileCount} files · {new Date(b.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={aioPaths.officeArchiveMigrationBatch(b.id)} className="aio-btn aio-btn--sm aio-btn--gold">
                        Review Batch
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export function ArchiveMigrationDigitizePage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [step, setStep] = useState<'search' | 'confirm' | 'upload'>('search');
  const [query, setQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const results = useMemo(() => searchClientsForMigration(query, store), [query, store]);
  const selected = selectedClientId ? store.clients.find((c) => c.id === selectedClientId) : undefined;

  function confirmClient() {
    if (!selectedClientId) return;
    const batch = createMigrationBatch(selectedClientId, ctx.staffId);
    setBatchId(batch.id);
    setStep('upload');
  }

  return (
    <div className="aio-office-page aio-doc-vault-page">
      <header className="aio-doc-vault-header">
        <Link to={aioPaths.officeArchiveMigration} className="aio-office-link">← Archive Migration</Link>
        <h1>Digitize Physical File</h1>
        <p>Match a physical client folder, upload scanned records, and classify before they enter the permanent vault.</p>
      </header>

      {step === 'search' && (
        <>
          <label className="aio-doc-vault-label" htmlFor="client-search">Select Client</label>
          <input
            id="client-search"
            className="aio-intake-input"
            placeholder="Client name, business, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="aio-doc-vault-list">
            {results.map((c) => (
              <li key={c.id} className="aio-doc-vault-record">
                <button type="button" className="aio-doc-vault-client-pick" onClick={() => { setSelectedClientId(c.id); setStep('confirm'); }}>
                  <strong>{c.companyName}</strong>
                  <span>{c.contactEmail} · Customer since {c.customerSince}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {step === 'confirm' && selected && (
        <section className="aio-doc-vault-confirm">
          <h2>Digitizing file for</h2>
          <p className="aio-doc-vault-confirm__name">{selected.companyName}</p>
          <p>Customer since {selected.customerSince}</p>
          <p>{selected.contactEmail}</p>
          <div className="aio-doc-vault-confirm__actions">
            <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => setStep('search')}>Change Client</button>
            <button type="button" className="aio-btn aio-btn--gold" onClick={confirmClient}>Confirm Client</button>
          </div>
        </section>
      )}

      {step === 'upload' && batchId && selected && (
        <section>
          <h2>Upload batch for {selected.companyName}</h2>
          <SecureDocumentUploader
            label="Drop scanned pages or PDFs for this physical file"
            onFilesSelected={async (files) => {
              const result = await addFilesToMigrationBatch(batchId, files);
              const parts = [`${result.added} file(s) added.`];
              if (result.duplicates.length) parts.push(`Duplicates flagged: ${result.duplicates.join('; ')}`);
              if (result.errors.length) parts.push(result.errors.join(' '));
              setUploadMessage(parts.join(' '));
            }}
          />
          {uploadMessage && <p className="aio-prototype-note">{uploadMessage}</p>}
          <Link to={aioPaths.officeArchiveMigrationBatch(batchId)} className="aio-btn aio-btn--gold">
            Continue to Review →
          </Link>
        </section>
      )}
    </div>
  );
}

export function ArchiveMigrationBatchReviewPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const batch = batchId ? getArchiveMigrationBatch(batchId, store) : undefined;
  const client = batch ? store.clients.find((c) => c.id === batch.clientId) : undefined;
  const pendingDocs = batch ? getPendingMigrationDocuments(batch.clientId, store) : [];
  const [reviewDocId, setReviewDocId] = useState<string | null>(null);

  const reviewDoc = reviewDocId ? store.documents.find((d) => d.id === reviewDocId) : undefined;
  const [form, setForm] = useState({
    title: '',
    category: 'legacy' as VaultDocument['category'],
    documentType: 'Legacy Scan',
    visibility: 'internal' as VaultDocument['visibility'],
    physicalOriginalStatus: 'physical_retained' as VaultDocument['physicalOriginalStatus'],
    physicalArchiveLocation: '',
    expiresAt: '',
  });

  if (!batch || !batchId) return <p>Batch not found.</p>;

  function openReview(doc: VaultDocument) {
    setReviewDocId(doc.id);
    setForm({
      title: doc.title,
      category: doc.category,
      documentType: doc.documentType,
      visibility: doc.visibility,
      physicalOriginalStatus: doc.physicalOriginalStatus ?? 'physical_retained',
      physicalArchiveLocation: doc.physicalArchiveLocation ?? '',
      expiresAt: doc.expiresAt?.slice(0, 10) ?? '',
    });
  }

  function saveReview() {
    if (!reviewDocId) return;
    reviewMigrationDocument(
      {
        documentId: reviewDocId,
        title: form.title,
        category: form.category,
        documentType: form.documentType,
        visibility: form.visibility,
        physicalOriginalStatus: form.physicalOriginalStatus,
        physicalArchiveLocation: form.physicalArchiveLocation || undefined,
        expiresAt: form.expiresAt || undefined,
        recordLifecycle: 'current',
      },
      ctx.staffId,
    );
    setReviewDocId(null);
  }

  return (
    <div className="aio-office-page aio-doc-vault-page">
      <header className="aio-doc-vault-header">
        <Link to={aioPaths.officeArchiveMigration} className="aio-office-link">← Archive Migration</Link>
        <h1>Document Review — {client?.companyName}</h1>
        <p>{MIGRATION_BATCH_STATE_LABELS[batch.state]} · {getBatchFiles(batchId, store).length} files</p>
      </header>

      <DocumentRecordList
        documents={pendingDocs.length ? pendingDocs : store.documents.filter((d) => d.batchId === batchId)}
        detailHref={(id) => aioPaths.officeVaultDocument(id)}
        showInternalFields
        onReview={(id) => {
          const doc = store.documents.find((d) => d.id === id);
          if (doc) openReview(doc);
        }}
      />

      {reviewDoc && (
        <section className="aio-doc-vault-review-panel" aria-label="Classification review">
          <h2>Classify Document</h2>
          <label className="aio-doc-vault-label">Title<input className="aio-intake-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label className="aio-doc-vault-label">Category
            <select className="aio-intake-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as VaultDocument['category'], documentType: DOCUMENT_TYPES[e.target.value as VaultDocument['category']][0] })}>
              {VAULT_CATEGORY_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="aio-doc-vault-label">Type
            <select className="aio-intake-input" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
              {DOCUMENT_TYPES[form.category].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="aio-doc-vault-label">Expiration<input type="date" className="aio-intake-input" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></label>
          <label className="aio-doc-vault-label">Physical archive location<input className="aio-intake-input" placeholder="Cabinet B · Drawer 3 · Folder 18" value={form.physicalArchiveLocation} onChange={(e) => setForm({ ...form, physicalArchiveLocation: e.target.value })} /></label>
          <label className="aio-doc-vault-label">Client visibility
            <select className="aio-intake-input" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as VaultDocument['visibility'] })}>
              <option value="internal">Internal only</option>
              <option value="customer">Client visible</option>
            </select>
          </label>
          <div className="aio-doc-vault-confirm__actions">
            <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => setReviewDocId(null)}>Cancel</button>
            <button type="button" className="aio-btn aio-btn--gold" onClick={saveReview}>Save Classification</button>
          </div>
        </section>
      )}

      <button type="button" className="aio-btn aio-btn--gold" onClick={() => approveMigrationBatch(batchId, ctx.staffId)}>
        Approve Batch → Client Vault
      </button>
    </div>
  );
}

export function OfficeVaultDocumentDetailPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const doc = documentId ? documentRepository.getById(documentId, store) : undefined;
  const client = doc ? store.clients.find((c) => c.id === doc.organizationId) : undefined;
  const previous = doc?.supersedesDocumentId ? documentRepository.getById(doc.supersedesDocumentId, store) : undefined;

  if (!doc) return <p>Document not found.</p>;

  return (
    <div className="aio-office-page aio-doc-vault-page">
      <Link to={client ? aioPaths.officeClientDocuments(client.id) : aioPaths.officeDocumentVault} className="aio-office-link">← Document Vault</Link>
      <DocumentRecordDetailPanel
        doc={doc}
        clientName={client?.companyName}
        previous={previous}
        showInternalFields
        onVerify={() => documentRepository.verify(doc.id, ctx.staffId, ctx.staffName)}
        onReject={(reason: RejectionReason, message: string) => documentRepository.reject(doc.id, ctx.staffId, reason, message)}
      />
    </div>
  );
}
