import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { hasSecurityPermission } from '../../security/securityPermissions';
import {
  getArchitectureReadinessItems,
  getDataSystemStatus,
  getMigrationReadiness,
  getMigrationsList,
  getPersistenceInventory,
  runMigrationDryRun,
} from '../../demo/dataActions';
import { getProductionReadiness } from '../../demo/securityActions';
import '../../styles/aio-data-system.css';

function DataGate({ children }: { children: React.ReactNode }) {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasSecurityPermission(ctx.permissions, 'security.read')) {
    return (
      <div className="aio-office-page">
        <p>You do not have access to the Data Health Center.</p>
        <Link to={aioPaths.office}>← Office</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function StatusBadge({ value }: { value: string }) {
  const tone = value === 'READY' || value === 'PASSING' || value === 'CONNECTED' || value === 'COMPLETE'
    ? 'ok'
    : value === 'BLOCKED' || value === 'FAILING' || value === 'MISCONFIGURED'
      ? 'bad'
      : 'muted';
  return <span className={`aio-data-badge aio-data-badge--${tone}`}>{value.replace(/_/g, ' ')}</span>;
}

export function DataHealthCenterPage() {
  const store = useDemoStore();
  const status = useMemo(() => getDataSystemStatus(store), [store]);
  const arch = getArchitectureReadinessItems(store);
  const inventory = getPersistenceInventory();
  const migrations = getMigrationsList();

  return (
    <DataGate>
      <div className="aio-office-page aio-data-page">
        <header className="aio-data-hero">
          <h1>Data Health Center</h1>
          <p>Production-grade architecture status — separate from production launch readiness.</p>
          <nav className="aio-data-subnav">
            <Link to={aioPaths.officeDataMigration}>Migration Center</Link>
            <Link to={aioPaths.officeSecurityProductionReadiness}>Production Readiness</Link>
          </nav>
        </header>

        <section className="aio-data-grid">
          <div className="aio-data-card">
            <h2>Data Mode</h2>
            <p className="aio-data-mode">DATA MODE: <strong>{status.dataModeLabel}</strong></p>
            <p>Demo schema v{status.demoSchemaVersion}</p>
            <p>Seed: {status.seedVersion}</p>
            <p className="aio-data-muted">Last check: {new Date(status.lastHealthCheckAt).toLocaleString()}</p>
          </div>
          <div className="aio-data-card">
            <h2>Infrastructure</h2>
            <ul className="aio-data-list">
              <li>Database: <StatusBadge value={status.database} /></li>
              <li>Auth: <StatusBadge value={status.auth} /></li>
              <li>Storage: <StatusBadge value={status.storage} /></li>
              <li>Migrations: <StatusBadge value={status.migrations.status} /></li>
              <li>RLS tests: <StatusBadge value={status.rls} /></li>
            </ul>
          </div>
          <div className="aio-data-card">
            <h2>Architecture Readiness</h2>
            <ul className="aio-data-list">
              {arch.map((a) => (
                <li key={a.id}>{a.label}: <StatusBadge value={a.state} /></li>
              ))}
            </ul>
            <p className="aio-data-note">Launch requires dedicated AIO Supabase — not configured in debug.</p>
          </div>
        </section>

        {status.configErrors.length > 0 && (
          <section className="aio-office-panel aio-data-warn">
            <h2>Configuration Issues</h2>
            <ul>{status.configErrors.map((e) => <li key={e}>{e}</li>)}</ul>
          </section>
        )}

        <section className="aio-office-panel">
          <h2>Migration Files ({migrations.length})</h2>
          <p className="aio-data-muted">Directory: {status.migrations.directory}</p>
          <ol className="aio-data-migrations">
            {migrations.map((m) => (
              <li key={m.filename}><code>{m.filename}</code></li>
            ))}
          </ol>
        </section>

        <section className="aio-office-panel">
          <h2>Persistence Inventory</h2>
          <p className="aio-data-muted">{inventory.length} domain mappings — demo → canonical table</p>
          <div className="aio-data-table-wrap">
            <table className="aio-data-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Current</th>
                  <th>Canonical Table</th>
                </tr>
              </thead>
              <tbody>
                {inventory.slice(0, 12).map((row) => (
                  <tr key={`${row.domain}-${row.canonicalTable}`}>
                    <td>{row.domain}</td>
                    <td className="aio-data-cell-truncate">{row.currentStorage.slice(0, 60)}…</td>
                    <td><code>{row.canonicalTable}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DataGate>
  );
}

export function DataMigrationCenterPage() {
  const store = useDemoStore();
  const readiness = useMemo(() => getMigrationReadiness(store), [store]);
  const [dryRun, setDryRun] = useState<Awaited<ReturnType<typeof runMigrationDryRun>> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDryRun = async () => {
    setLoading(true);
    try {
      const result = await runMigrationDryRun();
      setDryRun(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataGate>
      <div className="aio-office-page aio-data-page">
        <header className="aio-data-hero">
          <h1>Data Migration Center</h1>
          <p>Debug → production migration phases. Production import is NOT ENABLED.</p>
          <nav className="aio-data-subnav">
            <Link to={aioPaths.officeDataHealth}>← Data Health</Link>
          </nav>
        </header>

        <section className="aio-data-grid">
          <div className="aio-data-card">
            <h2>Schema Versions</h2>
            <p>Current demo: v{readiness.currentDemoSchemaVersion}</p>
            <p>Target: v{readiness.targetSchemaVersion}</p>
            <p>Migrations ready: <StatusBadge value={readiness.migrationFilesReady ? 'READY' : 'NOT_READY'} /></p>
          </div>
          <div className="aio-data-card">
            <h2>Production Import</h2>
            <StatusBadge value="NOT ENABLED" />
            <p className="aio-data-note">Real customer import requires Sprint 20+ extraction and founder authorization.</p>
          </div>
          <div className="aio-data-card">
            <h2>Project Guard</h2>
            <p>Blocked FS project:</p>
            <code>{readiness.fsProjectBlocked}</code>
            <p className="aio-data-note">Migrations abort if URL/ref matches Frontal Slayer.</p>
          </div>
        </section>

        <section className="aio-office-panel">
          <h2>Migration Phases</h2>
          <ol className="aio-data-phases">
            {readiness.phases.map((p) => (
              <li key={p.phase}>
                Phase {p.phase}: {p.name} — <StatusBadge value={p.status} />
              </li>
            ))}
          </ol>
        </section>

        <section className="aio-office-panel">
          <h2>Dry Run</h2>
          <button type="button" className="aio-data-btn" disabled={loading} onClick={handleDryRun}>
            {loading ? 'Running…' : 'Run Import Dry Run'}
          </button>
          {dryRun && (
            <div className="aio-data-dryrun">
              <p>Records read: {dryRun.recordsRead} · Valid: {dryRun.recordsValid} · Rejected: {dryRun.recordsRejected}</p>
              {dryRun.warnings.map((w) => (
                <p key={w.code} className="aio-data-warn-text">{w.message}</p>
              ))}
            </div>
          )}
        </section>
      </div>
    </DataGate>
  );
}

export function DataProductionReadinessSection() {
  const store = useDemoStore();
  const prod = getProductionReadiness(store);
  const arch = getArchitectureReadinessItems(store);

  return (
    <section className="aio-office-panel">
      <h2>Data Architecture (Sprint 20)</h2>
      <p className="aio-data-note">Architecture readiness ≠ production launch. Launch remains BLOCKED without dedicated infrastructure.</p>
      <ul className="aio-data-list">
        {arch.map((a) => (
          <li key={a.id}>{a.label}: <StatusBadge value={a.state} /></li>
        ))}
      </ul>
      <h3>Launch Blockers (unchanged)</h3>
      <ul>
        {prod.filter((p) => p.blocking && p.state !== 'READY').slice(0, 6).map((p) => (
          <li key={p.id}>{p.title}: {p.state}</li>
        ))}
      </ul>
    </section>
  );
}
