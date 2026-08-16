import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import {
  buildHealthSnapshot,
  canLaunchPublicly,
  canPrepareProduction,
  getInfrastructureMatrix,
  getReleaseIdentifier,
  INFRASTRUCTURE_INVENTORY,
  PROVIDER_DECISIONS,
  PROVIDER_REGISTRY,
  SERVICE_ACTIVATION_MATRIX,
  evaluateRlsReadiness,
  resolveDeploymentEnvironment,
  CANONICAL_MIGRATIONS,
  initialMigrationRecords,
} from '../../infrastructure';

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'READY' || status === 'VERIFIED' || status === 'PRODUCTION_CONNECTED'
    ? 'aio-status--ok'
    : status === 'BLOCKED' || status === 'ERROR'
      ? 'aio-status--danger'
      : status === 'PARTIAL' || status === 'SANDBOX' || status === 'PRODUCTION_PENDING'
        ? 'aio-status--warn'
        : 'aio-status--muted';
  return <span className={`aio-status-badge ${cls}`}>{status.replace(/_/g, ' ')}</span>;
}

export function ProductionConfigCenterPage() {
  const store = useDemoStore();
  const env = resolveDeploymentEnvironment();
  const prepare = canPrepareProduction();
  const launch = canLaunchPublicly();
  const health = buildHealthSnapshot();
  const release = getReleaseIdentifier();
  const matrix = getInfrastructureMatrix();
  const rls = evaluateRlsReadiness();
  const migrations = initialMigrationRecords();

  return (
    <div className="aio-page aio-production-config">
      <header className="aio-page-header">
        <div>
          <p className="aio-eyebrow">System · Production Infrastructure</p>
          <h1>Production Config Center</h1>
          <p className="aio-lead">
            Truthful infrastructure status — no secrets shown. Application complete ≠ public launch ready.
          </p>
        </div>
        <nav className="aio-inline-nav">
          <Link to={aioPaths.office}>← Office</Link>
          <Link to={aioPaths.officeSecurityProductionReadiness}>Security checklist</Link>
          <Link to={aioPaths.officeQa}>QA</Link>
          <Link to={aioPaths.officeDataHealth}>Data health</Link>
        </nav>
      </header>

      <section className="aio-card aio-production-summary">
        <h2>Gate status</h2>
        <div className="aio-production-gates">
          <div>
            <strong>Environment</strong>
            <StatusBadge status={env.toUpperCase()} />
          </div>
          <div>
            <strong>canPrepareProduction()</strong>
            <StatusBadge status={prepare.status} />
          </div>
          <div>
            <strong>canLaunchPublicly()</strong>
            <StatusBadge status={launch.status} />
          </div>
          <div>
            <strong>RLS gate</strong>
            <StatusBadge status={rls.status} />
          </div>
        </div>
        {prepare.blockers.length > 0 && (
          <div className="aio-alert aio-alert--warn">
            <strong>Preparation blockers</strong>
            <ul>{prepare.blockers.slice(0, 8).map((b) => <li key={b}>{b}</li>)}</ul>
            {prepare.blockers.length > 8 && <p>+ {prepare.blockers.length - 8} more</p>}
          </div>
        )}
        <p className="aio-data-note">
          INFRASTRUCTURE READY and PUBLIC LAUNCH READY are separate. Sprint 23 prepares the house; Sprint 24 opens operations.
        </p>
      </section>

      <section className="aio-card">
        <h2>Release &amp; health</h2>
        <dl className="aio-dl-grid">
          <dt>Release ID</dt><dd>{release.releaseId}</dd>
          <dt>Commit SHA</dt><dd>{release.commitSha ?? '(set at build via VITE_AIO_COMMIT_SHA)'}</dd>
          <dt>Liveness</dt><dd><StatusBadge status={health.liveness} /></dd>
          <dt>Readiness</dt><dd><StatusBadge status={health.readiness} /></dd>
          <dt>App URL</dt><dd>{import.meta.env.VITE_AIO_APP_URL ?? '(not configured)'}</dd>
        </dl>
        <h3>Dependency checks</h3>
        <table className="aio-table">
          <thead><tr><th>Check</th><th>Status</th><th>Message</th></tr></thead>
          <tbody>
            {health.checks.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>{c.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Configuration matrix</h2>
        <table className="aio-table">
          <thead>
            <tr><th>Component</th><th>Category</th><th>Status</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {matrix.map((item) => (
              <tr key={item.id}>
                <td>{item.label}</td>
                <td>{item.category}</td>
                <td><StatusBadge status={item.status} /></td>
                <td>{item.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Provider decisions</h2>
        <dl className="aio-dl-grid">
          {Object.entries(PROVIDER_DECISIONS).map(([k, v]) => (
            <div key={k} className="aio-dl-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="aio-card">
        <h2>Provider registry</h2>
        <table className="aio-table">
          <thead>
            <tr><th>Provider</th><th>State</th><th>Credential</th><th>Webhook</th><th>Sandbox</th><th>Prod approved</th></tr>
          </thead>
          <tbody>
            {PROVIDER_REGISTRY.map((p) => (
              <tr key={p.id}>
                <td>{p.label}</td>
                <td><StatusBadge status={p.state} /></td>
                <td>{p.credentialConfigured ? 'Yes' : 'No'}</td>
                <td>{p.webhookConfigured ? 'Yes' : 'No'}</td>
                <td>{p.sandboxTested ? 'Yes' : 'No'}</td>
                <td>{p.productionApproved ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Service activation</h2>
        <table className="aio-table">
          <thead>
            <tr><th>Service</th><th>State</th><th>Software</th><th>Backend</th><th>Business</th><th>Public CTA</th></tr>
          </thead>
          <tbody>
            {SERVICE_ACTIVATION_MATRIX.map((s) => (
              <tr key={s.id}>
                <td>{s.label}</td>
                <td><StatusBadge status={s.activationState} /></td>
                <td>{s.softwareReady ? '✓' : '—'}</td>
                <td>{s.backendReady ? '✓' : '—'}</td>
                <td>{s.businessReady ? '✓' : '—'}</td>
                <td>{s.customerCta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Migration pipeline</h2>
        <p>{CANONICAL_MIGRATIONS.length} canonical migrations — forward-only strategy. Production requires explicit target confirmation.</p>
        <table className="aio-table">
          <thead><tr><th>File</th><th>State</th></tr></thead>
          <tbody>
            {migrations.map((m) => (
              <tr key={m.filename}><td>{m.filename}</td><td><StatusBadge status={m.state} /></td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="aio-card">
        <h2>Infrastructure inventory (summary)</h2>
        <p>{INFRASTRUCTURE_INVENTORY.length} components tracked. See docs/PRODUCTION_INFRASTRUCTURE.md for full classification.</p>
      </section>

      <section className="aio-card aio-muted">
        <h2>Backup status (demo store)</h2>
        <p>Database: {store.backupStatus?.database ?? 'UNKNOWN'} · Storage: {store.backupStatus?.objectStorage ?? 'UNKNOWN'}</p>
        <p>Actual provider state updates after Supabase project provisioned.</p>
      </section>
    </div>
  );
}
