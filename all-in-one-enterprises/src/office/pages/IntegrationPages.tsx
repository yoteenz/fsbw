import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { hasIntegrationPermission } from '../../integrations/integrationPermissions';
import {
  getIntegrationConnections,
  getIntegrationHealthSummary,
  testIntegrationConnection,
  resolveReconciliationIssue,
  searchLoadBoard,
  importLoadBoardCandidate,
} from '../../demo/integrationActions';
import { INTEGRATION_CATEGORIES, getProviderById } from '../../integrations/integrationRegistry';
import { evaluateConnectionHealth } from '../../integrations/integrationHealth';
import type { IntegrationConnection, IntegrationEnvironment } from '../../integrations/integrationTypes';
import { FREIGHT_SOURCE_IMPORT_DISCLOSURE } from '../../freight/freightArchitecture';
import '../../styles/aio-integrations.css';

function IntegrationGate({ children, perm = 'integrations.read' as const }: { children: React.ReactNode; perm?: Parameters<typeof hasIntegrationPermission>[1] }) {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasIntegrationPermission(ctx.permissions, perm)) {
    return (
      <div className="aio-office-page">
        <p>You do not have permission to view integrations.</p>
      </div>
    );
  }
  return <>{children}</>;
}

function EnvBadge({ env }: { env: IntegrationEnvironment }) {
  return <span className={`aio-int-env aio-int-env--${env.toLowerCase()}`}>{env}</span>;
}

function HealthBadge({ health }: { health: string }) {
  return <span className={`aio-int-health aio-int-health--${health.toLowerCase().replace('_', '-')}`}>{health.replace('_', ' ')}</span>;
}

function SourceBadge({ source }: { source: string }) {
  return <span className="aio-int-source">{source.replace(/_/g, ' ')}</span>;
}

function ConnectionCard({ connection }: { connection: IntegrationConnection }) {
  const provider = getProviderById(connection.providerId);
  return (
    <Link to={aioPaths.officeIntegrationConnection(connection.id)} className="aio-int-card">
      <div className="aio-int-card__header">
        <strong>{connection.name}</strong>
        <EnvBadge env={connection.environment} />
      </div>
      <p className="aio-int-card__meta">{provider?.name ?? connection.providerId} · {provider?.category.replace(/_/g, ' ')}</p>
      <div className="aio-int-card__status">
        <span>{connection.status.replace(/_/g, ' ')}</span>
        <HealthBadge health={connection.health} />
      </div>
      {connection.lastSuccessfulOperationAt && (
        <p className="aio-int-card__foot">Last success: {new Date(connection.lastSuccessfulOperationAt).toLocaleString()}</p>
      )}
    </Link>
  );
}

export function IntegrationOperationsCenterPage() {
  const store = useDemoStore();
  const connections = getIntegrationConnections(store);
  const health = getIntegrationHealthSummary(store);
  const recentOps = (store.integrationOperations ?? []).slice(-8).reverse();
  const failedOps = (store.integrationOperations ?? []).filter((o) => o.status === 'FAILED').slice(-5);
  const webhooks = (store.integrationWebhookEvents ?? []).slice(-5).reverse();
  const authRequired = connections.filter((c) =>
    c.status === 'AUTHORIZATION_REQUIRED' || c.status === 'REAUTHORIZATION_REQUIRED',
  );

  return (
    <IntegrationGate>
      <div className="aio-office-page aio-int-page">
        <header className="aio-int-hero">
          <h1>Integration Operations</h1>
          <p>Health, activity, webhooks, and reconciliation for external providers.</p>
          <div className="aio-int-hero__links">
            <Link to={aioPaths.officeIntegrationsSettings}>Settings</Link>
            <Link to={aioPaths.officeIntegrationsReconciliation}>Reconciliation</Link>
          </div>
        </header>

        <section className="aio-int-stats">
          <div><strong>{health.healthy}</strong> Healthy</div>
          <div><strong>{health.degraded}</strong> Degraded</div>
          <div><strong>{health.actionRequired}</strong> Need Attention</div>
          <div><strong>{health.offline}</strong> Offline</div>
        </section>

        {authRequired.length > 0 && (
          <section className="aio-office-panel aio-int-alert">
            <h2>Authorization Required</h2>
            <ul>{authRequired.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
          </section>
        )}

        <section className="aio-office-panel">
          <h2>Recent Activity</h2>
          {recentOps.length === 0 ? <p>No operations yet.</p> : (
            <ul className="aio-int-list">
              {recentOps.map((o) => (
                <li key={o.id}>
                  <span>{o.operationType}</span>
                  <span>{o.status}</span>
                  <span>{new Date(o.startedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="aio-office-panel">
          <h2>Failed Operations</h2>
          {failedOps.length === 0 ? <p>No recent failures.</p> : (
            <ul className="aio-int-list">
              {failedOps.map((o) => (
                <li key={o.id}>
                  <span>{o.operationType}</span>
                  <span>{o.safeError ?? 'Failed'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="aio-office-panel">
          <h2>Webhooks</h2>
          <ul className="aio-int-list">
            {webhooks.map((w) => (
              <li key={w.id}>
                <span>{w.eventType}</span>
                <span>{w.status}</span>
                <span>{new Date(w.receivedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </IntegrationGate>
  );
}

export function IntegrationSettingsPage() {
  const store = useDemoStore();
  const connections = getIntegrationConnections(store);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const sections = useMemo(() => ({
    connected: connections.filter((c) => c.status === 'CONNECTED'),
    attention: connections.filter((c) => ['DEGRADED', 'ERROR', 'AUTHORIZATION_REQUIRED', 'REAUTHORIZATION_REQUIRED'].includes(c.status)),
    disabled: connections.filter((c) => c.status === 'DISABLED'),
    demo: connections.filter((c) => c.environment === 'DEMO' || c.environment === 'SANDBOX'),
    available: (store.integrationProviders ?? []).filter((p) => !connections.some((c) => c.providerId === p.id && c.status === 'CONNECTED')),
  }), [connections, store.integrationProviders]);

  const onTest = (id: string) => {
    const r = testIntegrationConnection(id, store.officeStaffId);
    setTestMsg(r.message ?? r.result);
  };

  return (
    <IntegrationGate perm="integrations.manage">
      <div className="aio-office-page aio-int-page">
        <header className="aio-int-hero">
          <h1>Integrations Center</h1>
          <p>Configure provider connections — credentials stay server-side.</p>
          <Link to={aioPaths.officeIntegrationsProviders}>Provider Directory →</Link>
        </header>

        {testMsg && <p className="aio-int-test-result">{testMsg}</p>}

        <section className="aio-office-panel">
          <h2>Connected</h2>
          <div className="aio-int-grid">{sections.connected.map((c) => <ConnectionCard key={c.id} connection={c} />)}</div>
        </section>

        {sections.attention.length > 0 && (
          <section className="aio-office-panel">
            <h2>Needs Attention</h2>
            <div className="aio-int-grid">{sections.attention.map((c) => <ConnectionCard key={c.id} connection={c} />)}</div>
          </section>
        )}

        <section className="aio-office-panel">
          <h2>Demo / Sandbox</h2>
          <div className="aio-int-grid">{sections.demo.map((c) => <ConnectionCard key={c.id} connection={c} />)}</div>
        </section>

        <section className="aio-office-panel">
          <h2>Available Providers</h2>
          <ul className="aio-int-provider-list">
            {sections.available.slice(0, 8).map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span>{p.requirementState.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Quick Test</h2>
          <div className="aio-int-test-row">
            {sections.connected.slice(0, 3).map((c) => (
              <button key={c.id} type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => onTest(c.id)}>
                Test {c.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </IntegrationGate>
  );
}

export function IntegrationConnectionDetailPage() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const store = useDemoStore();
  const connection = store.integrationConnections?.find((c) => c.id === connectionId);
  const provider = connection ? getProviderById(connection.providerId) : undefined;
  const cred = store.integrationCredentialRefs?.find((c) => c.id === connection?.credentialReferenceId);
  const ops = (store.integrationOperations ?? []).filter((o) => o.connectionId === connectionId).slice(-10).reverse();
  const webhooks = (store.integrationWebhookEvents ?? []).filter((w) => w.connectionId === connectionId).slice(-5);
  const audits = (store.integrationAuditEvents ?? []).filter((a) => a.connectionId === connectionId).slice(-5);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!connection) {
    return <p className="aio-office-page">Connection not found.</p>;
  }

  const health = evaluateConnectionHealth(connection, store.integrationOperations ?? [], store.integrationWebhookEvents ?? []);

  return (
    <IntegrationGate>
      <div className="aio-office-page aio-int-page">
        <Link to={aioPaths.officeIntegrationsSettings} className="aio-office-link">← Integrations</Link>
        <header className="aio-int-hero">
          <h1>{connection.name}</h1>
          <div className="aio-int-card__header">
            <EnvBadge env={connection.environment} />
            <HealthBadge health={health} />
          </div>
          <p>{provider?.description}</p>
        </header>

        <section className="aio-office-panel">
          <h2>Connection</h2>
          <dl className="aio-int-dl">
            <dt>Provider</dt><dd>{provider?.name}</dd>
            <dt>Status</dt><dd>{connection.status.replace(/_/g, ' ')}</dd>
            <dt>Capabilities</dt><dd>{connection.enabledCapabilities.join(', ')}</dd>
            <dt>Credential</dt><dd>{cred ? `${cred.status} · ${cred.maskedHint ?? 'configured'}` : 'Not configured'}</dd>
            <dt>Webhook</dt><dd>{connection.webhookEnabled ? 'Enabled' : 'Off'}</dd>
            <dt>Last verified</dt><dd>{connection.lastVerifiedAt ? new Date(connection.lastVerifiedAt).toLocaleString() : '—'}</dd>
          </dl>
          <button
            type="button"
            className="aio-btn aio-btn--gold"
            onClick={() => {
              const r = testIntegrationConnection(connection.id, store.officeStaffId);
              setTestResult(r.message ?? r.result);
            }}
          >
            Test Connection
          </button>
          {testResult && <p className="aio-int-test-result">{testResult}</p>}
        </section>

        <section className="aio-office-panel">
          <h2>Recent Operations</h2>
          <ul className="aio-int-list">
            {ops.map((o) => (
              <li key={o.id}>{o.operationType} · {o.status} · {o.safeError ?? o.resultSummary ?? '—'}</li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Webhooks</h2>
          <ul className="aio-int-list">
            {webhooks.map((w) => (
              <li key={w.id}>{w.eventType} · {w.status}</li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Audit</h2>
          <ul className="aio-int-list">
            {audits.map((a) => (
              <li key={a.id}>{a.action} · {a.safeDetail ?? '—'}</li>
            ))}
          </ul>
        </section>
      </div>
    </IntegrationGate>
  );
}

export function IntegrationProvidersPage() {
  const store = useDemoStore();
  const providers = store.integrationProviders ?? [];

  return (
    <IntegrationGate>
      <div className="aio-office-page aio-int-page">
        <Link to={aioPaths.officeIntegrationsSettings} className="aio-office-link">← Integrations</Link>
        <h1>Provider Directory</h1>
        <p>Future provider categories — unverified companies are not shown as official partners.</p>
        {INTEGRATION_CATEGORIES.map((cat) => {
          const items = providers.filter((p) => p.category === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id} className="aio-office-panel">
              <h2>{cat.label}</h2>
              <ul className="aio-int-provider-list">
                {items.map((p) => (
                  <li key={p.id}>
                    <strong>{p.name}</strong>
                    <span>{p.requirementState.replace(/_/g, ' ')}</span>
                    <span>{p.supportedCapabilities.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </IntegrationGate>
  );
}

export function IntegrationReconciliationPage() {
  const store = useDemoStore();
  const issues = store.integrationReconciliationIssues ?? [];
  const [note, setNote] = useState('');

  return (
    <IntegrationGate perm="integrations.reconciliation.read">
      <div className="aio-office-page aio-int-page">
        <Link to={aioPaths.officeIntegrations} className="aio-office-link">← Operations</Link>
        <h1>Reconciliation Center</h1>
        <p>Financial and status mismatches require human review — never auto-resolved.</p>
        {issues.length === 0 ? <p>No open issues.</p> : (
          <ul className="aio-int-recon-list">
            {issues.map((issue) => {
              const provider = getProviderById(issue.providerId);
              return (
                <li key={issue.id} className="aio-office-panel">
                  <div className="aio-int-recon-head">
                    <strong>{issue.issueType.replace(/_/g, ' ')}</strong>
                    <span>{issue.severity}</span>
                    <span>{issue.status}</span>
                  </div>
                  <p>{provider?.name} · {issue.entityType} {issue.entityId}</p>
                  <p>Expected: {issue.expectedValue} · External: {issue.externalValue}</p>
                  {issue.status === 'open' && hasIntegrationPermission(resolveOfficeStaffContext(store).permissions, 'integrations.reconciliation.resolve') && (
                    <div className="aio-int-recon-resolve">
                      <input className="aio-intake-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Resolution note" />
                      <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => resolveReconciliationIssue(issue.id, note || 'Resolved')}>
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </IntegrationGate>
  );
}

export function IntegrationLoadBoardPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const candidates = store.loadBoardCandidates ?? [];

  if (!hasIntegrationPermission(ctx.permissions, 'integrations.loadboard.search')) {
    return <p className="aio-office-page">Load board search not permitted.</p>;
  }

  return (
    <IntegrationGate perm="integrations.loadboard.search">
      <div className="aio-office-page aio-int-page">
        <h1>Authorized Freight Source Import (Demo)</h1>
        <p>{FREIGHT_SOURCE_IMPORT_DISCLOSURE}</p>
        <p className="aio-prototype-note">External candidates normalize into AIO-owned loads after staff review — not third-party broker storefronts.</p>
        <div className="aio-int-search-row">
          <input className="aio-intake-input" placeholder="Origin" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          <input className="aio-intake-input" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => void searchLoadBoard(origin, destination)}>Search</button>
        </div>
        <ul className="aio-int-load-list">
          {candidates.slice().reverse().map((c) => (
            <li key={c.id} className="aio-office-panel">
              <strong>DEMO LOAD · {c.externalLoadId}</strong>
              <p>{c.origin} → {c.destination}</p>
              <p>{c.equipment} · {c.commodity} · {c.miles} mi</p>
              {c.importedLoadId ? (
                <span>Imported · <Link to={aioPaths.officeDispatchLoad(c.importedLoadId)}>View load</Link></span>
              ) : (
                <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => importLoadBoardCandidate(c.id, store.officeStaffId)}>
                  Import to Dispatch
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </IntegrationGate>
  );
}

export { EnvBadge, HealthBadge, SourceBadge };
