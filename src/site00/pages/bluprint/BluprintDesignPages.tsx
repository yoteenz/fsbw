import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { useDesignRouteManifest } from '../../hooks/useDesignRouteManifest';
import {
  buildCoverageMatrix,
  buildNeedsImprovementQueue,
  buildNeedsReferenceQueue,
  groupRoutesForScreenDropdown,
} from '../../../studio-os-core/route-intelligence/browser';
import type {
  ViewportClass,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
} from '../../../studio-os-core/route-intelligence/types';
import '../../styles/site00-bluprint.css';

const VIEWPORTS: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];

function statusLabel(designStatus: string): string {
  switch (designStatus) {
    case 'MATCHED':
      return 'MATCHED';
    case 'REFERENCE_CANONICAL':
      return 'CANONICAL';
    case 'MISSING_REFERENCE':
      return 'NEEDS DESIGN';
    case 'NEEDS_REBUILD':
    case 'STALE_AGAINST_REFERENCE':
      return 'NEEDS REBUILD';
    case 'IMPLEMENTED_UNMATCHED':
      return 'NEEDS MATCH';
    default:
      return designStatus.replace(/_/g, ' ');
  }
}

export default function BluprintDesignHubPage() {
  const { manifest, syncStatus, error, reload } = useDesignRouteManifest();

  if (error) {
    return (
      <Site00PublicShell mobileActiveNav="build">
        <div className="site00-page site00-bluprint">
          <PageIntro title={<BracketHeading>DESIGN</BracketHeading>} subtitle="Route manifest unavailable." />
          <p className="site00-body">{error}</p>
          <button type="button" className="site00-bluprint__btn" onClick={() => void reload()}>
            RETRY SYNC
          </button>
        </div>
      </Site00PublicShell>
    );
  }

  if (!manifest) {
    return (
      <Site00PublicShell mobileActiveNav="build">
        <div className="site00-page site00-bluprint">
          <PageIntro title={<BracketHeading>DESIGN</BracketHeading>} subtitle="Loading route manifest…" />
        </div>
      </Site00PublicShell>
    );
  }

  const needsRef = buildNeedsReferenceQueue(manifest.routes, manifest.coverage);
  const needsImprove = buildNeedsImprovementQueue(manifest.routes, manifest.coverage);

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint">
        <PageIntro
          title={<BracketHeading>DESIGN</BracketHeading>}
          subtitle="Cross-project design coverage — discovered from source repo routes."
        />

        <div className="site00-bluprint__meta">
          <span>MANIFEST {syncStatus === 'SYNCED' ? 'SYNCED' : syncStatus}</span>
          <span>v{manifest.manifestVersion}</span>
          <span>{manifest.sourceCommit.slice(0, 7)}</span>
        </div>

        <section className="site00-bluprint__global">
          <h2 className="site00-bluprint__section-title">ALL PROJECTS</h2>
          <table className="site00-bluprint__table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>M</th>
                <th>T</th>
                <th>D</th>
                <th>ATTENTION</th>
              </tr>
            </thead>
            <tbody>
              {manifest.coverageSummaries.map((s) => {
                const project = manifest.projects.find((p) => p.projectId === s.projectId);
                return (
                  <tr key={s.projectId}>
                    <td>
                      <Link to={`/bluprint/projects/${s.projectId}`} className="site00-link-red">
                        {project?.displayName ?? s.projectId}
                      </Link>
                    </td>
                    <td>{s.mobile.matched}/{s.totalDesignableScreens}</td>
                    <td>{s.tablet.matched}/{s.totalDesignableScreens}</td>
                    <td>{s.desktop.matched}/{s.totalDesignableScreens}</td>
                    <td>
                      {s.needsReference} ref · {s.needsImprovement} stale · {s.brokenRoutes} broken
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="site00-bluprint__queues">
          <div>
            <h3 className="site00-bluprint__section-title">NEEDS REFERENCE ({needsRef.length})</h3>
            <ul className="site00-bluprint__queue">
              {needsRef.slice(0, 8).map((item) => (
                <li key={`${item.routeId}-${item.viewportClass}`}>
                  <Link to={`/bluprint/projects/${item.projectId}?route=${encodeURIComponent(item.routeId)}`}>
                    {item.displayName} · {item.viewportClass}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="site00-bluprint__section-title">NEEDS IMPROVEMENT ({needsImprove.length})</h3>
            <ul className="site00-bluprint__queue">
              {needsImprove.slice(0, 8).map((item) => (
                <li key={`${item.routeId}-${item.viewportClass}-imp`}>
                  {item.displayName} · {item.viewportClass} · {item.quality}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="site00-bluprint__actions">
          <Link to="/bluprint/inspect" className="site00-link-red">
            INSPECT FORENSIC DATA →
          </Link>
        </div>
      </div>
    </Site00PublicShell>
  );
}

export function BluprintProjectDesignPage() {
  const { projectId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { manifest } = useDesignRouteManifest();
  const initialVp = (searchParams.get('viewport')?.toUpperCase() ?? 'MOBILE') as ViewportClass;
  const [viewport, setViewportClass] = useState<ViewportClass>(
    VIEWPORTS.includes(initialVp) ? initialVp : 'MOBILE',
  );

  if (!manifest) return null;

  const project = manifest.projects.find((p) => p.projectId === projectId);
  const groups = groupRoutesForScreenDropdown(manifest.routes, projectId);
  const summary = manifest.coverageSummaries.find((s) => s.projectId === projectId);
  const matrix = buildCoverageMatrix(projectId, manifest.routes, manifest.coverage);

  const selectedRouteId = searchParams.get('route') ?? Object.values(groups)[0]?.[0]?.routeId ?? '';
  const selectedRoute = manifest.routes.find((r) => r.routeId === selectedRouteId);
  const coverage = manifest.coverage.find((c) => c.routeId === selectedRouteId);
  const vpKey = viewport.toLowerCase() as 'mobile' | 'tablet' | 'desktop';
  const vpAuth = coverage?.[vpKey];

  function selectRoute(routeId: string) {
    setSearchParams((prev) => {
      prev.set('route', routeId);
      return prev;
    });
  }

  function selectViewport(v: ViewportClass) {
    setViewportClass(v);
    setSearchParams((prev) => {
      prev.set('viewport', v);
      return prev;
    });
  }

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint">
        <PageIntro
          title={<BracketHeading>{project?.displayName ?? projectId}</BracketHeading>}
          subtitle="Project design coverage — routes discovered from source repo."
        />

        {summary ? (
          <div className="site00-bluprint__coverage-bar">
            <span>{summary.totalDesignableScreens} DESIGNABLE SCREENS</span>
            <span>MOBILE {summary.mobile.canonical} canonical · {summary.mobile.missing} missing</span>
            <span>TABLET {summary.tablet.canonical} canonical · {summary.tablet.missing} missing</span>
            <span>DESKTOP {summary.desktop.canonical} canonical · {summary.desktop.missing} missing</span>
          </div>
        ) : null}

        <div className="site00-bluprint__selectors">
          <label>
            SCREEN / ROUTE
            <select
              value={selectedRouteId}
              onChange={(e) => selectRoute(e.target.value)}
              className="site00-bluprint__select"
            >
              {Object.entries(groups).map(([family, routes]) => (
                <optgroup key={family} label={family}>
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.displayName} — {r.route}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div className="site00-bluprint__viewport-tabs">
            {VIEWPORTS.map((v) => (
              <button
                key={v}
                type="button"
                className={`site00-bluprint__viewport-tab${viewport === v ? ' is-active' : ''}`}
                onClick={() => selectViewport(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {selectedRoute && vpAuth ? (
          <div className="site00-bluprint__page-row">
            <div>
              <h3 className="site00-bluprint__route-name">{selectedRoute.displayName.toUpperCase()}</h3>
              <p className="site00-body">{selectedRoute.route}</p>
              <p className="site00-bluprint__status">
                {viewport}: {statusLabel(vpAuth.designStatus)}
                {vpAuth.referencePath ? ` · ${vpAuth.referencePath}` : ' · REFERENCE MISSING'}
              </p>
            </div>
            <div className="site00-bluprint__page-actions">
              {vpAuth.designStatus === 'MISSING_REFERENCE' ? (
                <>
                  <button type="button" className="site00-bluprint__btn" disabled title="Founder upload — wire in production">
                    UPLOAD
                  </button>
                  <button type="button" className="site00-bluprint__btn site00-bluprint__btn--primary" disabled title="Founder-triggered FAL generation">
                    GENERATE
                  </button>
                </>
              ) : null}
              {vpAuth.designStatus === 'STALE_AGAINST_REFERENCE' || vpAuth.referenceQuality === 'OUTDATED' ? (
                <button type="button" className="site00-bluprint__btn" disabled>
                  REPLACE
                </button>
              ) : null}
              <Link to={`/bluprint/inspect?project=${projectId}`} className="site00-link-red">
                INSPECT
              </Link>
            </div>
          </div>
        ) : null}

        <section className="site00-bluprint__matrix">
          <h3 className="site00-bluprint__section-title">COVERAGE MATRIX</h3>
          <table className="site00-bluprint__table site00-bluprint__table--matrix">
            <thead>
              <tr>
                <th>PAGE</th>
                <th>MOBILE</th>
                <th>TABLET</th>
                <th>DESKTOP</th>
              </tr>
            </thead>
            <tbody>
              {matrix.slice(0, 40).map((row) => (
                <tr key={row.routeId}>
                  <td>
                    <button type="button" className="site00-bluprint__link-btn" onClick={() => selectRoute(row.routeId)}>
                      {row.displayName}
                    </button>
                  </td>
                  <td>{row.mobile}</td>
                  <td>{row.tablet}</td>
                  <td>{row.desktop}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {matrix.length > 40 ? <p className="site00-body">+ {matrix.length - 40} more in Inspect</p> : null}
        </section>

        <Link to="/bluprint" className="site00-link-red">
          ← ALL PROJECTS
        </Link>
      </div>
    </Site00PublicShell>
  );
}


export function BluprintInspectPage() {
  const { manifest } = useDesignRouteManifest();
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project');

  if (!manifest) return null;

  const graph: ProjectRouteDependencyGraph | undefined = manifest.dependencyGraphs.find(
    (g) => g.projectId === projectFilter,
  );

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint site00-bluprint--inspect">
        <PageIntro title={<BracketHeading>INSPECT</BracketHeading>} subtitle="Raw forensic audit — route graph, evidence, manifest." />
        {graph ? (
          <section>
            <h3 className="site00-bluprint__section-title">ROUTE MAP — {projectFilter}</h3>
            <pre className="site00-bluprint__pre">
              {graph.nodes
                .filter((n) => !n.parentRouteId)
                .slice(0, 30)
                .map((n) => renderRouteTree(n, graph.nodes, 0))
                .join('\n')}
            </pre>
          </section>
        ) : null}
        <section>
          <h3 className="site00-bluprint__section-title">MANIFEST META</h3>
          <pre className="site00-bluprint__pre">{JSON.stringify({
            manifestVersion: manifest.manifestVersion,
            sourceCommit: manifest.sourceCommit,
            routes: manifest.routes.length,
            visualStates: manifest.visualStates.length,
            failures: manifest.failures,
          }, null, 2)}</pre>
        </section>
        <Link to="/bluprint" className="site00-link-red">
          ← DESIGN HUB
        </Link>
      </div>
    </Site00PublicShell>
  );
}

function renderRouteTree(
  node: ProjectPageRouteRecord,
  all: ProjectPageRouteRecord[],
  depth: number,
): string {
  const indent = '  '.repeat(depth);
  const line = `${indent}${node.displayName} (${node.routeId})`;
  const children = node.childRouteIds
    .map((id) => all.find((n) => n.routeId === id))
    .filter(Boolean)
    .map((c) => renderRouteTree(c!, all, depth + 1));
  return [line, ...children].join('\n');
}

export function BluprintDesignRoutes() {
  return (
    <Routes>
      <Route index element={<BluprintDesignHubPage />} />
      <Route path="projects/:projectId" element={<BluprintProjectDesignPage />} />
      <Route path="inspect" element={<BluprintInspectPage />} />
    </Routes>
  );
}
