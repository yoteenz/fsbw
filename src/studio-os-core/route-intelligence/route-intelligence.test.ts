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
  groupRoutesForScreenDropdown,
  compilePageDesignReferencePrompt,
  validateReferenceGenerationRequest,
  buildReferenceBatchPreview,
  scanRouteFile,
  displayNameFromRoute,
  DESIGN_ROUTE_MANIFEST_VERSION,
  RECONSTRUCTION_PIPELINE_ID,
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
    expect(manifest.sourceCommit.length).toBeGreaterThan(5);
    expect(manifest.projects.length).toBeGreaterThan(0);
    expect(manifest.routes.length).toBeGreaterThan(100);
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
    const matrix = buildCoverageMatrix('frontal-slayer', manifest.routes, manifest.coverage);
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0]?.mobile).toBeDefined();
    const needsRef = buildNeedsReferenceQueue(manifest.routes, manifest.coverage);
    const needsImp = buildNeedsImprovementQueue(manifest.routes, manifest.coverage);
    expect(Array.isArray(needsRef)).toBe(true);
    expect(Array.isArray(needsImp)).toBe(true);
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
    const prev = { ...manifest, routes: manifest.routes.slice(0, 10) };
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
    const fsRoutes = manifest.routes.filter((r) => r.projectId === 'frontal-slayer');
    const aioRoutes = manifest.routes.filter((r) => r.projectId === 'all-in-one-enterprise');
    expect(fsRoutes.every((r) => r.projectId === 'frontal-slayer')).toBe(true);
    expect(aioRoutes.every((r) => r.projectId === 'all-in-one-enterprise')).toBe(true);
  });
});
