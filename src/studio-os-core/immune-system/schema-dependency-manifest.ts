/** Feature → required schema resources (deployment readiness). */

export type SchemaDependencyEntry = {
  featureId: string;
  label: string;
  requiredTables: string[];
  requiredIndexes: string[];
  requiredRls: string[];
  migrationIds: string[];
};

export const IMMUNE_SCHEMA_DEPENDENCY_MANIFEST: SchemaDependencyEntry[] = [
  {
    featureId: 'async-governed-generation-v1',
    label: 'Async Governed Generation Work Orders',
    requiredTables: ['public.studio_governed_generation_jobs'],
    requiredIndexes: [
      'studio_governed_generation_jobs_org_status_idx',
      'studio_governed_generation_jobs_idempotency_idx',
      'studio_governed_generation_jobs_compile_run_idx',
      'studio_governed_generation_jobs_idempotency_active_uidx',
    ],
    requiredRls: ['public.studio_governed_generation_jobs'],
    migrationIds: ['20260712180000_studio_governed_generation_jobs'],
  },
];

export function getSchemaDependenciesForFeature(featureId: string): SchemaDependencyEntry | null {
  return IMMUNE_SCHEMA_DEPENDENCY_MANIFEST.find((f) => f.featureId === featureId) ?? null;
}

export type DeploymentReadinessReport = {
  featureId: string;
  codeDeployed: boolean;
  schemaReady: boolean;
  blocked: boolean;
  missingResources: string[];
  migrationIds: string[];
};

export function evaluateFeatureDeploymentReadiness(
  featureId: string,
  liveTablePresence: Record<string, boolean>
): DeploymentReadinessReport {
  const dep = getSchemaDependenciesForFeature(featureId);
  if (!dep) {
    return {
      featureId,
      codeDeployed: true,
      schemaReady: true,
      blocked: false,
      missingResources: [],
      migrationIds: [],
    };
  }
  const missingResources = dep.requiredTables.filter((t) => !liveTablePresence[t]);
  return {
    featureId,
    codeDeployed: true,
    schemaReady: missingResources.length === 0,
    blocked: missingResources.length > 0,
    missingResources,
    migrationIds: dep.migrationIds,
  };
}
