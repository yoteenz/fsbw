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
  groupExperiencePagesForSelector,
  listCaptureAllTargets,
  isDesignScreenCaptureScope,
  necessityBadge,
  pageStatusBadge,
  resolveEffectiveDesignReference,
  buildReferenceBatchPreview,
} from '../../../studio-os-core/route-intelligence/browser';
import type {
  ViewportClass,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  ExperiencePageRecord,
  MaterialScreenRecord,
  ExperiencePageInstanceRecord,
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
          <span>{manifest.projectPageSets?.reduce((n, ps) => n + (ps.experienceMetrics?.afterExperiencePages ?? ps.summary.totalPrimaryPages), 0) ?? 0} experience pages</span>
          <span>{totalSavings} generation jobs avoided</span>
          <span>{manifest.sourceCommit.slice(0, 7)}</span>
        </div>

        <section className="site00-bluprint__global">
          <h2 className="site00-bluprint__section-title">ALL PROJECTS</h2>
          <table className="site00-bluprint__table">
            <thead>
              <tr>
                <th>PROJECT</th>
                <th>EXPERIENCE PAGES</th>
                <th>VR3F→3G</th>
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
                    <td>{pageSet?.experienceMetrics?.afterExperiencePages ?? pageSet?.summary.totalPrimaryPages ?? '—'}</td>
                    <td>
                      {pageSet?.experienceMetrics
                        ? `${pageSet.experienceMetrics.beforeVr3fPrimary}→${pageSet.experienceMetrics.afterExperiencePages} (-${pageSet.experienceMetrics.reductionPercent}%)`
                        : '—'}
                    </td>
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

  const experienceMode =
    searchParams.get('mode') === 'workspace'
      ? 'WORKSPACE'
      : searchParams.get('mode') === 'all'
        ? 'ALL_DESIGNABLE'
        : 'PRIMARY';
  const viewMode =
    searchParams.get('view') === 'journey'
      ? 'journey'
      : searchParams.get('view') === 'families'
        ? 'families'
        : searchParams.get('view') === 'screens'
          ? 'screens'
          : 'experience';

  const experienceGroups = pageSet
    ? groupExperiencePagesForSelector(
        pageSet,
        experienceMode === 'PRIMARY' ? 'PRIMARY' : experienceMode === 'WORKSPACE' ? 'WORKSPACE' : 'ALL_DESIGNABLE',
      )
    : {};
  const flatExperience = Object.values(experienceGroups).flat();
  const defaultXpId = flatExperience[0]?.experiencePageId ?? designScreens[0]?.designScreenId ?? '';

  const selectedXpId = searchParams.get('xp') ?? searchParams.get('page') ?? defaultXpId;
  const selectedFamilyId = searchParams.get('family') ?? designFamilies[0]?.designFamilyId ?? '';
  const selectedMaterialId = searchParams.get('material') ?? '';

  const selectedXp = pageSet?.experiencePages?.find((p) => p.experiencePageId === selectedXpId);
  const selectedMaterial = pageSet?.materialScreens?.find((m) => m.materialScreenId === selectedMaterialId);
  const selectedScreenId = selectedMaterial?.memberDesignScreenIds[0] ?? selectedXp?.representativeScreenId ?? selectedXpId;
  const selectedScreen = designScreens.find((s) => s.designScreenId === selectedScreenId);
  const selectedFamily = designFamilies.find((f) => f.designFamilyId === selectedFamilyId);
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

  const captureScope = pageSet
    ? listCaptureAllTargets({
        projectId,
        experiencePageIds: (pageSet.experiencePages ?? []).filter((p) => p.captureEligible).map((p) => p.experiencePageId),
        materialScreenIds: (pageSet.materialScreens ?? []).filter((m) => m.captureEligible).map((m) => m.materialScreenId),
        instancesExcludedByDefault: true,
        statesExcludedByDefault: true,
        advancedActions: ['CAPTURE_ALL_INSTANCES', 'CAPTURE_ALL_STATES', 'CAPTURE_RAW_DESIGN_SCREENS'],
      })
    : [];

  const batchPreview = buildReferenceBatchPreview(
    projectId,
    viewport,
    captureScope.length > 0 ? captureScope : designScreens.map((s) => s.designScreenId).slice(0, 20),
    undefined,
    {
      necessityAudits: manifest.referenceNecessityAudits,
      designFamilies: manifest.designFamilies,
      designScreensCovered: captureScope.length || flatExperience.length,
    },
  );

  function setExperienceMode(mode: 'PRIMARY' | 'ALL_DESIGNABLE' | 'WORKSPACE') {
    setSearchParams((prev) => {
      prev.set('mode', mode === 'ALL_DESIGNABLE' ? 'all' : mode === 'WORKSPACE' ? 'workspace' : 'primary');
      return prev;
    });
  }

  function setViewMode(mode: 'experience' | 'journey' | 'screens' | 'families') {
    setSearchParams((prev) => {
      prev.set('view', mode);
      return prev;
    });
  }

  function selectExperiencePage(experiencePageId: string) {
    setSearchParams((prev) => {
      prev.set('xp', experiencePageId);
      prev.delete('page');
      prev.delete('screen');
      prev.delete('material');
      prev.set('view', 'experience');
      return prev;
    });
  }

  function selectMaterial(materialScreenId: string) {
    setSearchParams((prev) => {
      prev.set('material', materialScreenId);
      prev.set('view', 'experience');
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

  function selectFamily(designFamilyId: string) {
    setSearchParams((prev) => {
      prev.set('family', designFamilyId);
      prev.set('view', 'families');
      return prev;
    });
  }

  const xpInstances = (pageSet?.pageInstances ?? []).filter((i) => i.experiencePageId === selectedXpId);
  const xpMaterials = (pageSet?.materialScreens ?? []).filter((m) => m.experiencePageId === selectedXpId);

  return (
    <Site00PublicShell mobileActiveNav="build">
      <div className="site00-page site00-bluprint">
        <PageIntro
          title={<BracketHeading>{project?.displayName ?? projectId}</BracketHeading>}
          subtitle="Experience pages — curated visual experiences, not raw routes."
        />

        {pageSet?.experienceMetrics ? (
          <div className="site00-bluprint__coverage-bar">
            <span>{pageSet.experienceMetrics.afterExperiencePages} EXPERIENCE PAGES</span>
            <span>VR3F {pageSet.experienceMetrics.beforeVr3fPrimary} → 3G {pageSet.experienceMetrics.afterExperiencePages} (-{pageSet.experienceMetrics.reductionPercent}%)</span>
            <span>{pageSet.experienceMetrics.materialScreens} MATERIAL SCREENS</span>
            <span>{pageSet.experienceMetrics.instances} INSTANCES</span>
            <span>{pageSet.experienceMetrics.workspacePages} WORKSPACE</span>
            <span>{pageSet.status}</span>
          </div>
        ) : pageSet ? (
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
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${experienceMode === 'WORKSPACE' ? ' is-active' : ''}`}
            onClick={() => setExperienceMode('WORKSPACE')}
          >
            INTERNAL / WORKSPACE
          </button>
        </div>

        <div className="site00-bluprint__viewport-tabs">
          <button
            type="button"
            className={`site00-bluprint__viewport-tab${viewMode === 'experience' ? ' is-active' : ''}`}
            onClick={() => setViewMode('experience')}
          >
            EXPERIENCE PAGES
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
          {viewMode === 'experience' && pageSet ? (
            <label>
              SECTION → PAGE
              <select
                value={selectedXpId}
                onChange={(e) => selectExperiencePage(e.target.value)}
                className="site00-bluprint__select"
              >
                {Object.entries(experienceGroups).map(([section, pages]) => (
                  <optgroup key={section} label={section}>
                    {pages.map((p) => (
                      <option key={p.experiencePageId} value={p.experiencePageId}>
                        {p.displayName}
                        {p.routeNodeCount > 1 ? ` (${p.routeNodeCount} routes)` : ''}
                        {' — '}
                        {pageStatusBadge(p.referenceStatus)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          ) : null}

          {viewMode === 'experience' && xpMaterials.length > 0 ? (
            <label>
              MATERIAL SCREEN
              <select
                value={selectedMaterialId}
                onChange={(e) => selectMaterial(e.target.value)}
                className="site00-bluprint__select"
              >
                <option value="">— page representative —</option>
                {xpMaterials.map((m) => (
                  <option key={m.materialScreenId} value={m.materialScreenId}>
                    {m.displayName} ({m.stepType})
                  </option>
                ))}
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
                      .map((id) => pageSet.experiencePages?.find((p) => p.experiencePageId === id)?.displayName ?? id)
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

        {selectedXp && viewMode === 'experience' ? (
          <ExperiencePageCard
            page={selectedXp}
            material={selectedMaterial}
            instances={xpInstances}
            viewport={viewport}
            vpAuth={vpAuth}
            screenNecessity={screenNecessity}
            effectiveRef={effectiveRef}
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

        {viewMode === 'experience' && pageSet ? (
          <section className="site00-bluprint__matrix">
            <h3 className="site00-bluprint__section-title">EXPERIENCE INDEX</h3>
            <p className="site00-body">
              CAPTURE ALL targets {captureScope.length} experience pages/material screens
              {isDesignScreenCaptureScope({ projectId, experiencePageIds: captureScope, materialScreenIds: [], instancesExcludedByDefault: true, statesExcludedByDefault: true, advancedActions: [] }) ? '' : ' (not all design screens)'}
            </p>
            <div className="site00-bluprint__page-grid">
              {flatExperience.slice(0, 32).map((p) => (
                <button
                  key={p.experiencePageId}
                  type="button"
                  className={`site00-bluprint__page-card${p.experiencePageId === selectedXpId ? ' is-selected' : ''}`}
                  onClick={() => selectExperiencePage(p.experiencePageId)}
                >
                  <strong>{p.displayName}</strong>
                  <span>{p.experienceType.replace(/_/g, ' ')}</span>
                  <span>{p.representativeRoute}</span>
                  <span>{pageStatusBadge(p.referenceStatus)} · {necessityBadge(p.referencePolicy)}</span>
                  {p.instanceIds.length > 0 ? <span>{p.instanceIds.length} INSTANCES</span> : null}
                  {p.materialScreenIds.length > 0 ? <span>{p.materialScreenIds.length} MATERIAL SCREENS</span> : null}
                  {p.routeNodeCount > 1 ? <span>{p.routeNodeCount} ROUTE NODES</span> : null}
                  {p.captureEligible ? <span className="site00-bluprint__capture-badge">CAPTURE ELIGIBLE</span> : null}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="site00-bluprint__matrix">
          <h3 className="site00-bluprint__section-title">BATCH GENERATION PREVIEW (EXPERIENCE SCOPE)</h3>
          <p className="site00-body">
            EXPERIENCE TARGETS: {batchPreview.designScreensCovered} · REFERENCES TO GENERATE:{' '}
            {batchPreview.requestCount} · AVOIDED: {batchPreview.generationRequestsAvoided}
          </p>
          <p className="site00-body">
            Advanced: CAPTURE ALL INSTANCES · CAPTURE ALL STATES · CAPTURE RAW DESIGN SCREENS (Inspect)
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

function ExperiencePageCard({
  page,
  material,
  instances,
  viewport,
  vpAuth,
  screenNecessity,
  effectiveRef,
  projectId,
}: {
  page: ExperiencePageRecord;
  material?: MaterialScreenRecord;
  instances: ExperiencePageInstanceRecord[];
  viewport: ViewportClass;
  vpAuth?: { designStatus: string; referencePath?: string };
  screenNecessity?: { classification: string };
  effectiveRef?: { authorityLevel: string } | null;
  projectId: string;
}) {
  return (
    <div className="site00-bluprint__page-row">
      <div>
        <h3 className="site00-bluprint__route-name">{page.displayName.toUpperCase()}</h3>
        <p className="site00-body">{material?.representativeRoute ?? page.representativeRoute}</p>
        <p className="site00-body">
          {page.experienceType.replace(/_/g, ' ')} · {page.priority} · confidence {page.abstractionConfidence}
        </p>
        {page.materialScreenIds.length > 0 ? (
          <p className="site00-body">{page.materialScreenIds.length} material screens · {page.routeNodeCount} route nodes</p>
        ) : null}
        {instances.length > 0 ? (
          <p className="site00-body">{instances.length} instances (drill-down in Inspect)</p>
        ) : null}
        {page.visualStateIds.length > 0 ? (
          <p className="site00-body">States: {page.visualStateIds.join(', ')}</p>
        ) : null}
        {screenNecessity ? (
          <p className="site00-bluprint__status">
            REFERENCE POLICY · {necessityBadge(screenNecessity.classification as import('../../../studio-os-core/route-intelligence/types').ReferenceNecessityClassification)} · {viewport}
            {effectiveRef?.authorityLevel === 'FAMILY_REFERENCE' ? ' · FAMILY REFERENCE' : ''}
          </p>
        ) : null}
        <p className="site00-bluprint__status">
          STATUS · {pageStatusBadge(page.referenceStatus)} · {page.implementationStatus.replace(/_/g, ' ')}
        </p>
        {vpAuth ? (
          <p className="site00-bluprint__status">
            CURRENT · {statusLabel(vpAuth.designStatus)}
            {vpAuth.referencePath ? ` · ${vpAuth.referencePath}` : ' · SCREENSHOT/REF MISSING'}
          </p>
        ) : null}
        {page.captureEligible ? (
          <p className="site00-body">P0.VR.3E capture eligible · auth: {page.authContext ?? 'anonymous'}</p>
        ) : null}
      </div>
      <div className="site00-bluprint__page-actions">
        {page.referenceStatus === 'REFERENCE_MISSING' || page.implementationStatus === 'IMPLEMENTATION_MISSING' ? (
          <button type="button" className="site00-bluprint__btn" disabled title="Design before implementation">
            CREATE REFERENCE
          </button>
        ) : null}
        <Link to={`/bluprint/inspect?project=${projectId}`} className="site00-link-red">
          INSPECT ROUTES
        </Link>
      </div>
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
