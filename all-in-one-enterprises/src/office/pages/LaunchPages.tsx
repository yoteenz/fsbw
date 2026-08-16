import { Link } from 'react-router-dom';
import {
  evaluateLaunchReadiness,
  canEnterLaunchPreparation,
  canExitPilot,
  getLaunchBlockers,
  getOpenP0Blockers,
  getOpenP1Blockers,
  CURRENT_LAUNCH_MODE,
  getLaunchModeLabel,
  SERVICE_LAUNCH_MATRIX,
  evaluateOperationalHealth,
  countServicesByLaunchState,
  CANONICAL_BRAND,
  SOP_REGISTRY,
} from '../../launch';
import { aioPaths } from '../../utils/paths';

function Badge({ value, tone }: { value: string; tone?: 'ok' | 'warn' | 'danger' | 'muted' }) {
  const cls = tone === 'ok' ? 'aio-status--ok' : tone === 'danger' ? 'aio-status--danger' : tone === 'warn' ? 'aio-status--warn' : 'aio-status--muted';
  return <span className={`aio-status-badge ${cls}`}>{value.replace(/_/g, ' ')}</span>;
}

function toneForStatus(s: string): 'ok' | 'warn' | 'danger' | 'muted' {
  if (s === 'READY' || s === 'GO' || s === 'HEALTHY') return 'ok';
  if (s === 'BLOCKED' || s === 'CRITICAL') return 'danger';
  if (s === 'PARTIAL' || s === 'WATCH' || s === 'LIMITED_PILOT' || s === 'HOLD') return 'warn';
  return 'muted';
}

export function LaunchControlCenterPage() {
  const prep = canEnterLaunchPreparation();
  const readiness = evaluateLaunchReadiness();
  const pilotExit = canExitPilot();
  const health = evaluateOperationalHealth();
  const serviceCounts = countServicesByLaunchState();
  const p0 = getOpenP0Blockers();
  const p1 = getOpenP1Blockers();

  return (
    <div className="aio-page">
      <header className="aio-page-header">
        <div>
          <p className="aio-eyebrow">Management · Launch Control</p>
          <h1>Launch Control Center</h1>
          <p className="aio-lead">
            Authoritative launch readiness for {CANONICAL_BRAND}. Software ready ≠ service ready ≠ public launch.
          </p>
        </div>
        <nav className="aio-inline-nav">
          <Link to={aioPaths.officeManagement}>← Management</Link>
          <Link to={aioPaths.officeManagementLaunchServices}>Service Activation</Link>
          <Link to={aioPaths.officeTraining}>Staff Training</Link>
          <Link to={aioPaths.officeSystemProduction}>Production Config</Link>
        </nav>
      </header>

      <section className="aio-card">
        <h2>Overall launch status</h2>
        <div className="aio-production-gates">
          <div><strong>Launch mode</strong><Badge value={getLaunchModeLabel(CURRENT_LAUNCH_MODE)} tone="warn" /></div>
          <div><strong>Overall state</strong><Badge value={readiness.overallState} tone={toneForStatus(readiness.overallState)} /></div>
          <div><strong>evaluateLaunchReadiness()</strong><Badge value={readiness.status} tone={toneForStatus(readiness.status)} /></div>
          <div><strong>Recommendation</strong><Badge value={readiness.recommendation} tone={toneForStatus(readiness.recommendation)} /></div>
          <div><strong>Operational health</strong><Badge value={health.overall} tone={toneForStatus(health.overall)} /></div>
        </div>
        {!prep.allowed && (
          <div className="aio-alert aio-alert--warn">
            <strong>Launch preparation gate</strong>
            <ul>{prep.blockers.slice(0, 5).map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        )}
        <p className="aio-data-note">PUBLIC LAUNCH remains blocked until P0 resolved and explicit owner approval recorded.</p>
      </section>

      <section className="aio-card">
        <h2>Readiness dimensions</h2>
        <table className="aio-table">
          <tbody>
            {[
              ['Technical', readiness.technical],
              ['Business', readiness.business],
              ['Staff', readiness.staff],
              ['Security', readiness.security],
              ['Support', readiness.support],
            ].map(([label, status]) => (
              <tr key={label}><td>{label}</td><td><Badge value={String(status)} tone={toneForStatus(String(status))} /></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Service activation summary</h2>
        <dl className="aio-dl-grid">
          {Object.entries(serviceCounts).map(([state, count]) => (
            <div key={state} className="aio-dl-row"><dt>{state}</dt><dd>{count}</dd></div>
          ))}
        </dl>
        <Link to={aioPaths.officeManagementLaunchServices}>Open Service Activation Center →</Link>
      </section>

      <section className="aio-card">
        <h2>Open blockers</h2>
        <p>P0: {p0.length} · P1: {p1.length}</p>
        <table className="aio-table">
          <thead><tr><th>ID</th><th>Sev</th><th>Category</th><th>Description</th><th>Action</th></tr></thead>
          <tbody>
            {getLaunchBlockers().filter((b) => b.status === 'OPEN').slice(0, 12).map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td><Badge value={b.severity} tone={b.severity === 'P0' ? 'danger' : 'warn'} /></td>
                <td>{b.category}</td>
                <td>{b.description}</td>
                <td>{b.requiredAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Full list: docs/launch/LAUNCH_BLOCKERS.md</p>
      </section>

      <section className="aio-card">
        <h2>Pilot exit gate</h2>
        <p><Badge value={pilotExit.allowed ? 'READY' : 'BLOCKED'} tone={pilotExit.allowed ? 'ok' : 'danger'} /> canExitPilot()</p>
        {!pilotExit.allowed && (
          <ul>{pilotExit.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        )}
      </section>

      <section className="aio-card">
        <h2>Operational health</h2>
        <table className="aio-table">
          <tbody>
            {Object.entries(health).filter(([k]) => k !== 'notes').map(([k, v]) => (
              <tr key={k}><td>{k}</td><td><Badge value={String(v)} tone={toneForStatus(String(v))} /></td></tr>
            ))}
          </tbody>
        </table>
        <ul>{health.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </section>

      <section className="aio-card aio-muted">
        <h2>Staged launch strategy</h2>
        <ol>
          <li>Phase 0 — Internal production verification (current: INTERNAL mode)</li>
          <li>Phase 1 — Controlled pilot (approved customers/services only)</li>
          <li>Phase 2 — Limited public launch (activated services only)</li>
          <li>Phase 3 — Full public availability</li>
        </ol>
        <p>See docs/launch/LAUNCH_RUNBOOK.md</p>
      </section>
    </div>
  );
}

export function ServiceActivationCenterPage() {
  return (
    <div className="aio-page">
      <header className="aio-page-header">
        <div>
          <p className="aio-eyebrow">Management · Service Activation</p>
          <h1>Service Activation Center</h1>
          <p className="aio-lead">Per-service GO / PILOT / HOLD / BLOCKED decisions — software ≠ business ready.</p>
        </div>
        <nav className="aio-inline-nav">
          <Link to={aioPaths.officeManagementLaunch}>← Launch Control</Link>
          <Link to={aioPaths.officeManagement}>Management</Link>
        </nav>
      </header>

      <table className="aio-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>State</th>
            <th>Software</th>
            <th>Workflow</th>
            <th>Pricing</th>
            <th>Staff</th>
            <th>Business Auth</th>
            <th>Provider</th>
            <th>Payment</th>
            <th>Public CTA</th>
          </tr>
        </thead>
        <tbody>
          {SERVICE_LAUNCH_MATRIX.map((s) => (
            <tr key={s.id}>
              <td>{s.label}</td>
              <td><Badge value={s.activationState} tone={toneForStatus(s.activationState)} /></td>
              <td>{s.softwareStatus}</td>
              <td>{s.workflowStatus}</td>
              <td>{s.pricingStatus}</td>
              <td>{s.staffProcessStatus}</td>
              <td>{s.businessAuthorizationStatus}</td>
              <td>{s.providerStatus}</td>
              <td>{s.paymentStatus}</td>
              <td>{s.publicCta}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="aio-card" style={{ marginTop: '1.5rem' }}>
        <h2>Regulated service boundaries</h2>
        <ul>
          <li><strong>Brokerage</strong> — BLOCKED until authority/licensing verified</li>
          <li><strong>Factoring</strong> — HOLD — partner referral only; All In One does not fund receivables</li>
          <li><strong>Insurance</strong> — HOLD — referral/assistance; no bind without licensing</li>
          <li><strong>BOC-3</strong> — BLOCKED — process agent requirements not verified</li>
          <li><strong>Tax/Government</strong> — staff manual process; no fabricated government APIs</li>
        </ul>
      </section>
    </div>
  );
}

export function SopLibraryPage() {
  return (
    <div className="aio-page">
      <header className="aio-page-header">
        <h1>Standard Operating Procedures</h1>
        <Link to={aioPaths.officeTraining}>← Training</Link>
      </header>
      <table className="aio-table">
        <thead><tr><th>Title</th><th>Category</th><th>Owner</th><th>Version</th><th>Path</th></tr></thead>
        <tbody>
          {SOP_REGISTRY.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.category}</td>
              <td>{s.ownerRole}</td>
              <td>{s.version}</td>
              <td><code>{s.path}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
