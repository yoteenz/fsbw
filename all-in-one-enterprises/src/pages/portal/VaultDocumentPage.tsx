import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getVaultDocument } from '../../demo/vaultActions';
import { getOrganizationId } from '../../demo/vaultActions';
import { VAULT_CATEGORIES, REJECTION_REASONS } from '../../vault/vaultConfig';
import { canPreviewDocument } from '../../vault/vaultStorage';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { VaultUpload } from '../../components/VaultUpload';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { aioPaths } from '../../utils/paths';

export function VaultDocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const doc = documentId ? getVaultDocument(documentId) : undefined;

  if (!doc || doc.organizationId !== orgId) {
    return (
      <div className="aio-vault">
        <p>Document not found.</p>
        <Link to={aioPaths.portalVault}>← Vault</Link>
      </div>
    );
  }

  const superseded = doc.supersedesDocumentId ? store.documents.find((d) => d.id === doc.supersedesDocumentId) : undefined;
  const rejectionLabel = REJECTION_REASONS.find((r) => r.id === doc.rejectionReason)?.customerMessage;

  return (
    <div className="aio-vault aio-vault-detail">
      <Link to={aioPaths.portalVault} className="aio-rr-link">← Vault</Link>
      <header>
        <p className="aio-label">{VAULT_CATEGORIES.find((c) => c.id === doc.category)?.label}</p>
        <h1>{doc.title}</h1>
        <div className="aio-vault-detail__badges">
          <RoadReadyStatusBadge kind="status" value={doc.status === 'verified' ? 'completed' : doc.status === 'requested' ? 'action_needed' : 'in_progress'} />
          <RoadReadyStatusBadge kind="verification" value={doc.verificationStatus} />
        </div>
      </header>

      <dl className="aio-rr-detail-dl">
        <div><dt>Type</dt><dd>{doc.documentType}</dd></div>
        <div><dt>Uploaded</dt><dd>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '—'}</dd></div>
        <div><dt>Verified</dt><dd>{doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleString() : 'Pending review'}</dd></div>
        <div><dt>Expiration</dt><dd>{doc.expiresAt ? `${doc.expiresAt.slice(0, 10)} · ${formatDaysRemaining(doc.expiresAt.slice(0, 10))}` : 'Not provided'}</dd></div>
        {doc.serviceRequestId && (
          <div><dt>Related Request</dt><dd><Link to={aioPaths.portalRequest(doc.serviceRequestId)}>View request</Link></dd></div>
        )}
      </dl>

      {doc.rejectionReason && (
        <section className="aio-vault-rejection" role="alert">
          <h2>Replacement needed</h2>
          <p>{rejectionLabel ?? doc.rejectionMessage}</p>
        </section>
      )}

      {canPreviewDocument(doc.mimeType) && doc.storageReference && (
        <section className="aio-vault-preview">
          <h2>Preview</h2>
          {doc.mimeType?.startsWith('image/') ? (
            <img src={doc.storageReference} alt="" className="aio-vault-preview__img" />
          ) : (
            <a href={doc.storageReference} target="_blank" rel="noopener noreferrer" className="aio-btn aio-btn--outline">View PDF</a>
          )}
        </section>
      )}

      {(doc.status === 'rejected' || doc.status === 'expired') && (
        <section>
          <h2>Replace Document</h2>
          <VaultUpload
            defaultCategory={doc.category}
            serviceRequestId={doc.serviceRequestId}
            roadReadyItemId={doc.roadReadyItemId}
            relatedEntityType={doc.relatedEntityType}
            relatedEntityId={doc.relatedEntityId}
            onUploaded={() => navigate(aioPaths.portalVault)}
          />
        </section>
      )}

      {superseded && (
        <p className="aio-prototype-note">Supersedes: {superseded.title} (archived)</p>
      )}

      <div className="aio-vault-detail__actions">
        {doc.expiresAt && (
          <Link to={aioPaths.portalRenewals} className="aio-btn aio-btn--gold aio-btn--sm">Review Renewal</Link>
        )}
        <Link to={aioPaths.contact} className="aio-btn aio-btn--outline aio-btn--sm">Request Help</Link>
      </div>
    </div>
  );
}
