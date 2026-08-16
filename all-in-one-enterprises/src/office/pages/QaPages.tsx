import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { aioPaths } from '../../utils/paths';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { hasSecurityPermission } from '../../security/securityPermissions';
import {
  getExtractionGate,
  getExtractionReport,
  getQaAccessibility,
  getQaBrowsers,
  getQaDefects,
  getQaDependencyGraph,
  getQaDevices,
  getQaInventories,
  getQaJourneys,
  getQaOverview,
  getQaPerformance,
  getQaPlaceholderAudit,
  getQaRoutes,
  getQaTestSuites,
} from '../../demo/qaActions';
import '../../styles/aio-qa.css';

function QaGate({ children }: { children: React.ReactNode }) {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasSecurityPermission(ctx.permissions, 'security.read')) {
    return (
      <div className="aio-office-page">
        <p>You do not have access to the QA Command Center.</p>
        <Link to={aioPaths.office}>← Office</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function Badge({ value }: { value: string }) {
  const ok = ['PASS', 'READY', 'VERIFIED', 'true'].includes(value);
  const bad = ['FAIL', 'BLOCKED', 'OPEN', 'P0'].includes(value);
  const tone = ok ? 'ok' : bad ? 'bad' : 'muted';
  return <span className={`aio-qa-badge aio-qa-badge--${tone}`}>{value.replace(/_/g, ' ')}</span>;
}

function QaSubnav() {
  return (
    <nav className="aio-qa-subnav">
      <Link to={aioPaths.officeQa}>Overview</Link>
      <Link to={aioPaths.officeQaAccessibility}>Accessibility</Link>
      <Link to={aioPaths.officeQaPerformance}>Performance</Link>
      <Link to={aioPaths.officeQaDevices}>Devices</Link>
      <Link to={aioPaths.officeQaBrowsers}>Browsers</Link>
      <Link to={aioPaths.officeDataHealth}>Data</Link>
      <Link to={aioPaths.officeSystemProduction}>Production Config</Link>
      <Link to={aioPaths.officeSecurityProductionReadiness}>Production</Link>
    </nav>
  );
}

export function QaCommandCenterPage() {
  const overview = useMemo(() => getQaOverview(), []);
  const suites = getQaTestSuites();
  const journeys = getQaJourneys();
  const defects = getQaDefects();
  const extraction = getExtractionGate();

  return (
    <QaGate>
      <div className="aio-office-page aio-qa-page">
        <header className="aio-qa-hero">
          <h1>QA Command Center</h1>
          <p>Evidence-based release quality — Sprint 21+. Standalone app (Sprint 22). Automated PASS ≠ manual sign-off.</p>
          <QaSubnav />
        </header>

        <section className="aio-qa-grid">
          <div className="aio-qa-card">
            <h2>Overview</h2>
            <ul className="aio-qa-stats">
              <li>Total tracked: <strong>{overview.totalTests}</strong></li>
              <li>Pass: <strong>{overview.passed}</strong></li>
              <li>Partial: <strong>{overview.partial}</strong></li>
              <li>Blocked: <strong>{overview.blocked}</strong></li>
              <li>Not tested: <strong>{overview.notTested}</strong></li>
            </ul>
            <p>Open P0: {overview.openP0} · P1: {overview.openP1}</p>
          </div>
          <div className="aio-qa-card">
            <h2>Extraction Readiness</h2>
            <Badge value={extraction.status} />
            <ul className="aio-qa-list">
              {extraction.blockers.slice(0, 4).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="aio-qa-card">
            <h2>Regressions</h2>
            <p>A11y issues tracked: {overview.accessibilityIssues}</p>
            <p>Perf regressions: {overview.performanceRegressions}</p>
            <p>Extraction blockers: {overview.extractionBlockers}</p>
          </div>
        </section>

        <section className="aio-office-panel">
          <h2>Test Suites ({suites.length})</h2>
          <table className="aio-qa-table">
            <thead>
              <tr><th>Suite</th><th>Layer</th><th>Domain</th><th>Status</th></tr>
            </thead>
            <tbody>
              {suites.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.layer}</td>
                  <td>{s.domain}</td>
                  <td><Badge value={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="aio-office-panel">
          <h2>E2E Journeys ({journeys.length})</h2>
          <table className="aio-qa-table">
            <thead>
              <tr><th>Journey</th><th>Persona</th><th>Automated</th><th>Status</th></tr>
            </thead>
            <tbody>
              {journeys.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.persona}</td>
                  <td>{j.automated ? 'Yes' : 'Manual'}</td>
                  <td><Badge value={j.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="aio-office-panel">
          <h2>Defects ({defects.length})</h2>
          <table className="aio-qa-table">
            <thead>
              <tr><th>ID</th><th>Title</th><th>Severity</th><th>Status</th><th>Extraction?</th></tr>
            </thead>
            <tbody>
              {defects.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.title}</td>
                  <td><Badge value={d.severity} /></td>
                  <td><Badge value={d.status} /></td>
                  <td>{d.extractionBlocker ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <ExtractionReadinessSection />
      </div>
    </QaGate>
  );
}

export function QaAccessibilityPage() {
  const items = getQaAccessibility();
  return (
    <QaGate>
      <div className="aio-office-page aio-qa-page">
        <header className="aio-qa-hero">
          <h1>Accessibility Command Center</h1>
          <p>WCAG 2.2 AA engineering benchmark — not formal certification.</p>
          <QaSubnav />
        </header>
        <ul className="aio-qa-checklist">
          {items.map((i) => (
            <li key={i.id}>
              {i.label}: <Badge value={i.status} />
              {i.notes && <span className="aio-qa-muted"> — {i.notes}</span>}
            </li>
          ))}
        </ul>
      </div>
    </QaGate>
  );
}

export function QaPerformancePage() {
  const items = getQaPerformance();
  return (
    <QaGate>
      <div className="aio-office-page aio-qa-page">
        <header className="aio-qa-hero">
          <h1>Performance Command Center</h1>
          <p>Measured findings only — Lighthouse scores not fabricated.</p>
          <QaSubnav />
        </header>
        <table className="aio-qa-table">
          <thead>
            <tr><th>Route/Area</th><th>Metric</th><th>Finding</th><th>Status</th></tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.route + row.metric}>
                <td>{row.route}</td>
                <td>{row.metric}</td>
                <td>{row.value}</td>
                <td><Badge value={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QaGate>
  );
}

export function QaDevicesPage() {
  const devices = getQaDevices();
  return (
    <QaGate>
      <div className="aio-office-page aio-qa-page">
        <header className="aio-qa-hero">
          <h1>Device Matrix</h1>
          <QaSubnav />
        </header>
        <table className="aio-qa-table">
          <thead>
            <tr><th>Viewport</th><th>Class</th><th>Public</th><th>Portal</th><th>Office</th></tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.viewport}>
                <td>{d.viewport}</td>
                <td>{d.class}</td>
                <td><Badge value={d.public} /></td>
                <td><Badge value={d.portal} /></td>
                <td><Badge value={d.office} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QaGate>
  );
}

export function QaBrowsersPage() {
  const browsers = getQaBrowsers();
  return (
    <QaGate>
      <div className="aio-office-page aio-qa-page">
        <header className="aio-qa-hero">
          <h1>Browser Matrix</h1>
          <p>Do not mark Safari tested unless WebKit project executed.</p>
          <QaSubnav />
        </header>
        <table className="aio-qa-table">
          <thead>
            <tr><th>Browser</th><th>Version</th><th>Tested</th><th>Environment</th></tr>
          </thead>
          <tbody>
            {browsers.map((b) => (
              <tr key={b.browser}>
                <td>{b.browser}</td>
                <td>{b.version}</td>
                <td>{b.tested ? 'Yes' : 'No'}</td>
                <td>{b.environment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QaGate>
  );
}

export function ExtractionReadinessSection() {
  const report = getExtractionReport();
  const routes = getQaRoutes();
  const graph = getQaDependencyGraph();
  const inv = getQaInventories();
  const placeholders = getQaPlaceholderAudit();

  return (
    <section className="aio-office-panel">
      <h2>Extraction Readiness</h2>
      <Badge value={report.gate.status} />
      <h3>Requirements</h3>
      <ul className="aio-qa-list">
        {report.requirements.map((r) => (
          <li key={r.id}>{r.met ? '✓' : '✗'} {r.label}{r.notes ? ` (${r.notes})` : ''}</li>
        ))}
      </ul>
      <h3>Route inventory ({routes.length})</h3>
      <p className="aio-qa-muted">Categories: {JSON.stringify(inv.extraction.routes.byCategory)}</p>
      <h3>Dependency graph</h3>
      <ul className="aio-qa-list">
        {graph.map((n) => (
          <li key={n.id}><code>{n.path}</code> — {n.class}</li>
        ))}
      </ul>
      <h3>Placeholder audit</h3>
      <ul className="aio-qa-list">
        {placeholders.map((p) => (
          <li key={p.file}>{p.file}: {p.pattern} ({p.classification})</li>
        ))}
      </ul>
    </section>
  );
}
