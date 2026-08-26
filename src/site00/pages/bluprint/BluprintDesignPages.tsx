import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { useDesignRouteManifest } from '../../hooks/useDesignRouteManifest';
import {
  buildCoverageMatrix,
  buildNeedsImprovementQueue,
  buildNeedsReferenceQueue,
  buildPossibleDeadRouteQueue,
  buildReferencePolicyReviewQueue,
  groupDesignFamiliesForDropdown,
  groupDesignScreensForDropdown,
  groupCompiledPagesForSelector,
  necessityBadge,
  pageStatusBadge,
  resolveEffectiveDesignReference,
  buildReferenceBatchPreview,
} from '../../../studio-os-core/route-intelligence/browser';
import type {
  ViewportClass,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  CompiledWebsitePageRecord,
  RequiredWebsitePageRecord,
  StudioWorldDesignRouteManifest,
} from '../../../studio-os-core/route-intelligence/types';
import '../../styles/site00-bluprint.css';

const VIEWPORTS: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];

function rawRoutes(manifest: StudioWorldDesignRouteManifest): ProjectPageRouteRecord[] {
  return manifest.rawImplementationRoutes ?? manifest.routes;
}

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

  const designScreens = manifest.designScreens ?? [];
  const needsRef = buildNeedsReferenceQueue(
    designScreens,
    manifest.coverage,
    manifest.referenceNecessityAudits,
    manifest.designFamilies,
    manifest.screenReferenceInheritances,
    manifest.familyReferenceAuthorities,
  );
  const needsImprove = buildNeedsImprovementQueue(designScreens, manifest.coverage);
  const policyReview = buildReferencePolicyReviewQueue(manifest.referenceNecessityAudits ?? []);
  const totalFamilies = manifest.designFamilies?.length ?? 0;
  const totalSavings = (manifest.referenceGenerationSavings ?? []).reduce(
    (acc, s) => acc + s.generationRequestsAvoided,
    0,
  );

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint">
        <PageIntro
          title={<BracketHeading>DESIGN</BracketHeading>}
          subtitle="Website page universe — compiled customer experience (raw routes in Inspect)."
        />

        <div className="site00-bluprint__meta">
          <span>MANIFEST {syncStatus === 'SYNCED' ? 'SYNCED' : syncStatus}</span>
          <span>v{manifest.manifestVersion}</span>
          <span>{manifest.schemaVersion}</span>
          <span>{designScreens.length} screens · {totalFamilies} families</span>
          <span>{manifest.projectPageSets?.reduce((n, ps) => n + ps.summary.totalPrimaryPages, 0) ?? 0} primary pages</span>
          <span>{totalSavings} generation jobs avoided</span>
          <span>{manifest.sourceCommit.slice(0, 7)}</span>
        </div>

        <section className="site00-bluprint__global">
          <h2 className="site00-bluprint__section-title">ALL PROJECTS</h2>
          <table className="site00-bluprint__table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>PRIMARY PAGES</th>
                <th>MISSING</th>
                <th>SCREENS</th>
                <th>FAMILIES</th>
                <th>M</th>
                <th>T</th>
                <th>D</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {manifest.coverageSummaries.map((s) => {
                const project = manifest.projects.find((p) => p.projectId === s.projectId);
                const pageSet = manifest.projectPageSets?.find((ps) => ps.projectId === s.projectId);
                return (
                  <tr key={s.projectId}>
                    <td>
                      <Link to={`/bluprint/projects/${s.projectId}`} className="site00-link-red">
                        {project?.displayName ?? s.projectId}
                      </Link>
                    </td>
                    <td>{pageSet?.summary.totalPrimaryPages ?? '—'}</td>
                    <td>{pageSet?.summary.missing ?? '—'}</td>
                    <td>{s.totalDesignableScreens}</td>
                    <td>{s.designFamilies ?? '—'}</td>
                    <td>{s.mobile.matched}/{s.totalDesignableScreens}</td>
                    <td>{s.tablet.matched}/{s.totalDesignableScreens}</td>
                    <td>{s.desktop.matched}/{s.totalDesignableScreens}</td>
                    <td>{pageSet?.status ?? '—'}</td>
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
                <li key={`${item.designScreenId ?? item.routeId}-${item.viewportClass}`}>
                  <Link
                    to={`/bluprint/projects/${item.projectId}?screen=${encodeURIComponent(item.designScreenId ?? item.routeId)}`}
                  >
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
          <div>
            <h3 className="site00-bluprint__section-title">REFERENCE POLICY REVIEW ({policyReview.length})</h3>
            <ul className="site00-bluprint__queue">
              {policyReview.slice(0, 6).map((item) => (
                <li key={`${item.designScreenId}-${item.viewportClass}-review`}>
                  {item.reason.slice(0, 60)}…
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="site00-bluprint__actions">
          <Link to="/bluprint/inspect" className="site00-link-red">
            INSPECT ROUTE FORENSICS →
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
  const pageSet = manifest.projectPageSets?.find((ps) => ps.projectId === projectId);
  const designScreens = (manifest.designScreens ?? []).filter((s) => s.projectId === projectId);
  const designFamilies = (manifest.designFamilies ?? []).filter((f) => f.projectId === projectId);
  const familyGroups = groupDesignFamiliesForDropdown(manifest.designFamilies ?? [], projectId);
  const screenGroups = groupDesignScreensForDropdown(manifest.designScreens ?? [], projectId);
  const summary = manifest.coverageSummaries.find((s) => s.projectId === projectId);
  const matrix = buildCoverageMatrix(projectId, designScreens, manifest.coverage, manifest.referenceNecessityAudits);

  const experienceMode = searchParams.get('mode') === 'all' ? 'ALL_DESIGNABLE' : 'PRIMARY';
  const viewMode =
    searchParams.get('view') === 'journey'
      ? 'journey'
      : searchParams.get('view') === 'families'
        ? 'families'
        : searchParams.get('view') === 'screens'
          ? 'screens'
          : 'pages';

  const pageGroups = pageSet
    ? groupCompiledPagesForSelector(pageSet, experienceMode === 'PRIMARY' ? 'PRIMARY' : 'ALL_DESIGNABLE')
    : {};
  const flatPages = Object.values(pageGroups).flat();
  const defaultPageId = flatPages[0]?.pageId ?? designScreens[0]?.designScreenId ?? '';

  const selectedPageId = searchParams.get('page') ?? searchParams.get('screen') ?? defaultPageId;
  const selectedFamilyId = searchParams.get('family') ?? designFamilies[0]?.designFamilyId ?? '';

  const selectedPage = pageSet?.compiledPages.find((p) => p.pageId === selectedPageId);
  const selectedScreen =
    designScreens.find((s) => s.designScreenId === (selectedPage?.designScreenId ?? selectedPageId)) ??
    designScreens.find((s) => s.designScreenId === selectedPageId);
  const selectedFamily = designFamilies.find((f) => f.designFamilyId === selectedFamilyId);
  const selectedScreenId = selectedPage?.designScreenId ?? selectedScreen?.designScreenId ?? selectedPageId;
  const coverage = manifest.coverage.find((c) => c.routeId === selectedScreenId);
  const vpKey = viewport.toLowerCase() as 'mobile' | 'tablet' | 'desktop';
  const vpAuth = coverage?.[vpKey];

  const screenNecessity = manifest.referenceNecessityAudits?.find(
    (a) => a.designScreenId === selectedScreenId && a.viewportClass === viewport,
  );
  const effectiveRef =
    selectedScreen && manifest.referenceNecessityAudits
      ? resolveEffectiveDesignReference({
          projectId,
          designScreenId: selectedScreenId,
          viewportClass: viewport,
          necessityAudits: manifest.referenceNecessityAudits,
          inheritances: manifest.screenReferenceInheritances ?? [],
          familyAuthorities: manifest.familyReferenceAuthorities ?? [],
          families: manifest.designFamilies ?? [],
        })
      : null;

  const batchPreview = buildReferenceBatchPreview(
    projectId,
    viewport,
    designScreens.map((s) => s.designScreenId),
    undefined,
    {
      necessityAudits: manifest.referenceNecessityAudits,
      designFamilies: manifest.designFamilies,
      designScreensCovered: designScreens.length,
    },
  );

  function setExperienceMode(mode: 'PRIMARY' | 'ALL_DESIGNABLE') {
    setSearchParams((prev) => {
      prev.set('mode', mode === 'ALL_DESIGNABLE' ? 'all' : 'primary');
      return prev;
    });
  }

  function setViewMode(mode: 'pages' | 'journey' | 'screens' | 'families') {
    setSearchParams((prev) => {
      prev.set('view', mode);
      return prev;
    });
  }

  function selectFamily(designFamilyId: string) {
    setSearchParams((prev) => {
      prev.set('family', designFamilyId);
      prev.set('view', 'families');
      return prev;
    });
  }

  function selectPage(pageId: string) {
    setSearchParams((prev) => {
      prev.set('page', pageId);
      prev.delete('screen');
      prev.set('view', 'pages');
      return prev;
    });
  }

  function selectScreen(designScreenId: string) {
    setSearchParams((prev) => {
      prev.set('screen', designScreenId);
      prev.delete('page');
      prev.set('view', 'screens');
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

  const vpStatusKey = `${viewport.toLowerCase()}Status` as 'mobileStatus' | 'tabletStatus' | 'desktopStatus';
  const pageVpStatus = selectedPage?.[vpStatusKey];

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint">
        <PageIntro
          title={<BracketHeading>{project?.displayName ?? projectId}</BracketHeading>}
          subtitle="Compiled website experience — page sets, not raw routes."
        />

        {pageSet ? (
          <div className="site00-bluprint__coverage-bar">
            <span>{pageSet.summary.totalPrimaryPages} PRIMARY PAGES</span>
            <span>{pageSet.supportingPageIds.length} SUPPORTING</span>
            <span>{pageSet.summary.missing} MISSING</span>
            <span>{pageSet.summary.internalExcluded} INTERNAL EXCLUDED</span>
            <span>{pageSet.summary.referenceMissing} NEED REF</span>
            <span>{pageSet.status}</span>
          </div>
        ) : summary ? (
          <div className="site00-bluprint__coverage-bar">
            <span>{summary.totalDesignableScreens} DESIGN SCREENS</span>
            <span>{summary.designFamilies ?? designFamilies.length} DESIGN FAMILIES</span>
          </div>
        ) : null}

        <div className="site00-bluprint__viewport-tabs">
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${experienceMode === 'PRIMARY' ? ' is-active' : ''}`}
            onClick={() => setExperienceMode('PRIMARY')}
          >
            PRIMARY EXPERIENCE
          </button>
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${experienceMode === 'ALL_DESIGNABLE' ? ' is-active' : ''}`}
            onClick={() => setExperienceMode('ALL_DESIGNABLE')}
          >
            ALL DESIGNABLE
          </button>
        </div>

        <div className="site00-bluprint__viewport-tabs">
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${viewMode === 'pages' ? ' is-active' : ''}`}
            onClick={() => setViewMode('pages')}
          >
            WEBSITE PAGES
          </button>
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${viewMode === 'journey' ? ' is-active' : ''}`}
            onClick={() => setViewMode('journey')}
          >
            CUSTOMER JOURNEY
          </button>
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${viewMode === 'families' ? ' is-active' : ''}`}
            onClick={() => setViewMode('families')}
          >
            DESIGN FAMILIES
          </button>
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${viewMode === 'screens' ? ' is-active' : ''}`}
            onClick={() => setViewMode('screens')}
          >
            RAW SCREENS
          </button>
        </div>

        <div className="site00-bluprint__selectors">
          {viewMode === 'pages' && pageSet ? (
            <label>
              PAGE / SCREEN
              <select
                value={selectedPageId}
                onChange={(e) => selectPage(e.target.value)}
                className="site00-bluprint__select"
              >
                {Object.entries(pageGroups).map(([group, pages]) => (
                  <optgroup key={group} label={group}>
                    {pages.map((p) => (
                      <option key={p.pageId} value={p.pageId}>
                        {p.displayName}
                        {p.instanceCount > 1 ? ` (${p.instanceCount} instances)` : ''}
                        {' — '}
                        {pageStatusBadge(p.compiledStatus)}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {pageSet.missingPages.length > 0 ? (
                  <optgroup label="MISSING REQUIRED">
                    {pageSet.missingPages.map((m) => (
                      <option key={m.pageId} value={m.pageId} disabled>
                        {m.displayName} — IMPLEMENTATION MISSING
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
            </label>
          ) : null}

          {viewMode === 'families' ? (
            <label>
              FAMILY
              <select
                value={selectedFamilyId}
                onChange={(e) => selectFamily(e.target.value)}
                className="site00-bluprint__select"
              >
                {Object.entries(familyGroups).map(([family, fams]) => (
                  <optgroup key={family} label={family}>
                    {fams.map((f) => (
                      <option key={f.designFamilyId} value={f.designFamilyId}>
                        {f.displayName} ({f.memberDesignScreenIds.length} screens)
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ) : null}

          {viewMode === 'screens' ? (
            <label>
              SCREEN
              <select
                value={selectedScreenId}
                onChange={(e) => selectScreen(e.target.value)}
                className="site00-bluprint__select"
              >
                {Object.entries(screenGroups).map(([family, screens]) => (
                  <optgroup key={family} label={family}>
                    {screens.map((s) => (
                      <option key={s.designScreenId} value={s.designScreenId}>
                        {s.displayName}
                        {s.instanceCount > 1 ? ` (${s.instanceCount} instances)` : ''}
                        {' — '}
                        {s.representativeRoute}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ) : null}

          {viewMode !== 'journey' ? (
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
          ) : null}
        </div>

        {viewMode === 'journey' && pageSet ? (
          <section className="site00-bluprint__matrix">
            <h3 className="site00-bluprint__section-title">CUSTOMER JOURNEY</h3>
            <div className="site00-bluprint__journey">
              {pageSet.journeyIndex.stages.map((stage) => (
                <div key={stage.stage} className="site00-bluprint__journey-stage">
                  <strong>{stage.stage}</strong>
                  <span>
                    {stage.pageIds
                      .map((id) => pageSet.compiledPages.find((p) => p.pageId === id)?.displayName ?? id)
                      .join(' → ')}
                  </span>
                </div>
              ))}
            </div>
            {pageSet.deadEndAudits.length > 0 ? (
              <div className="site00-bluprint__dead-ends">
                <h4>DEAD-END FLOWS</h4>
                <ul>
                  {pageSet.deadEndAudits.map((d) => (
                    <li key={d.flowId}>
                      [{d.severity}] {d.flowLabel}: {d.deadEndRoute} → missing {d.missingTerminal}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {selectedPage && viewMode === 'pages' ? (
          <CompiledPageCard
            page={selectedPage}
            viewport={viewport}
            vpAuth={vpAuth}
            screenNecessity={screenNecessity}
            effectiveRef={effectiveRef}
            pageVpStatus={pageVpStatus}
            projectId={projectId}
          />
        ) : null}

        {selectedFamily && viewMode === 'families' ? (
          <div className="site00-bluprint__page-row">
            <div>
              <h3 className="site00-bluprint__route-name">{selectedFamily.displayName.toUpperCase()}</h3>
              <p className="site00-body">{selectedFamily.memberDesignScreenIds.length} member screens</p>
              <p className="site00-body">Rep: {selectedFamily.representativeRoute}</p>
              <p className="site00-body">Confidence: {selectedFamily.confidence}</p>
              <p className="site00-bluprint__status">Policy: {selectedFamily.referencePolicy.replace(/_/g, ' ')}</p>
            </div>
          </div>
        ) : null}

        {selectedScreen && vpAuth && viewMode === 'screens' ? (
          <div className="site00-bluprint__page-row">
            <div>
              <h3 className="site00-bluprint__route-name">{selectedScreen.displayName.toUpperCase()}</h3>
              <p className="site00-body">{selectedScreen.representativeRoute}</p>
              {selectedScreen.instanceCount > 1 ? (
                <p className="site00-body">Instances: {selectedScreen.instanceCount} shared shell</p>
              ) : null}
              {screenNecessity ? (
                <p className="site00-bluprint__status">
                  REFERENCE POLICY · {necessityBadge(screenNecessity.classification)} · {viewport}
                  {effectiveRef?.authorityLevel === 'FAMILY_REFERENCE'
                    ? ` · INHERITS: ${selectedScreen.designFamilyId?.split(':').pop()}`
                    : ''}
                </p>
              ) : null}
              <p className="site00-bluprint__status">
                {viewport}: {statusLabel(vpAuth.designStatus)}
                {vpAuth.referencePath ? ` · ${vpAuth.referencePath}` : ' · REFERENCE MISSING'}
              </p>
            </div>
            <div className="site00-bluprint__page-actions">
              {vpAuth.designStatus === 'MISSING_REFERENCE' ? (
                <>
                  <button type="button" className="site00-bluprint__btn" disabled title="Founder upload">
                    UPLOAD
                  </button>
                  <button type="button" className="site00-bluprint__btn site00-bluprint__btn--primary" disabled title="Founder-triggered FAL">
                    GENERATE
                  </button>
                </>
              ) : null}
              <Link to={`/bluprint/inspect?project=${projectId}`} className="site00-link-red">
                INSPECT
              </Link>
            </div>
          </div>
        ) : null}

        {viewMode === 'pages' && pageSet && pageSet.missingPages.length > 0 ? (
          <section className="site00-bluprint__matrix">
            <h3 className="site00-bluprint__section-title">MISSING PAGES ({pageSet.missingPages.length})</h3>
            <div className="site00-bluprint__missing-grid">
              {pageSet.missingPages.map((m) => (
                <MissingPageCard key={m.pageId} page={m} />
              ))}
            </div>
          </section>
        ) : null}

        {viewMode === 'pages' && pageSet ? (
          <section className="site00-bluprint__matrix">
            <h3 className="site00-bluprint__section-title">PAGE CARDS</h3>
            <div className="site00-bluprint__page-grid">
              {(experienceMode === 'PRIMARY'
                ? pageSet.compiledPages.filter((p) => p.isPrimaryExperience)
                : pageSet.compiledPages
              )
                .slice(0, 24)
                .map((p) => (
                  <button
                    key={p.pageId}
                    type="button"
                    className={`site00-bluprint__page-card${p.pageId === selectedPageId ? ' is-selected' : ''}`}
                    onClick={() => selectPage(p.pageId)}
                  >
                    <strong>{p.displayName}</strong>
                    <span>{p.experienceGroup}</span>
                    <span>{p.representativeRoute}</span>
                    <span>{pageStatusBadge(p.compiledStatus)}</span>
                    <span>M:{pageStatusBadge(p.mobileStatus)} T:{pageStatusBadge(p.tabletStatus)} D:{pageStatusBadge(p.desktopStatus)}</span>
                    {p.captureEligible ? <span className="site00-bluprint__capture-badge">CAPTURE ELIGIBLE</span> : null}
                  </button>
                ))}
            </div>
          </section>
        ) : null}

        <section className="site00-bluprint__matrix">
          <h3 className="site00-bluprint__section-title">BATCH GENERATION PREVIEW</h3>
          <p className="site00-body">
            DESIGN SCREENS COVERED: {batchPreview.designScreensCovered} · REFERENCES TO GENERATE:{' '}
            {batchPreview.requestCount} · AVOIDED: {batchPreview.generationRequestsAvoided}
          </p>
        </section>

        {viewMode === 'screens' ? (
          <section className="site00-bluprint__matrix">
            <h3 className="site00-bluprint__section-title">COVERAGE MATRIX</h3>
            <table className="site00-bluprint__table site00-bluprint__table--matrix">
              <thead>
                <tr>
                  <th>SCREEN</th>
                  <th>MOBILE</th>
                  <th>TABLET</th>
                  <th>DESKTOP</th>
                </tr>
              </thead>
              <tbody>
                {matrix.slice(0, 40).map((row) => (
                  <tr key={row.designScreenId}>
                    <td>
                      <button
                        type="button"
                        className="site00-bluprint__link-btn"
                        onClick={() => selectScreen(row.designScreenId)}
                      >
                        {row.displayName}
                        {row.instanceCount > 1 ? ` (${row.instanceCount})` : ''}
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
        ) : null}

        <Link to="/bluprint" className="site00-link-red">
          ← ALL PROJECTS
        </Link>
      </div>
    </Site00PublicShell>
  );
}

function CompiledPageCard({
  page,
  viewport,
  vpAuth,
  screenNecessity,
  effectiveRef,
  pageVpStatus,
  projectId,
}: {
  page: CompiledWebsitePageRecord;
  viewport: ViewportClass;
  vpAuth?: { designStatus: string; referencePath?: string };
  screenNecessity?: { classification: string };
  effectiveRef?: { authorityLevel: string } | null;
  pageVpStatus?: string;
  projectId: string;
}) {
  return (
    <div className="site00-bluprint__page-row">
      <div>
        <h3 className="site00-bluprint__route-name">{page.displayName.toUpperCase()}</h3>
        <p className="site00-body">{page.representativeRoute}</p>
        <p className="site00-body">
          {page.experienceGroup} · {page.experienceClassification.replace(/_/g, ' ')} · {page.priority}
        </p>
        {page.instanceCount > 1 ? (
          <p className="site00-body">Instances: {page.instanceCount} shared shell</p>
        ) : null}
        {screenNecessity ? (
          <p className="site00-bluprint__status">
            REFERENCE POLICY · {necessityBadge(screenNecessity.classification as import('../../../studio-os-core/route-intelligence/types').ReferenceNecessityClassification)} · {viewport}
            {effectiveRef?.authorityLevel === 'FAMILY_REFERENCE' ? ' · FAMILY REFERENCE' : ''}
          </p>
        ) : null}
        <p className="site00-bluprint__status">
          STATUS · {pageStatusBadge(page.compiledStatus)} · {viewport}: {pageVpStatus ? pageStatusBadge(pageVpStatus as import('../../../studio-os-core/route-intelligence/types').CompiledPageStatus) : '—'}
        </p>
        {vpAuth ? (
          <p className="site00-bluprint__status">
            CURRENT · {statusLabel(vpAuth.designStatus)}
            {vpAuth.referencePath ? ` · ${vpAuth.referencePath}` : ' · SCREENSHOT/REF MISSING'}
          </p>
        ) : null}
        {page.captureEligible ? (
          <p className="site00-body">Screenshot capture eligible · auth: {page.authContext ?? 'anonymous'}</p>
        ) : null}
      </div>
      <div className="site00-bluprint__page-actions">
        {page.compiledStatus === 'REFERENCE_MISSING' || vpAuth?.designStatus === 'MISSING_REFERENCE' ? (
          <>
            <button type="button" className="site00-bluprint__btn" disabled title="Founder upload">
              CREATE REFERENCE
            </button>
            <button type="button" className="site00-bluprint__btn site00-bluprint__btn--primary" disabled title="Founder-triggered FAL">
              GENERATE
            </button>
          </>
        ) : null}
        <Link to={`/bluprint/inspect?project=${projectId}`} className="site00-link-red">
          INSPECT
        </Link>
      </div>
    </div>
  );
}

function MissingPageCard({ page }: { page: RequiredWebsitePageRecord }) {
  return (
    <div className="site00-bluprint__missing-card">
      <strong>{page.displayName}</strong>
      <span>WHY: {page.parentFlow}</span>
      <span>ROUTE: {page.suggestedRoute}</span>
      <span>{page.priority} · {page.experienceClassification.replace(/_/g, ' ')}</span>
      <button type="button" className="site00-bluprint__btn" disabled title="Design before implementation">
        CREATE REFERENCE
      </button>
    </div>
  );
}

export function BluprintInspectPage() {
  const { manifest } = useDesignRouteManifest();
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project');

  if (!manifest) return null;

  const routes = projectFilter
    ? rawRoutes(manifest).filter((r) => r.projectId === projectFilter)
    : rawRoutes(manifest);
  const deadQueue = buildPossibleDeadRouteQueue(routes);
  const graph: ProjectRouteDependencyGraph | undefined = manifest.dependencyGraphs.find(
    (g) => g.projectId === projectFilter,
  );
  const reachSummary = projectFilter
    ? manifest.reachabilitySummaries?.find((r) => r.projectId === projectFilter)
    : null;

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint site00-bluprint--inspect">
        <PageIntro
          title={<BracketHeading>INSPECT</BracketHeading>}
          subtitle="Raw implementation routes, reachability evidence, route map."
        />
        {reachSummary ? (
          <section>
            <h3 className="site00-bluprint__section-title">REACHABILITY — {projectFilter}</h3>
            <pre className="site00-bluprint__pre">{JSON.stringify(reachSummary, null, 2)}</pre>
          </section>
        ) : null}
        {projectFilter && manifest.designFamilies ? (
          <section>
            <h3 className="site00-bluprint__section-title">DESIGN FAMILIES — {projectFilter}</h3>
            <pre className="site00-bluprint__pre">
              {manifest.designFamilies
                .filter((f) => f.projectId === projectFilter)
                .slice(0, 15)
                .map(
                  (f) =>
                    `${f.displayName} [${f.confidence}] ${f.memberDesignScreenIds.length} screens — ${f.groupingReason}`,
                )
                .join('\n')}
            </pre>
          </section>
        ) : null}
        {graph ? (
          <section>
            <h3 className="site00-bluprint__section-title">ROUTE MAP — {projectFilter}</h3>
            <pre className="site00-bluprint__pre">
              {graph.nodes
                .filter((n) => !n.parentRouteId)
                .slice(0, 20)
                .map((n) => renderRouteTree(n, graph.nodes, 0))
                .join('\n')}
            </pre>
          </section>
        ) : null}
        <section>
          <h3 className="site00-bluprint__section-title">POSSIBLE DEAD ROUTES ({deadQueue.length})</h3>
          <pre className="site00-bluprint__pre">
            {deadQueue.slice(0, 30).map((d) => `${d.route} — ${d.reachabilityClassification}`).join('\n') || 'None'}
          </pre>
        </section>
        <section>
          <h3 className="site00-bluprint__section-title">MANIFEST META</h3>
          <pre className="site00-bluprint__pre">
            {JSON.stringify(
              {
                manifestVersion: manifest.manifestVersion,
                schemaVersion: manifest.schemaVersion,
                sourceCommit: manifest.sourceCommit,
                rawImplementationRoutes: rawRoutes(manifest).length,
                designScreens: manifest.designScreens?.length ?? 0,
                routeTemplates: manifest.routeTemplates?.length ?? 0,
                visualStates: manifest.visualStates.length,
                failures: manifest.failures,
              },
              null,
              2,
            )}
          </pre>
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
  const reach = node.reachabilityClassification ?? 'UNKNOWN';
  const line = `${indent}${node.displayName} [${reach}] (${node.route})`;
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
