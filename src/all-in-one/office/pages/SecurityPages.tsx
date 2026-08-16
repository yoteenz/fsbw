import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { hasSecurityPermission } from '../../security/securityPermissions';
import {
  getProductionGate,
  getProductionReadiness,
  getSecurityControls,
  getSecurityPosture,
} from '../../demo/securityActions';
import { DataProductionReadinessSection } from './DataSystemPages';
import { filterAuditEvents } from '../../security/securityAudit';
import {
  createSecurityIncident,
  disableStaffAccount,
  revokeSession,
  updateIncidentStatus,
  updatePrivacyRequestStatus,
} from '../../demo/securityActions';
import '../../styles/aio-security.css';

function SecurityGate({
  children,
  perm = 'security.read' as const,
}: {
  children: React.ReactNode;
  perm?: Parameters<typeof hasSecurityPermission>[1];
}) {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasSecurityPermission(ctx.permissions, perm)) {
    return (
      <div className="aio-office-page">
        <p>You do not have access to this area.</p>
        <Link to={aioPaths.office}>← Office</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`aio-sec-pill aio-sec-pill--${tone}`}>{label}</span>;
}

export function SecurityCenterPage() {
  const store = useDemoStore();
  const posture = getSecurityPosture(store);
  const gate = getProductionGate(store);
  const controls = getSecurityControls(store);
  const findings = store.securityFindings ?? [];
  const backup = store.backupStatus;

  return (
    <SecurityGate>
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Security Center</h1>
          <p>Operational security posture — not a decorative lock icon.</p>
          <nav className="aio-sec-subnav">
            <Link to={aioPaths.officeSecurityAudit}>Audit</Link>
            <Link to={aioPaths.officePrivacy}>Privacy</Link>
            <Link to={aioPaths.officeSecurityIncidents}>Incidents</Link>
            <Link to={aioPaths.officeSecurityProductionReadiness}>Production Readiness</Link>
            <Link to={aioPaths.officeDataHealth}>Data Health</Link>
            <Link to={aioPaths.officeQa}>QA Center</Link>
            <Link to={aioPaths.officeSettingsSecurity}>Settings</Link>
          </nav>
        </header>

        <section className="aio-sec-grid">
          <div className="aio-sec-card">
            <h2>Security Posture</h2>
            <ul className="aio-sec-stats">
              <li><strong>{posture.implemented}</strong> Implemented</li>
              <li><strong>{posture.partial}</strong> Partial</li>
              <li><strong>{posture.actionRequired}</strong> Action Required</li>
            </ul>
            <p className="aio-sec-note">No arbitrary security score — control evidence only.</p>
          </div>
          <div className="aio-sec-card">
            <h2>Production Gate</h2>
            <StatusPill label={gate.status} tone={gate.status === 'BLOCKED' ? 'warn' : 'ok'} />
            {gate.blockers.slice(0, 4).map((b) => (
              <p key={b} className="aio-sec-blocker">{b}</p>
            ))}
            <Link to={aioPaths.officeSecurityProductionReadiness}>View checklist →</Link>
          </div>
          <div className="aio-sec-card">
            <h2>Backup Status</h2>
            <p>Database: <StatusPill label={backup?.database ?? 'NOT CONFIGURED'} tone="muted" /></p>
            <p>Object storage: <StatusPill label={backup?.objectStorage ?? 'NOT CONFIGURED'} tone="muted" /></p>
            <p className="aio-sec-note">{backup?.notes}</p>
          </div>
        </section>

        <section className="aio-office-panel">
          <h2>Active Findings</h2>
          <ul className="aio-sec-list">
            {findings.filter((f) => f.status === 'OPEN' || f.status === 'IN_PROGRESS').map((f) => (
              <li key={f.id}>
                <StatusPill label={f.severity} tone={f.severity.toLowerCase()} />
                <strong>{f.title}</strong>
                <span>{f.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Critical Controls (sample)</h2>
          <ul className="aio-sec-list">
            {controls.slice(0, 8).map((c) => (
              <li key={c.id}>
                <StatusPill label={c.status.replace(/_/g, ' ')} tone={c.status === 'IMPLEMENTED' ? 'ok' : 'warn'} />
                <strong>{c.name}</strong>
                <span>{c.category}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SecurityGate>
  );
}

export function SecurityAuditPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [eventFilter, setEventFilter] = useState('');
  const events = useMemo(() => {
    const base = filterAuditEvents(store, eventFilter ? { eventType: eventFilter as never } : {});
    return base.slice(0, 50);
  }, [store, eventFilter]);

  return (
    <SecurityGate perm="security.audit.read">
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Security Audit</h1>
          <p>Append-only security audit trail (demo). Ordinary users cannot edit history.</p>
          <Link to={aioPaths.officeSecurity}>← Security Center</Link>
        </header>
        <div className="aio-sec-filters">
          <label>
            Event type
            <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
              <option value="">All</option>
              <option value="LOGIN_SUCCESS">Login success</option>
              <option value="EXPORT_CREATED">Export</option>
              <option value="SESSION_REVOKED">Session revoked</option>
              <option value="FINANCIAL_RECORD_CHANGED">Financial change</option>
              <option value="PRIVACY_REQUEST_ACTION">Privacy request</option>
            </select>
          </label>
        </div>
        <div className="aio-sec-table-wrap">
          <table className="aio-sec-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Result</th>
                <th>Correlation</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.timestamp).toLocaleString()}</td>
                  <td>{e.eventType.replace(/_/g, ' ')}</td>
                  <td>{e.actorLabel ?? e.actorId ?? '—'}</td>
                  <td>{e.action}</td>
                  <td>{e.result}</td>
                  <td><code>{e.correlationId?.slice(0, 16)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="aio-sec-note">Viewer: {ctx.staffName} · {events.length} events shown (paginated)</p>
      </div>
    </SecurityGate>
  );
}

export function SecurityIncidentsPage() {
  const store = useDemoStore();
  const incidents = store.securityIncidents ?? [];
  const ctx = resolveOfficeStaffContext(store);

  return (
    <SecurityGate perm="security.incidents.read">
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Security Incidents</h1>
          <p>Internal incident tracking — not exposed to customers.</p>
          <Link to={aioPaths.officeSecurity}>← Security Center</Link>
        </header>
        {hasSecurityPermission(ctx.permissions, 'security.incidents.manage') && (
          <button
            type="button"
            className="aio-btn aio-btn--outline aio-btn--sm"
            onClick={() => createSecurityIncident({
              title: 'New demo incident',
              summary: 'Tabletop exercise — DEMO only',
              severity: 'SEV-4',
              category: 'OTHER',
              owner: ctx.staffId,
            })}
          >
            Create demo incident
          </button>
        )}
        <ul className="aio-sec-incidents">
          {incidents.map((inc) => (
            <li key={inc.id} className="aio-sec-incident">
              <div className="aio-sec-incident__head">
                <StatusPill label={inc.severity} tone="warn" />
                <StatusPill label={inc.status} tone="muted" />
                {inc.isDemo && <StatusPill label="DEMO" tone="demo" />}
              </div>
              <h3>{inc.title}</h3>
              <p>{inc.summary}</p>
              {inc.containment && <p><strong>Containment:</strong> {inc.containment}</p>}
              {inc.resolution && <p><strong>Resolution:</strong> {inc.resolution}</p>}
              {hasSecurityPermission(ctx.permissions, 'security.incidents.manage') && inc.status !== 'RESOLVED' && (
                <button type="button" className="aio-btn aio-btn--sm" onClick={() => updateIncidentStatus(inc.id, 'CONTAINED', 'Demo containment step')}>
                  Mark contained
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </SecurityGate>
  );
}

export function ProductionReadinessPage() {
  const store = useDemoStore();
  const items = getProductionReadiness(store);
  const gate = getProductionGate(store);

  return (
    <SecurityGate perm="security.production_readiness.read">
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Production Readiness</h1>
          <p>Deterministic launch gate — UI cannot override hard blockers.</p>
          <StatusPill label={gate.status} tone={gate.status === 'BLOCKED' ? 'warn' : 'ok'} />
          <Link to={aioPaths.officeSecurity}>← Security Center</Link>
        </header>
        <ul className="aio-sec-readiness">
          {items.map((item) => (
            <li key={item.id} className={item.blocking ? 'aio-sec-readiness--blocker' : ''}>
              <div>
                <strong>{item.title}</strong>
                <span className="aio-sec-readiness__cat">{item.category}</span>
              </div>
              <StatusPill label={item.state.replace(/_/g, ' ')} tone={item.state === 'READY' ? 'ok' : 'warn'} />
              <p>{item.description}</p>
              {item.notes && <p className="aio-sec-note">{item.notes}</p>}
            </li>
          ))}
        </ul>
        {gate.blockers.length > 0 && (
          <section className="aio-office-panel">
            <h2>Blocking reasons</h2>
            <ul>{gate.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
          </section>
        )}
        <DataProductionReadinessSection />
      </div>
    </SecurityGate>
  );
}

export function PrivacyCenterPage() {
  const store = useDemoStore();
  const requests = store.privacyRequests ?? [];
  const retention = store.dataRetentionPolicies ?? [];
  const vendors = store.vendorSecurityRecords ?? [];
  const ctx = resolveOfficeStaffContext(store);

  return (
    <SecurityGate perm="privacy.read">
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Privacy Center</h1>
          <p>Data inventory, requests, retention, and vendor visibility — not legal certification.</p>
          <Link to={aioPaths.officeSecurity}>← Security Center</Link>
        </header>

        <section className="aio-office-panel">
          <h2>Privacy Requests</h2>
          <ul className="aio-sec-list">
            {requests.map((r) => (
              <li key={r.id}>
                <strong>{r.requestType}</strong> — {r.requesterLabel}
                <StatusPill label={r.status.replace(/_/g, ' ')} tone="muted" />
                {hasSecurityPermission(ctx.permissions, 'privacy.requests.review') && r.status === 'UNDER_REVIEW' && (
                  <button type="button" className="aio-btn aio-btn--sm" onClick={() => updatePrivacyRequestStatus(r.id, 'IN_PROGRESS', 'Demo review started')}>
                    Start review
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Retention Registry</h2>
          <ul className="aio-sec-list">
            {retention.map((p) => (
              <li key={p.id}>
                <strong>{p.dataCategory}</strong> · {p.classification}
                <span>{p.retentionPeriod}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Vendor Security Registry</h2>
          <ul className="aio-sec-list">
            {vendors.map((v) => (
              <li key={v.id}>
                <strong>{v.name}</strong>
                <StatusPill label={v.securityReviewStatus.replace(/_/g, ' ')} tone="muted" />
                <span>{v.purpose}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SecurityGate>
  );
}

export function OfficeSecuritySettingsPage() {
  const store = useDemoStore();
  const settings = store.securitySettings;
  const sessions = (store.securitySessions ?? []).filter((s) => s.principalType === 'staff');
  const ctx = resolveOfficeStaffContext(store);

  return (
    <SecurityGate perm="security.settings.manage">
      <div className="aio-office-page aio-sec-page">
        <header className="aio-sec-hero">
          <h1>Security Settings</h1>
          <p>Policies enforced by architecture — settings without backend enforcement are not exposed.</p>
          <Link to={aioPaths.officeSecurity}>← Security Center</Link>
        </header>
        {settings && (
          <dl className="aio-sec-settings">
            <div><dt>Environment</dt><dd>{settings.environmentLabel} {settings.demoModeActive && '(Demo mode active)'}</dd></div>
            <div><dt>Session idle timeout</dt><dd>{settings.sessionIdleMinutes} minutes</dd></div>
            <div><dt>Session absolute max</dt><dd>{settings.sessionAbsoluteHours} hours</dd></div>
            <div><dt>MFA policy</dt><dd>{settings.mfaPolicy.replace(/_/g, ' ')}</dd></div>
            <div><dt>Login rate limit</dt><dd>{settings.loginRateLimitPerHour} / hour / account</dd></div>
            <div><dt>Max upload size</dt><dd>{Math.round(settings.maxUploadBytes / 1024 / 1024)} MB</dd></div>
            <div><dt>Audit retention</dt><dd>{settings.auditRetentionDays} days (configurable)</dd></div>
          </dl>
        )}

        <section className="aio-office-panel">
          <h2>Active Staff Sessions</h2>
          <ul className="aio-sec-sessions">
            {sessions.map((s) => (
              <li key={s.id}>
                <strong>{s.deviceLabel ?? s.userAgentApprox}</strong>
                <span>Last active {new Date(s.lastActiveAt).toLocaleString()}</span>
                {s.isCurrent && <StatusPill label="Current" tone="ok" />}
                {!s.revokedAt && !s.isCurrent && (
                  <button type="button" className="aio-btn aio-btn--sm" onClick={() => revokeSession(s.id, ctx.staffId)}>Revoke</button>
                )}
                {s.revokedAt && <StatusPill label="Revoked" tone="warn" />}
              </li>
            ))}
          </ul>
        </section>

        <section className="aio-office-panel">
          <h2>Account Security Response (demo)</h2>
          <p className="aio-sec-note">Disable account, revoke sessions, preserve audit actor history.</p>
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => disableStaffAccount('staff-8', ctx.staffId)}>
            Disable demo staff account
          </button>
        </section>
      </div>
    </SecurityGate>
  );
}
