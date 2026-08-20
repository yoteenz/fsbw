import { useCallback, useEffect, useState } from 'react';
import './production-governance.css';

type Dashboard = {
  operatorEmail: string;
  activeOrganization: { slug: string; name: string; organizationType: string };
  billingOwner: { billingOwnerId: string; organizationSlug: string };
  entitlements: Array<{ entitlementKey: string; source: string }>;
  budget: {
    softLimit?: number;
    hardLimit?: number;
    currency: string;
  } | null;
  usage: {
    actual: number;
    reserved: number;
    availableCapacity: number | null;
    percentUsed: number | null;
  };
  usageLedger: Array<Record<string, unknown>>;
  reservations: Array<Record<string, unknown>>;
  auditEvents: Array<Record<string, unknown>>;
};

const API = '/api/admin/studio-production-governance';

const ORG_OPTIONS = [
  { slug: 'frontal-slayer', label: 'FRONTAL SLAYER (Owner Org)' },
  { slug: 'founding-partner-agency', label: 'Founding Partner Agency' },
  { slug: 'org-c-inaccessible', label: 'Organization C (inaccessible)' },
];

export default function ProductionGovernanceDebugPage() {
  const [operatorEmail, setOperatorEmail] = useState('user-b@collaborator.test');
  const [organizationSlug, setOrganizationSlug] = useState('frontal-slayer');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}?action=dashboard&organizationSlug=${encodeURIComponent(organizationSlug)}&operatorEmail=${encodeURIComponent(operatorEmail)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setDashboard(json as Dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [organizationSlug, operatorEmail]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const postAction = async (action: string, extra: Record<string, unknown> = {}) => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          operatorEmail,
          organizationSlug,
          ...extra,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setMessage(`${action} OK`);
      await reload();
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
      return null;
    }
  };

  return (
    <div className="pg-debug">
      <header className="pg-header">
        <p className="pg-kicker">STUDIO WORLD · PRODUCTION GOVERNANCE DEBUG</p>
        <h1>Production Cost &amp; Entitlement Architecture</h1>
        <p className="pg-rule">
          THE OPERATOR IS NOT NECESSARILY THE BILLING OWNER · COMPLIMENTARY PLATFORM ≠ COMPLIMENTARY COMPUTE
        </p>
      </header>

      <section className="pg-controls">
        <label>
          Operator
          <input value={operatorEmail} onChange={(e) => setOperatorEmail(e.target.value)} />
        </label>
        <label>
          Active Organization
          <select value={organizationSlug} onChange={(e) => setOrganizationSlug(e.target.value)}>
            {ORG_OPTIONS.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => void reload()} disabled={loading}>
          Refresh
        </button>
        <button type="button" onClick={() => void postAction('seed_fixtures')}>
          Seed Test Fixtures
        </button>
      </section>

      {error && <p className="pg-error">{error}</p>}
      {message && <p className="pg-ok">{message}</p>}
      {loading && <p className="pg-loading">Loading…</p>}

      {dashboard && (
        <>
          <section className="pg-grid">
            <div className="pg-card">
              <h2>Active Context</h2>
              <dl>
                <dt>Operator</dt>
                <dd>{dashboard.operatorEmail}</dd>
                <dt>Organization</dt>
                <dd>{dashboard.activeOrganization.name}</dd>
                <dt>Billing Owner</dt>
                <dd>{dashboard.billingOwner.organizationSlug}</dd>
                <dt>Type</dt>
                <dd>{dashboard.activeOrganization.organizationType}</dd>
              </dl>
            </div>
            <div className="pg-card">
              <h2>Budget</h2>
              {dashboard.budget ? (
                <dl>
                  <dt>Hard Limit</dt>
                  <dd>
                    ${dashboard.budget.hardLimit ?? '—'} {dashboard.budget.currency}
                  </dd>
                  <dt>Soft Limit</dt>
                  <dd>${dashboard.budget.softLimit ?? '—'}</dd>
                  <dt>Actual Usage</dt>
                  <dd>${dashboard.usage.actual.toFixed(2)}</dd>
                  <dt>Reserved</dt>
                  <dd>${dashboard.usage.reserved.toFixed(2)}</dd>
                  <dt>Available</dt>
                  <dd>
                    {dashboard.usage.availableCapacity != null
                      ? `$${dashboard.usage.availableCapacity.toFixed(2)}`
                      : '—'}
                  </dd>
                  <dt>Used %</dt>
                  <dd>{dashboard.usage.percentUsed?.toFixed(1) ?? '—'}%</dd>
                </dl>
              ) : (
                <p>No active budget (owner org may have unlimited metered via policy)</p>
              )}
            </div>
            <div className="pg-card">
              <h2>Entitlements</h2>
              <ul>
                {dashboard.entitlements.map((e) => (
                  <li key={e.entitlementKey}>
                    {e.entitlementKey} <span>({e.source})</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="pg-sim">
            <h2>Simulated Operations (no paid provider calls)</h2>
            <div className="pg-sim-buttons">
              <button
                type="button"
                onClick={() =>
                  void postAction('simulate', { operationType: 'IMAGE_GENERATION', estimatedCost: 2.5 })
                }
              >
                Simulate Image ($2.50)
              </button>
              <button
                type="button"
                onClick={() =>
                  void postAction('simulate', { operationType: 'VIDEO_GENERATION', estimatedCost: 8 })
                }
              >
                Simulate Video ($8)
              </button>
              <button
                type="button"
                onClick={() =>
                  void postAction('simulate', {
                    operationType: 'IMAGE_GENERATION',
                    estimatedCost: 12,
                    idempotencyKey: `budget-block-${Date.now()}`,
                  })
                }
              >
                Simulate Budget Stress ($12)
              </button>
              <button
                type="button"
                onClick={() =>
                  void postAction('simulate', {
                    operationType: 'IMAGE_GENERATION',
                    estimatedCost: 2,
                    failProvider: true,
                  })
                }
              >
                Simulate Failed Job
              </button>
            </div>
          </section>

          <section className="pg-card">
            <h2>Usage Ledger (recent)</h2>
            <pre>{JSON.stringify(dashboard.usageLedger.slice(0, 8), null, 2)}</pre>
          </section>

          <section className="pg-card">
            <h2>Audit Events</h2>
            <pre>{JSON.stringify(dashboard.auditEvents.slice(0, 8), null, 2)}</pre>
          </section>
        </>
      )}
    </div>
  );
}
