import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getCustomerConsents, revokeIntegrationConsent } from '../../demo/integrationActions';
import { getProviderById } from '../../integrations/integrationRegistry';
import { aioPaths } from '../../utils/paths';
import '../../styles/aio-integrations.css';

export function PortalConnectionsPage() {
  const store = useDemoStore();
  const orgId = store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
  const consents = getCustomerConsents(orgId);

  return (
    <div className="aio-portal-page">
      <Link to={aioPaths.portalSettings} className="aio-portal-back">← Settings</Link>
      <h1>Connected Services</h1>
      <p>Connections you authorize. Disconnecting stops future access but keeps required history.</p>

      {consents.length === 0 ? (
        <p>No customer-authorizable connections configured for your organization.</p>
      ) : (
        <ul className="aio-int-load-list">
          {consents.map((c) => {
            const provider = getProviderById(c.providerId);
            const disconnected = Boolean(c.revokedAt);
            return (
              <li key={c.id} className="aio-office-panel">
                <strong>{provider?.name ?? c.providerId}</strong>
                <p>{c.purpose}</p>
                <p>Scope: {c.scope.join(', ')}</p>
                <p>Connected: {new Date(c.grantedAt).toLocaleDateString()}</p>
                <p>Status: {disconnected ? 'Disconnected' : 'Active'}</p>
                {!disconnected && (
                  <button
                    type="button"
                    className="aio-btn aio-btn--outline-dark aio-btn--sm"
                    onClick={() => revokeIntegrationConsent(c.id)}
                  >
                    Revoke Connection
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="aio-prototype-note">
        Disconnecting does not delete historical transactions, audit records, or legally required records.
      </p>
    </div>
  );
}
