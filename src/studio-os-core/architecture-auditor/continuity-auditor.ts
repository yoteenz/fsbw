import { IMMERSIVE_SHELL_MARKERS } from './laws';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';
import type { ArchitectureViolation } from './types';

const CONTINUITY_DIMENSIONS = [
  'lighting language',
  'materials',
  'motion language',
  'camera language',
  'transitions',
  'typography',
  'orb behavior',
  'navigation',
  'environmental storytelling',
] as const;

function uid(): string {
  return `wc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type ContinuityAuditResult = {
  violations: ArchitectureViolation[];
  worldContinuityScore: number;
  generationCostScore: number;
};

export function auditWorldContinuity(): ContinuityAuditResult {
  const violations: ArchitectureViolation[] = [];
  const immersiveCount = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (r) => r.currentUiPattern === 'immersive-live' || r.currentUiPattern === 'immersive-partial-dashboard'
  ).length;
  const webpageCount = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.flaggedAsWebpage).length;

  if (webpageCount > immersiveCount * 3) {
    violations.push({
      id: uid(),
      category: 'world-continuity',
      severity: 'critical',
      problem: 'Studio World continuity broken — majority of routes are webpage shells',
      reason: `${webpageCount} webpage-like routes vs ${immersiveCount} immersive destinations breaks one-world feel`,
      affectedRoutes: STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.flaggedAsWebpage)
        .slice(0, 8)
        .map((r) => r.currentRoute),
      detectedPatterns: [...CONTINUITY_DIMENSIONS.map((d) => `broken ${d}`)],
    });
  }

  const partialImmersive = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (r) => r.currentUiPattern === 'immersive-partial-dashboard'
  );
  for (const row of partialImmersive) {
    violations.push({
      id: uid(),
      category: 'world-continuity',
      severity: 'major',
      problem: `Hybrid shell breaks continuity at ${row.currentRoute}`,
      reason: 'Immersive shell with dashboard content violates lighting, navigation, and storytelling continuity',
      affectedRoutes: [row.currentRoute],
      detectedPatterns: IMMERSIVE_SHELL_MARKERS.filter(() => true).map((m) => `mixed ${m}`),
    });
  }

  const avgReuse =
    STUDIO_WORLD_MIGRATION_AUDIT.reduce((s, r) => s + r.estimatedReusePct, 0) /
    Math.max(STUDIO_WORLD_MIGRATION_AUDIT.length, 1);
  const worldContinuityScore = Math.round(
    Math.max(0, 100 - webpageCount * 0.4 - partialImmersive.length * 2)
  );
  const generationCostScore = Math.round(Math.min(100, avgReuse));

  return { violations, worldContinuityScore, generationCostScore };
}
