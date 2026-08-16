import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { resolveOrganizationId } from '../../portal/organizationContext';
import {
  createSignedDownloadGrant,
  getAuthorizedDocument,
  revokeSession,
  submitPrivacyRequest,
  validateSignedDownload,
} from '../../demo/securityActions';
import '../../styles/aio-security.css';

export function PortalSecuritySettingsPage() {
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store);
  const sessions = (store.securitySessions ?? []).filter((s) => s.principalType === 'customer' && s.principalId === orgId);

  return (
    <div className="aio-portal-page aio-sec-portal">
      <header>
        <h1>Security</h1>
        <p>Manage sessions and sign-in safety for your organization.</p>
        <Link to={aioPaths.portalSettings}>← Settings</Link>
      </header>

      <section className="aio-sec-card">
        <h2>Active Sessions</h2>
        <ul className="aio-sec-sessions">
          {sessions.map((s) => (
            <li key={s.id}>
              <strong>{s.deviceLabel ?? 'Device'}</strong>
              <span>{s.userAgentApprox}</span>
              <span>Last active {new Date(s.lastActiveAt).toLocaleString()}</span>
              {s.isCurrent && <span className="aio-sec-pill aio-sec-pill--ok">Current session</span>}
              {!s.revokedAt && !s.isCurrent && (
                <button type="button" className="aio-btn aio-btn--sm" onClick={() => revokeSession(s.id, orgId)}>Revoke</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="aio-sec-card">
        <h2>Login history</h2>
        <p className="aio-sec-note">Foundation for future login history — approximate device only, no precise geolocation.</p>
      </section>
    </div>
  );
}

export function PortalPrivacySettingsPage() {
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store);
  const client = store.clients.find((c) => c.id === orgId);
  const requests = (store.privacyRequests ?? []).filter((r) => r.organizationId === orgId);

  return (
    <div className="aio-portal-page aio-sec-portal">
      <header>
        <h1>Privacy</h1>
        <p>Communication preferences, data requests, and connection visibility.</p>
        <Link to={aioPaths.portalSettings}>← Settings</Link>
      </header>

      <section className="aio-sec-card">
        <h2>Your requests</h2>
        {requests.length === 0 ? <p>No privacy requests yet.</p> : (
          <ul>
            {requests.map((r) => (
              <li key={r.id}>{r.requestType} — {r.status.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="aio-btn aio-btn--gold aio-btn--sm"
          onClick={() => submitPrivacyRequest(orgId, client?.contactName ?? 'Customer', 'ACCESS')}
        >
          Submit privacy request
        </button>
        <p className="aio-sec-note">Requests may require identity verification. No automatic full deletion.</p>
      </section>

      <section className="aio-sec-card">
        <h2>Connections</h2>
        <Link to={aioPaths.portalConnections}>Manage integration connections →</Link>
      </section>
    </div>
  );
}

/** Demo helper — signed download flow for QA journey 4 */
export function usePortalDocumentDownload(docId: string) {
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store);
  const { document, decision } = getAuthorizedDocument(docId, true, store);

  const issueDownload = () => {
    if (!document || decision.allowed !== true) return null;
    return createSignedDownloadGrant(docId, orgId);
  };

  const validateToken = (token: string) => validateSignedDownload(token, docId, orgId, store);

  return { document, allowed: decision.allowed, issueDownload, validateToken };
}
