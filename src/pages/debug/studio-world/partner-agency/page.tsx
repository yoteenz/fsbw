import { useCallback, useEffect, useState } from 'react';
import '../production-governance/production-governance.css';

const API = '/api/admin/studio-partner-onboarding';

type OperatorContext = {
  operatorEmail: string;
  activeOrganizationSlug: string;
  activeOrganizationName: string;
  billingOwnerSlug: string;
  platformAccess: string;
  productionCompute: string;
  foundingPartner: boolean;
  capabilities: Array<{ routeKey: string; label: string; state: string }>;
  budget?: { hardLimit?: number; actual: number; reserved: number; available: number | null };
};

type DualContextResult = {
  frontalSlayer: { ok: boolean; governance?: { billingOwner?: { organizationSlug?: string } } };
  partnerAgency: { ok: boolean; governance?: { billingOwner?: { organizationSlug?: string } } };
  productPhotographyBlocked: { ok: boolean; code?: string };
  forgedBillingOwnerIgnored: { ok: boolean; governance?: { billingOwner?: { organizationSlug?: string } } };
};

export default function PartnerAgencyDebugPage() {
  const [operatorEmail, setOperatorEmail] = useState('partner-operator@pilot.test');
  const [organizationSlug, setOrganizationSlug] = useState('founding-partner-agency');
  const [context, setContext] = useState<OperatorContext | null>(null);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [dualResult, setDualResult] = useState<DualContextResult | null>(null);
  const [inviteToken, setInviteToken] = useState('');
  const [lastInviteToken, setLastInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        action: 'context',
        organizationSlug,
        operatorEmail,
      });
      const [ctxRes, orgRes] = await Promise.all([
        fetch(`${API}?${params.toString()}`),
        fetch(`${API}?action=organizations&operatorEmail=${encodeURIComponent(operatorEmail)}`),
      ]);
      const ctxJson = await ctxRes.json();
      const orgJson = await orgRes.json();
      if (!ctxRes.ok) throw new Error(ctxJson.error || `HTTP ${ctxRes.status}`);
      setContext(ctxJson.context);
      if (orgRes.ok) setOrganizations(orgJson.organizations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setContext(null);
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
        body: JSON.stringify({ action, operatorEmail, organizationSlug, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.code || `HTTP ${res.status}`);
      setMessage(`${action} OK`);
      if (json.token) {
        setLastInviteToken(json.token as string);
        setInviteToken(json.token as string);
      }
      if (action === 'simulate_dual_context') setDualResult(json as DualContextResult);
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
        <p className="pg-kicker">STUDIO WORLD · PARTNER / AGENCY ONBOARDING PILOT</p>
        <h1>Dual-Context Operator · Invitation Lifecycle</h1>
        <p className="pg-rule">
          COMPLIMENTARY PLATFORM ACCESS · METERED PRODUCTION COMPUTE · SERVER-AUTHORIZED ORG CONTEXT
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
            <option value="frontal-slayer">Frontal Slayer</option>
            <option value="founding-partner-agency">Founding Partner Agency</option>
            {organizations
              .filter((o) => !['frontal-slayer', 'founding-partner-agency'].includes(o.slug))
              .map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.name}
                </option>
              ))}
          </select>
        </label>
        <button type="button" onClick={() => void reload()} disabled={loading}>
          Refresh
        </button>
        <button type="button" onClick={() => void postAction('seed_pilot_fixtures')}>
          Seed Pilot Fixtures
        </button>
        <button type="button" onClick={() => void postAction('switch_organization', { organizationSlug: 'frontal-slayer' })}>
          Switch → Frontal Slayer
        </button>
        <button type="button" onClick={() => void postAction('switch_organization', { organizationSlug: 'founding-partner-agency' })}>
          Switch → Partner Agency
        </button>
      </section>

      {error && <p className="pg-error">{error}</p>}
      {message && <p className="pg-ok">{message}</p>}
      {loading && <p className="pg-loading">Loading…</p>}

      {context && (
        <section className="pg-grid">
          <div className="pg-card">
            <h2>Active Context</h2>
            <dl>
              <dt>Organization</dt>
              <dd>{context.activeOrganizationName}</dd>
              <dt>Billing Owner</dt>
              <dd>{context.billingOwnerSlug}</dd>
              <dt>Platform Access</dt>
              <dd>{context.platformAccess}</dd>
              <dt>Production Compute</dt>
              <dd>{context.productionCompute}</dd>
              <dt>Founding Partner</dt>
              <dd>{context.foundingPartner ? 'YES' : 'NO'}</dd>
            </dl>
          </div>
          <div className="pg-card">
            <h2>Budget</h2>
            {context.budget ? (
              <dl>
                <dt>Hard Limit</dt>
                <dd>${context.budget.hardLimit ?? '—'}</dd>
                <dt>Actual</dt>
                <dd>${context.budget.actual.toFixed(2)}</dd>
                <dt>Reserved</dt>
                <dd>${context.budget.reserved.toFixed(2)}</dd>
                <dt>Available</dt>
                <dd>{context.budget.available != null ? `$${context.budget.available.toFixed(2)}` : '—'}</dd>
              </dl>
            ) : (
              <p>No budget configured</p>
            )}
          </div>
          <div className="pg-card">
            <h2>Capabilities</h2>
            <ul>
              {context.capabilities.map((c) => (
                <li key={c.routeKey}>
                  {c.label}: <strong>{c.state}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="pg-sim">
        <h2>Dual-Context Pilot</h2>
        <div className="pg-sim-buttons">
          <button type="button" onClick={() => void postAction('simulate_dual_context')}>
            Run Dual-Context Simulation
          </button>
        </div>
        {dualResult && (
          <pre>{JSON.stringify(dualResult, null, 2)}</pre>
        )}
      </section>

      <section className="pg-sim">
        <h2>Invitation Lifecycle</h2>
        <div className="pg-sim-buttons">
          <button
            type="button"
            onClick={() =>
              void postAction('invite_member', {
                invitedEmail: `fixture-${Date.now()}@pilot.test`,
                proposedRole: 'PRODUCER',
              })
            }
          >
            Create Invitation
          </button>
          <button
            type="button"
            onClick={() => void postAction('accept_invitation', { token: inviteToken })}
            disabled={!inviteToken}
          >
            Accept Invitation
          </button>
          <button
            type="button"
            onClick={() => void postAction('accept_invitation', { token: inviteToken })}
            disabled={!inviteToken}
          >
            Replay Accept (idempotency)
          </button>
        </div>
        {lastInviteToken && <p className="pg-ok">Last token (fixture only): {lastInviteToken.slice(0, 12)}…</p>}
        <label>
          Token
          <input value={inviteToken} onChange={(e) => setInviteToken(e.target.value)} />
        </label>
      </section>
    </div>
  );
}
