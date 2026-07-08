import {
  getMigrationAuditSummary,
  listFlaggedWebpageRoutes,
  STUDIO_WORLD_MIGRATION_AUDIT,
} from '../studio-world/migration-audit';
import { STUDIO_WORLD_ROUTE_REGISTRY } from '../studio-world/route-registry';
import type { ArchitectureViolation } from './types';

function uid(): string {
  return `rt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type RouteAuditResult = {
  violations: ArchitectureViolation[];
  unmappedRoutes: string[];
  brokenRoutes: string[];
  immersionScore: number;
  architectureScore: number;
  navigationScore: number;
};

export function auditStudioRoutes(): RouteAuditResult {
  const summary = getMigrationAuditSummary();
  const flagged = listFlaggedWebpageRoutes();
  const violations: ArchitectureViolation[] = [];
  const registeredLegacy = new Set(STUDIO_WORLD_ROUTE_REGISTRY.map((r) => r.legacyPath.split('?')[0]));

  const unmappedRoutes = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (row) => !registeredLegacy.has(row.currentRoute.split('?')[0]!)
  ).map((r) => r.currentRoute);

  for (const row of flagged) {
    if (!row.building || !row.wing || !row.room) {
      violations.push({
        id: uid(),
        category: 'missing-physical-place',
        severity: 'major',
        problem: `Route lacks physical place mapping: ${row.currentRoute}`,
        reason: 'Every Studio OS route must belong to a building, wing, and room',
        affectedRoutes: [row.currentRoute],
        detectedPatterns: ['unmapped physical destination'],
      });
    }

    if (row.navigationPath.includes('navigate') || row.requiredSceneStack.includes('scroll container')) {
      violations.push({
        id: uid(),
        category: 'non-physical-navigation',
        severity: row.migrationPriority === 'P0' ? 'critical' : 'major',
        problem: `Navigation is page-based, not movement: ${row.currentRoute}`,
        reason: 'Wing transitions must be camera movement inside a continuous destination',
        affectedRoutes: [row.currentRoute],
        detectedPatterns: ['page navigation'],
      });
    }
  }

  for (const route of unmappedRoutes.slice(0, 50)) {
    violations.push({
      id: uid(),
      category: 'route-unmapped',
      severity: 'minor',
      problem: `Route not in Studio World registry: ${route}`,
      reason: 'Extend STUDIO_WORLD_ROUTE_REGISTRY with building · wing · room',
      affectedRoutes: [route],
      detectedPatterns: ['registry gap'],
    });
  }

  const immersionScore = Math.round(
    ((summary.immersiveLive + summary.immersivePartial * 0.5) / Math.max(summary.totalModules, 1)) * 100
  );
  const architectureScore = Math.round(
    ((summary.totalModules - summary.flaggedWebpageLike) / Math.max(summary.totalModules, 1)) * 100
  );
  const navigationScore = Math.round(
    (STUDIO_WORLD_ROUTE_REGISTRY.length / Math.max(summary.totalModules, 1)) * 100
  );

  return {
    violations,
    unmappedRoutes,
    brokenRoutes: [],
    immersionScore,
    architectureScore,
    navigationScore,
  };
}
