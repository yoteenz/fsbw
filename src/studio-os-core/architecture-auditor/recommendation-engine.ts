import type { ArchitectureRecommendation, ArchitectureViolation } from './types';
import type { MigrationAuditRow } from '../studio-world/migration-audit';
import { STUDIO_WORLD_MIGRATION_AUDIT } from '../studio-world/migration-audit';

function uid(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function findMigrationRow(route: string): MigrationAuditRow | undefined {
  return STUDIO_WORLD_MIGRATION_AUDIT.find(
    (r) => r.currentRoute === route || route.includes(r.moduleId)
  );
}

export function generateRecommendations(violations: ArchitectureViolation[]): ArchitectureRecommendation[] {
  const recommendations: ArchitectureRecommendation[] = [];

  for (const v of violations) {
    const primaryRoute = v.affectedRoutes[0] ?? '/admin/studio/overview';
    const row = findMigrationRow(primaryRoute);

    const suggestedBuilding = row?.building ?? 'Executive Operations Headquarters™';
    const suggestedWing = row?.wing ?? 'Mission Control™';
    const suggestedRoom = row?.room ?? 'Immersive Replacement Room™';
    const suggestedSceneStack =
      row?.requiredSceneStack && !row.requiredSceneStack.includes('scroll')
        ? row.requiredSceneStack
        : 'threshold → atrium → zone-camera → diegetic-installations → scene-stack-live';

    recommendations.push({
      id: uid(),
      violationId: v.id,
      problem: v.problem,
      reason: v.reason,
      affectedRoutes: v.affectedRoutes,
      suggestedBuilding,
      suggestedWing,
      suggestedRoom,
      suggestedSceneStack,
      reusableAssets: row
        ? [`scene-stack:${row.moduleId}`, `registry:${row.flagshipId}`]
        : ['scene-stack:shared-campus-shell'],
      estimatedGenerationCost: row?.estimatedGenerationCost ?? '$$',
      estimatedImplementationComplexity: row?.estimatedComplexity ?? 'M',
      migrationPriority: row?.migrationPriority === 'done' ? 'P3' : (row?.migrationPriority ?? 'P2'),
    });
  }

  return recommendations;
}
