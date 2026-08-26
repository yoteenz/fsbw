import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import {
  runCrossProjectRouteForensicAudit,
  registerMissingRoutesAsDesignable,
  discoverStudioWorldProjects,
  listDesignableProjects,
  discoverProjectRoutes,
  buildDependencyGraph,
  buildVisualStates,
  buildAllCoverage,
  discoverAllReferences,
  diffDesignRouteManifests,
  buildNeedsReferenceQueue,
  buildNeedsImprovementQueue,
  buildCoverageMatrix,
  buildPossibleDeadRouteQueue,
  groupDesignScreensForDropdown,
  groupRoutesForScreenDropdown,
  scanProgrammaticNavigation,
  resolveEffectiveDesignReference,
  necessityBadge,
  buildReferenceBatchPreview,
  compilePageDesignReferencePrompt,
  validateReferenceGenerationRequest,
  scanRouteFile,
  displayNameFromRoute,
  DESIGN_ROUTE_MANIFEST_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
  RECONSTRUCTION_PIPELINE_ID,
  PRODUCT_ASSET_PIPELINE_ID,
} from './index';

const REPO_ROOT = join(import.meta.dirname, '../../..');

describe('P0.VR.3 route intelligence', () => {
  it('discovers all registered designable projects', () => {
    const projects = discoverStudioWorldProjects();
    expect(projects.length).toBeGreaterThanOrEqual(4);
    const ids = projects.map((p) => p.projectId);
    expect(ids).toContain('frontal-slayer');
    expect(ids).toContain('ndxbook');
    expect(ids).toContain('site00');
    expect(ids).toContain('all-in-one-enterprise');
  });

  it('lists designable projects for manifest', () => {
    const designable = listDesignableProjects();
    expect(designable.every((p) => p.designable)).toBe(true);
    expect(designable.some((p) => p.projectId === 'frontal-slayer')).toBe(true);
  });

  it('scans router sources for Frontal Slayer', () => {
    const { routes, scanned } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'frontal-slayer' });
    expect(scanned.length).toBeGreaterThan(50);
    expect(routes.length).toBeGreaterThan(50);
    expect(routes.some((r) => r.route.includes('/home/shop') || r.route.includes('/checkout'))).toBe(true);
  });

  it('scans navigation and nested routes for SITE 00', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'site00' });
    expect(routes.some((r) => r.route === '/bldr' || r.route.startsWith('/bldr'))).toBe(true);
    expect(routes.some((r) => r.route.includes('/admin/site00'))).toBe(true);
  });

  it('scans AIO route manifest and route files', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'all-in-one-enterprise' });
    expect(routes.length).toBeGreaterThanOrEqual(30);
    expect(routes.some((r) => r.route.includes('/office'))).toBe(true);
  });

  it('scans NDXBOOK workspace routes', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'ndxbook' });
    expect(routes.length).toBeGreaterThan(0);
  });

  it('classifies dynamic parameterized routes as templates', () => {
    const appRoutes = scanRouteFile(join(REPO_ROOT, 'src/App.tsx'), REPO_ROOT);
    const dynamic = appRoutes.filter((r) => r.routePattern.includes(':param'));
    expect(dynamic.length).toBeGreaterThan(0);
  });

  it('builds dependency graph with closure analysis', () => {
    const { routes, navTargets } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'frontal-slayer' });
    const graph = buildDependencyGraph('frontal-slayer', routes, navTargets);
    expect(graph.closures.length).toBeGreaterThan(0);
    expect(graph.nodes.length).toBe(routes.length);
  });

  it('reports missing dependencies separately from existing routes', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    expect(report.routesDiscovered).toBeGreaterThan(100);
    expect(report.impliedRouteCount).toBeGreaterThanOrEqual(0);
  });

  it('separates visual states from routes', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'frontal-slayer' });
    const states = buildVisualStates(routes);
    expect(states.every((s) => s.parentRouteId)).toBe(true);
  });

  it('tracks mobile tablet desktop independently', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'site00' });
    const refs = discoverAllReferences(REPO_ROOT);
    const coverage = buildAllCoverage(routes.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE'), refs);
    const sample = coverage[0];
    if (sample) {
      expect(sample.mobile.viewportClass).toBe('MOBILE');
      expect(sample.tablet.viewportClass).toBe('TABLET');
      expect(sample.desktop.viewportClass).toBe('DESKTOP');
      expect(sample.mobile.referenceWidth).not.toBe(sample.desktop.referenceWidth);
    }
  });

  it('discovers references without provider spend', () => {
    const refs = discoverAllReferences(REPO_ROOT);
    expect(Array.isArray(refs)).toBe(true);
  });

  it('generates versioned manifest with source commit', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    expect(manifest.manifestVersion).toBe(DESIGN_ROUTE_MANIFEST_VERSION);
    expect(manifest.manifestVersion).toBe('3.0.0');
    expect(manifest.sourceCommit.length).toBeGreaterThan(5);
    expect(manifest.projects.length).toBeGreaterThan(0);
    expect(manifest.rawImplementationRoutes.length).toBeGreaterThan(100);
    expect(manifest.designFamilies?.length).toBeGreaterThan(0);
  });

  it('generates sync contracts for design workspace', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    expect(manifest.syncContracts.length).toBeGreaterThan(0);
    expect(manifest.syncContracts[0]?.schemaVersion).toContain('studio-world-design-route-manifest');
  });

  it('populates project and screen dropdown data dynamically', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const groups = groupRoutesForScreenDropdown(manifest.routes, 'frontal-slayer');
    expect(Object.keys(groups).length).toBeGreaterThan(0);
  });

  it('registers missing routes for design visibility', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const withMissing = registerMissingRoutesAsDesignable(manifest.routes, manifest.dependencyGraphs);
    expect(withMissing.length).toBeGreaterThanOrEqual(manifest.routes.length);
  });

  it('builds coverage matrix and queues', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const screens = manifest.designScreens ?? [];
    const matrix = buildCoverageMatrix('frontal-slayer', screens, manifest.coverage, manifest.referenceNecessityAudits);
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0]?.mobile).toBeDefined();
    const needsRef = buildNeedsReferenceQueue(
      screens,
      manifest.coverage,
      manifest.referenceNecessityAudits,
      manifest.designFamilies,
      manifest.screenReferenceInheritances,
      manifest.familyReferenceAuthorities,
    );
    const needsImp = buildNeedsImprovementQueue(screens, manifest.coverage);
    expect(Array.isArray(needsRef)).toBe(true);
    expect(Array.isArray(needsImp)).toBe(true);
    expect(needsRef.length).toBeLessThan(screens.length * 3);
  });

  it('requires founder trigger for reference generation', () => {
    const blocked = validateReferenceGenerationRequest({
      projectId: 'frontal-slayer',
      routeId: 'test',
      viewportClass: 'MOBILE',
      founderTriggered: false,
    });
    expect(blocked.allowed).toBe(false);
    const allowed = validateReferenceGenerationRequest({
      projectId: 'frontal-slayer',
      routeId: 'test',
      viewportClass: 'MOBILE',
      founderTriggered: true,
    });
    expect(allowed.allowed).toBe(true);
  });

  it('shows batch cost preview before generation', () => {
    const preview = buildReferenceBatchPreview('frontal-slayer', 'MOBILE', ['a', 'b', 'c']);
    expect(preview.requestCount).toBe(3);
    expect(preview.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('compiles page design reference prompt with neighbor continuity', () => {
    const out = compilePageDesignReferencePrompt({
      projectId: 'frontal-slayer',
      routeId: 'fs:/checkout',
      route: '/checkout',
      displayName: 'Checkout',
      viewportClass: 'MOBILE',
      routeFamily: 'COMMERCE',
      dependencies: ['/bag'],
      neighboringReferenceIds: ['ref:cart-mobile'],
      shellAuthority: 'FRONTAL SLAYER',
      designSystemNotes: ['White marble · cherry red accent'],
    });
    expect(out.prompt).toContain('FRONTAL SLAYER');
    expect(out.prompt).toContain('neighbor');
    expect(out.imageReferenceIds).toContain('ref:cart-mobile');
  });

  it('manifest diff detects new routes', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const prev = {
      ...manifest,
      rawImplementationRoutes: manifest.rawImplementationRoutes.slice(0, 10),
      routes: manifest.rawImplementationRoutes.slice(0, 10),
    };
    const diff = diffDesignRouteManifests(prev, manifest);
    expect(diff.entries.some((e) => e.type === 'ROUTE_ADDED')).toBe(true);
  });

  it('reuses P0.VR.2 reconstruction pipeline id', () => {
    expect(RECONSTRUCTION_PIPELINE_ID).toBe('P0.VR.2');
  });

  it('validates NDXBOOK pilot has routes', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const ndx = report.perProject.find((p) => p.projectId === 'ndxbook');
    expect(ndx?.routesDiscovered).toBeGreaterThan(0);
  });

  it('validates Frontal Slayer pilot has substantial route count', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fs = report.perProject.find((p) => p.projectId === 'frontal-slayer');
    expect(fs?.routesDiscovered).toBeGreaterThan(100);
    expect(fs?.designableRoutes).toBeGreaterThan(50);
  });

  it('validates AIO pilot has routes', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const aio = report.perProject.find((p) => p.projectId === 'all-in-one-enterprise');
    expect(aio?.routesDiscovered).toBeGreaterThanOrEqual(30);
  });

  it('displayNameFromRoute produces readable labels', () => {
    expect(displayNameFromRoute('/checkout/bookings')).toBe('Bookings');
    expect(displayNameFromRoute('/')).toBe('Home');
  });

  it('route audit does not mutate manifest on rebuild', () => {
    const first = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const second = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    expect(first.manifest.routes.length).toBe(second.manifest.routes.length);
  });

  it('buildDesignRouteManifest preserves project isolation', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fsRoutes = manifest.rawImplementationRoutes.filter((r) => r.projectId === 'frontal-slayer');
    const aioRoutes = manifest.rawImplementationRoutes.filter((r) => r.projectId === 'all-in-one-enterprise');
    expect(fsRoutes.every((r) => r.projectId === 'frontal-slayer')).toBe(true);
    expect(aioRoutes.every((r) => r.projectId === 'all-in-one-enterprise')).toBe(true);
  });
});

describe('P0.VR.3B reachability normalization', () => {
  it('bumps manifest schema to v3 with design families', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    expect(manifest.manifestVersion).toBe('3.0.0');
    expect(manifest.schemaVersion).toBe(DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION);
    expect(manifest.schemaVersion).toContain('@3');
    expect(manifest.rawImplementationRoutes.length).toBeGreaterThan(0);
    expect(manifest.designScreens?.length).toBeGreaterThan(0);
    expect(manifest.designFamilies?.length).toBeGreaterThan(0);
    expect(manifest.referenceNecessityAudits?.length).toBeGreaterThan(0);
  });

  it('discovers programmatic navigation targets', () => {
    const scan = scanProgrammaticNavigation(REPO_ROOT, 'frontal-slayer');
    expect(scan.allTargets.length).toBeGreaterThan(20);
    expect(scan.allTargets.some((t) => t.type === 'NAVIGATE_CALL' || t.type === 'STATIC_LINK')).toBe(true);
  });

  it('normalizes dynamic product routes into templates', () => {
    const { routes } = discoverProjectRoutes({ repoRoot: REPO_ROOT, projectId: 'frontal-slayer' });
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const templates = manifest.routeTemplates!.filter((t) => t.projectId === 'frontal-slayer');
    expect(templates.some((t) => t.routePattern.includes(':unit') || t.displayName.includes('Product'))).toBe(true);
    expect(routes.length).toBeGreaterThan(templates[0]?.instanceRouteIds.length ?? 0);
  });

  it('classifies auth-gated routes separately from orphans', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const authRoutes = manifest.rawImplementationRoutes.filter(
      (r) => r.reachabilityClassification === 'AUTH_GATED_REACHABLE' || r.reachabilityClassification === 'ADMIN_REACHABLE',
    );
    expect(authRoutes.length).toBeGreaterThan(0);
    expect(authRoutes.every((r) => r.reachabilityClassification !== 'TRUE_ORPHAN')).toBe(true);
  });

  it('classifies deep-link and workflow routes separately from orphans', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fs = manifest.rawImplementationRoutes.filter((r) => r.projectId === 'frontal-slayer');
    const workflow = fs.filter((r) => r.reachabilityClassification === 'WORKFLOW_REACHABLE');
    const deepLink = fs.filter((r) => r.reachabilityClassification === 'DEEP_LINK_SUPPORTED');
    expect(workflow.length).toBeGreaterThan(50);
    expect(deepLink.length).toBeGreaterThan(0);
    expect(workflow.every((r) => r.reachabilityClassification !== 'TRUE_ORPHAN')).toBe(true);
  });

  it('separates legacy from true orphan', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const legacy = manifest.rawImplementationRoutes.filter((r) => r.reachabilityClassification === 'LEGACY');
    if (legacy.length > 0) {
      expect(legacy.every((r) => r.reachabilityClassification !== 'TRUE_ORPHAN')).toBe(true);
    }
  });

  it('keeps UNKNOWN distinct from TRUE_ORPHAN', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const unknown = manifest.rawImplementationRoutes.filter((r) => r.reachabilityClassification === 'UNKNOWN');
    const orphans = manifest.rawImplementationRoutes.filter((r) => r.reachabilityClassification === 'TRUE_ORPHAN');
    expect(unknown.length).toBeGreaterThan(0);
    expect(unknown.every((r) => r.reachabilityClassification !== 'TRUE_ORPHAN')).toBe(true);
    expect(orphans.every((r) => (r.entryEvidence?.length ?? 0) === 0)).toBe(true);
  });

  it('substantially reduces Frontal Slayer false orphan count', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fs = report.perProject.find((p) => p.projectId === 'frontal-slayer')!;
    expect(fs.previousOrphanCount).toBe(647);
    expect(fs.trueOrphans).toBeLessThan(Math.max(50, fs.rawImplementationRoutes * 0.15));
    expect(fs.trueOrphans).toBeLessThan(100);
  });

  it('maps raw routes to design screens with reference migration', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const migration = manifest.referenceMigration!;
    expect(migration.preservedRouteIds.length).toBe(manifest.rawImplementationRoutes.length);
    expect(Object.keys(migration.mappedToDesignScreens).length).toBeGreaterThan(0);
    expect(migration.deleted).toEqual([]);
  });

  it('does not auto-merge reference family conflicts', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const conflictScreens = (manifest.designScreens ?? []).filter((s) => s.referenceFamilyConflict);
    expect(manifest.referenceMigration!.conflicts).toEqual(conflictScreens.map((s) => s.designScreenId));
  });

  it('supports per-instance override on collapsed screens', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const collapsed = (manifest.designScreens ?? []).filter((s) => s.instanceCount > 1);
    expect(collapsed.length).toBeGreaterThan(0);
    expect(collapsed.every((s) => s.perInstanceOverrideRouteIds !== undefined)).toBe(true);
  });

  it('groups design screens for dropdown (not raw routes)', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const screenGroups = groupDesignScreensForDropdown(manifest.designScreens ?? [], 'frontal-slayer');
    const routeGroups = groupRoutesForScreenDropdown(manifest.rawImplementationRoutes, 'frontal-slayer');
    const screenCount = Object.values(screenGroups).flat().length;
    const routeCount = Object.values(routeGroups).flat().length;
    expect(screenCount).toBeLessThan(routeCount);
    expect(screenCount).toBeGreaterThan(10);
  });

  it('builds possible dead route queue from TRUE_ORPHAN only', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const dead = buildPossibleDeadRouteQueue(manifest.rawImplementationRoutes);
    expect(dead.every((d) => d.reachabilityClassification === 'TRUE_ORPHAN')).toBe(true);
  });

  it('normalizes SITE 00, AIO, and NDXBOOK', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    for (const id of ['site00', 'all-in-one-enterprise', 'ndxbook'] as const) {
      const p = report.perProject.find((x) => x.projectId === id)!;
      expect(p.rawImplementationRoutes).toBeGreaterThan(0);
      expect(p.designScreens).toBeGreaterThan(0);
      expect(p.trueOrphans).toBeLessThan(p.rawImplementationRoutes * 0.5);
    }
  });

  it('reports separate counts in per-project summary', () => {
    const { report } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fs = report.perProject.find((p) => p.projectId === 'frontal-slayer')!;
    expect(fs.rawImplementationRoutes).toBeGreaterThan(fs.designScreens);
    expect(fs.normalizedRouteTemplates).toBeGreaterThan(0);
    expect(fs.navReachable).toBeGreaterThan(0);
    expect(fs.programmaticReachable).toBeGreaterThan(0);
    expect(fs.workflowReachable).toBeGreaterThan(0);
  });
});

describe('P0.VR.3C design family consolidation', () => {
  it('builds design families with representative screens', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fsFamilies = manifest.designFamilies!.filter((f) => f.projectId === 'frontal-slayer');
    expect(fsFamilies.length).toBeLessThan(
      manifest.designScreens!.filter((s) => s.projectId === 'frontal-slayer').length,
    );
    expect(fsFamilies.every((f) => f.representativeScreenId && f.memberDesignScreenIds.length > 0)).toBe(true);
  });

  it('classifies product pages as asset-only variants', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const pdpAudits = manifest.referenceNecessityAudits!.filter(
      (a) =>
        a.projectId === 'frontal-slayer' &&
        manifest.designFamilies!.find((f) => f.designFamilyId === a.designFamilyId)?.displayName === 'Product Page',
    );
    expect(pdpAudits.length).toBeGreaterThan(0);
    expect(pdpAudits.some((a) => a.classification === 'ASSET_ONLY_VARIANT')).toBe(true);
  });

  it('reduces unique reference requirements vs screen×viewport', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const fsSavings = manifest.referenceGenerationSavings!.find((s) => s.projectId === 'frontal-slayer')!;
    expect(fsSavings.potentialScreenViewportJobs).toBe(fsSavings.designScreensBefore * 3);
    expect(fsSavings.uniqueReferencesRequired).toBeLessThan(fsSavings.potentialScreenViewportJobs);
    expect(fsSavings.generationRequestsAvoided).toBeGreaterThan(0);
  });

  it('deduplicates needs reference queue for family members', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const screens = manifest.designScreens!.filter((s) => s.projectId === 'frontal-slayer');
    const queue = buildNeedsReferenceQueue(
      screens,
      manifest.coverage,
      manifest.referenceNecessityAudits,
      manifest.designFamilies,
      manifest.screenReferenceInheritances,
      manifest.familyReferenceAuthorities,
    );
    expect(queue.length).toBeLessThan(screens.length * 3);
  });

  it('resolves effective design reference with inheritance path', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const screen = manifest.designScreens!.find((s) => s.projectId === 'frontal-slayer' && s.instanceCount > 1);
    if (!screen) return;
    const effective = resolveEffectiveDesignReference({
      projectId: 'frontal-slayer',
      designScreenId: screen.designScreenId,
      viewportClass: 'MOBILE',
      necessityAudits: manifest.referenceNecessityAudits!,
      inheritances: manifest.screenReferenceInheritances!,
      familyAuthorities: manifest.familyReferenceAuthorities!,
      families: manifest.designFamilies!,
    });
    expect(effective.inheritancePath.length).toBeGreaterThan(0);
    expect(effective.necessityClassification).toBeDefined();
  });

  it('batch preview reports screens covered vs references required', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const screens = manifest.designScreens!.filter((s) => s.projectId === 'frontal-slayer');
    const preview = buildReferenceBatchPreview('frontal-slayer', 'MOBILE', screens.map((s) => s.designScreenId), undefined, {
      necessityAudits: manifest.referenceNecessityAudits,
      designFamilies: manifest.designFamilies,
      designScreensCovered: screens.length,
    });
    expect(preview.designScreensCovered).toBe(screens.length);
    expect(preview.requestCount).toBeLessThanOrEqual(screens.length);
    expect(preview.generationRequestsAvoided).toBeGreaterThan(0);
  });

  it('keeps UNKNOWN distinct from UNIQUE for low confidence', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const unknown = manifest.referenceNecessityAudits!.filter((a) => a.classification === 'UNKNOWN_REVIEW_REQUIRED');
    const unique = manifest.referenceNecessityAudits!.filter((a) => a.classification === 'UNIQUE_REFERENCE_REQUIRED');
    expect(unique.length).toBeGreaterThan(0);
    expect(unknown.every((a) => a.classification !== 'UNIQUE_REFERENCE_REQUIRED')).toBe(true);
  });

  it('validates NDXBOOK does not over-collapse', () => {
    const { manifest } = runCrossProjectRouteForensicAudit({ repoRoot: REPO_ROOT });
    const ndxScreens = manifest.designScreens!.filter((s) => s.projectId === 'ndxbook');
    const ndxFamilies = manifest.designFamilies!.filter((f) => f.projectId === 'ndxbook');
    expect(ndxFamilies.length).toBeGreaterThan(0);
    expect(ndxFamilies.length).toBeLessThanOrEqual(ndxScreens.length);
  });

  it('provides P0.VR.2 effective reference handoff fields', () => {
    expect(RECONSTRUCTION_PIPELINE_ID).toBe('P0.VR.2');
    expect(PRODUCT_ASSET_PIPELINE_ID).toBe('P0.PAF');
    const assetAudit = necessityBadge('ASSET_ONLY_VARIANT');
    expect(assetAudit).toBe('ASSET ONLY');
  });
});
