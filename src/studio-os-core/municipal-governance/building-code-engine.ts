import type { MunicipalValidationResult } from './contract';

export const BUILDING_CODE_VERSION = 'building-code-engine.v1' as const;

export type BuildingCodeCheckInput = {
  sceneId: string;
  blueprintId: string | null;
  blueprintRevision: number | null;
  founderRenderUrl: string | null;
  constructionPlanId: string | null;
  socketIds: string[];
  dependencyIds: string[];
  navigationTargets: string[];
  lightingProfileId: string | null;
  materialLibraryId: string | null;
  unresolvedAssetIds: string[];
  duplicateIds: string[];
  circularDependencies: string[][];
};

export type BuildingCodeViolation = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
};

const REQUIRED_SOCKET_MIN = 0;

export function runBuildingCodeInspection(input: BuildingCodeCheckInput): {
  ok: boolean;
  violations: BuildingCodeViolation[];
  engineVersion: typeof BUILDING_CODE_VERSION;
} {
  const violations: BuildingCodeViolation[] = [];

  if (!input.blueprintId) {
    violations.push({ code: 'NO_VALID_BLUEPRINT', message: 'Blueprint is required.', severity: 'error' });
  }
  if (!input.founderRenderUrl) {
    violations.push({ code: 'NO_VALID_FOUNDER_RENDER', message: 'Approved Founder Render is required.', severity: 'error' });
  }
  if (!input.lightingProfileId) {
    violations.push({ code: 'MISSING_LIGHTING', message: 'Lighting profile is required.', severity: 'error' });
  }
  if (!input.materialLibraryId) {
    violations.push({ code: 'MISSING_MATERIALS', message: 'Material library assignment is required.', severity: 'error' });
  }
  if (input.unresolvedAssetIds.length > 0) {
    violations.push({
      code: 'UNRESOLVED_ASSETS',
      message: `Unresolved assets: ${input.unresolvedAssetIds.join(', ')}`,
      severity: 'error',
    });
  }
  if (input.duplicateIds.length > 0) {
    violations.push({
      code: 'DUPLICATE_IDS',
      message: `Duplicate IDs: ${input.duplicateIds.join(', ')}`,
      severity: 'error',
    });
  }
  if (input.circularDependencies.length > 0) {
    violations.push({
      code: 'CIRCULAR_DEPENDENCIES',
      message: 'Circular dependency detected in department graph.',
      severity: 'error',
    });
  }
  if (input.dependencyIds.length === 0 && input.socketIds.length < REQUIRED_SOCKET_MIN) {
    violations.push({
      code: 'ORPHAN_DEPENDENCIES',
      message: 'Department has no declared dependencies or sockets.',
      severity: 'warning',
    });
  }
  if (input.navigationTargets.length === 0) {
    violations.push({
      code: 'BROKEN_NAVIGATION',
      message: 'No accessible navigation targets declared.',
      severity: 'warning',
    });
  }

  const errors = violations.filter((v) => v.severity === 'error');
  return { ok: errors.length === 0, violations, engineVersion: BUILDING_CODE_VERSION };
}

export function validateBuildingCode(input: BuildingCodeCheckInput): MunicipalValidationResult {
  const result = runBuildingCodeInspection(input);
  if (result.ok) return { ok: true };
  const first = result.violations.find((v) => v.severity === 'error');
  return {
    ok: false,
    code: first?.code ?? 'BUILDING_CODE_VIOLATION',
    message: first?.message ?? 'Building code inspection failed.',
  };
}
