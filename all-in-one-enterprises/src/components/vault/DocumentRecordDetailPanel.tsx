import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { VaultDocument } from '../../vault/vaultTypes';
import { labelForCategory } from '../../vault/vaultTaxonomy';
import { REJECTION_REASONS } from '../../vault/vaultConfig';
import { canPreviewDocument } from '../../vault/vaultStorage';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { aioPaths } from '../../utils/paths';
import type { RejectionReason } from '../../vault/vaultTypes';

type Props = {
  doc: VaultDocument;
  clientName?: string;
  previous?: VaultDocument;
  showInternalFields?: boolean;
  onVerify?: () => void;
  onReject?: (reason: RejectionReason, message: string) => void;
};

function formatBytes(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentRecordDetailPanel({
  doc,
  clientName,
  previous,
  showInternalFields,
  onVerify,
  onReject,
}: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReason>('other');
  const [rejectMessage, setRejectMessage] = useState('');

  const canStaffReview = onVerify && doc.verificationStatus !== 'verified';

  return (
    <>
      <header className="aio-doc-vault-detail-header">
        <p className="aio-doc-vault-detail-eyebrow">{labelForCategory(doc.category)} · {clientName ?? doc.organizationId}</p>
        <h1>{doc.title}</h1>
        <div className="aio-doc-vault-detail-badges">
          <span className={`aio-doc-vault-record__status aio-doc-vault-record__status--${doc.isCurrent ? 'current' : 'historical'}`}>
            {doc.recordLifecycle?.replace(/_/g, ' ') ?? doc.status.replace(/_/g, ' ')}
          </span>
          <span className="aio-doc-vault-detail-badge">{doc.verificationStatus.replace(/_/g, ' ')}</span>
        </div>
      </header>

      <div className="aio-doc-vault-detail-grid">
        <section className="aio-oc-panel">
          <h2>Record</h2>
          <dl className="aio-doc-vault-dl">
            <div><dt>Type</dt><dd>{doc.documentType}</dd></div>
            <div><dt>Source</dt><dd>{(doc.source ?? 'digital_upload').replace(/_/g, ' ')}</dd></div>
            <div><dt>Uploaded</dt><dd>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '—'}</dd></div>
            <div><dt>Verified</dt><dd>{doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleString() : 'Pending review'}</dd></div>
          </dl>
        </section>

        <section className="aio-oc-panel">
          <h2>Dates</h2>
          <dl className="aio-doc-vault-dl">
            <div><dt>Issued</dt><dd>{doc.issuedAt?.slice(0, 10) ?? '—'}</dd></div>
            <div><dt>Effective</dt><dd>{doc.effectiveAt?.slice(0, 10) ?? '—'}</dd></div>
            <div><dt>Expiration</dt><dd>{doc.expiresAt ? `${doc.expiresAt.slice(0, 10)} · ${formatDaysRemaining(doc.expiresAt.slice(0, 10))}` : '—'}</dd></div>
            <div><dt>Renewal</dt><dd>{doc.renewalDate?.slice(0, 10) ?? '—'}</dd></div>
          </dl>
        </section>

        <section className="aio-oc-panel">
          <h2>Access</h2>
          <dl className="aio-doc-vault-dl">
            <div><dt>Visibility</dt><dd>{doc.visibility === 'customer' ? 'Client visible' : 'Internal only'}</dd></div>
            <div><dt>Review</dt><dd>{doc.reviewStatus?.replace(/_/g, ' ') ?? '—'}</dd></div>
            {doc.jurisdiction && <div><dt>Jurisdiction</dt><dd>{doc.jurisdiction}</dd></div>}
            {doc.issuingAgency && <div><dt>Issuing agency</dt><dd>{doc.issuingAgency}</dd></div>}
          </dl>
        </section>

        {showInternalFields && (doc.physicalOriginalStatus || doc.physicalArchiveLocation) && (
          <section className="aio-oc-panel">
            <h2>Physical archive</h2>
            <dl className="aio-doc-vault-dl">
              {doc.physicalOriginalStatus && (
                <div><dt>Original</dt><dd>{doc.physicalOriginalStatus.replace(/_/g, ' ')}</dd></div>
              )}
              {doc.physicalArchiveLocation && (
                <div><dt>Location</dt><dd>{doc.physicalArchiveLocation}</dd></div>
              )}
            </dl>
          </section>
        )}

        {showInternalFields && (doc.fileHash || doc.fileName) && (
          <section className="aio-oc-panel">
            <h2>File integrity</h2>
            <dl className="aio-doc-vault-dl">
              {doc.fileName && <div><dt>Filename</dt><dd>{doc.fileName}</dd></div>}
              <div><dt>Size</dt><dd>{formatBytes(doc.fileSizeBytes)}</dd></div>
              {doc.fileHash && (
                <div><dt>SHA-256</dt><dd className="aio-doc-vault-hash">{doc.fileHash.slice(0, 16)}…</dd></div>
              )}
            </dl>
          </section>
        )}

        {(doc.serviceRequestId || doc.roadReadyItemId || doc.batchId) && (
          <section className="aio-oc-panel">
            <h2>Related</h2>
            <ul className="aio-doc-vault-related">
              {doc.serviceRequestId && (
                <li><Link to={aioPaths.officeRequest(doc.serviceRequestId)}>Service request</Link></li>
              )}
              {doc.roadReadyItemId && (
                <li><Link to={aioPaths.officeClientRoadReady(doc.organizationId)}>Road Ready item</Link></li>
              )}
              {showInternalFields && doc.batchId && (
                <li><Link to={aioPaths.officeArchiveMigrationBatch(doc.batchId)}>Migration batch</Link></li>
              )}
            </ul>
          </section>
        )}

        {previous && (
          <section className="aio-oc-panel">
            <h2>Previous version</h2>
            <Link to={aioPaths.officeVaultDocument(previous.id)}>{previous.title}</Link>
          </section>
        )}
      </div>

      {canPreviewDocument(doc.mimeType) && doc.storageReference && (
        <section className="aio-doc-vault-preview aio-oc-panel">
          <h2>Preview</h2>
          {doc.mimeType?.startsWith('image/') ? (
            <img src={doc.storageReference} alt="" className="aio-doc-vault-preview__img" />
          ) : (
            <a href={doc.storageReference} target="_blank" rel="noopener noreferrer" className="aio-btn aio-btn--outline-dark">
              Open PDF
            </a>
          )}
        </section>
      )}

      {doc.rejectionReason && (
        <section className="aio-doc-vault-rejection aio-oc-panel" role="alert">
          <h2>Rejected</h2>
          <p>{REJECTION_REASONS.find((r) => r.id === doc.rejectionReason)?.customerMessage ?? doc.rejectionMessage}</p>
        </section>
      )}

      {canStaffReview && (
        <section className="aio-doc-vault-staff-actions aio-oc-panel">
          <h2>Staff review</h2>
          <div className="aio-doc-vault-confirm__actions">
            <button type="button" className="aio-btn aio-btn--gold" onClick={onVerify}>Verify document</button>
            <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => setRejectOpen((v) => !v)}>
              Reject
            </button>
          </div>
          {rejectOpen && onReject && (
            <div className="aio-doc-vault-review-panel">
              <label className="aio-doc-vault-label">Reason
                <select className="aio-intake-input" value={rejectReason} onChange={(e) => setRejectReason(e.target.value as RejectionReason)}>
                  {REJECTION_REASONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </label>
              <label className="aio-doc-vault-label">Message
                <textarea className="aio-intake-input" rows={3} value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} />
              </label>
              <button
                type="button"
                className="aio-btn aio-btn--outline-dark"
                onClick={() => {
                  onReject(rejectReason, rejectMessage);
                  setRejectOpen(false);
                }}
              >
                Confirm rejection
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
