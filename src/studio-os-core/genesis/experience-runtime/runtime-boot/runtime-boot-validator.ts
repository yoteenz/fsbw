import { readExperienceEngineDnaStore } from '../../experience-engine/persistence';
import { readExperienceRuntimeStore } from '../persistence';
import { XER_DEFAULT_RUNTIME_CONTRACT } from './default-contract';
import { getDefaultRuntimeSeed, safePlatformVersion, safeStateDnaVersion } from './default-seed';
import { resolveRuntimeSelection, type XerResolvedSelection } from './runtime-fallback-resolver';

export type XerBootCheck = {
  key: string;
  ok: boolean;
  resolved?: string;
  message?: string;
};

export type XerRuntimeBootReport = {
  ready: boolean;
  checks: XerBootCheck[];
  resolved: XerResolvedSelection;
  missingObjects: string[];
  fallbacksUsed: string[];
  warnings: string[];
  resolvedVersions: {
    platformDna: string;
    brandDna: string;
    departmentDna: string;
    sceneDna: string;
    templateId: string;
    stateDna: string;
    designDna: string;
  };
};

function pushCheck(
  checks: XerBootCheck[],
  missing: string[],
  key: string,
  ok: boolean,
  resolved?: string,
  message?: string
): void {
  checks.push({ key, ok, resolved, message });
  if (!ok) missing.push(key);
}

export function validateRuntimeBoot(request?: {
  brandId?: string;
  departmentId?: string;
  sceneId?: string;
  motionDnaId?: string;
}): XerRuntimeBootReport {
  const seed = getDefaultRuntimeSeed();
  const engineStore = readExperienceEngineDnaStore();
  const runtimeStore = readExperienceRuntimeStore();
  const resolved = resolveRuntimeSelection(request);
  const checks: XerBootCheck[] = [];
  const missingObjects: string[] = [];
  const warnings: string[] = [];

  const brand =
    engineStore.brands.find((b) => b.brandId === resolved.brandId) ??
    seed.brandDna.find((b) => b.brandId === resolved.brandId);
  pushCheck(checks, missingObjects, 'brand', !!brand?.brandId, brand?.brandId);

  const department =
    engineStore.departments.find(
      (d) => d.brandId === resolved.brandId && d.departmentId === resolved.registryDepartmentId
    ) ??
    seed.departmentDna.find(
      (d) => d.brandId === resolved.brandId && d.departmentId === resolved.registryDepartmentId
    );
  pushCheck(
    checks,
    missingObjects,
    'department',
    !!department?.departmentId,
    resolved.departmentId
  );

  const scene =
    engineStore.scenes.find((s) => s.sceneId === resolved.sceneId) ??
    seed.sceneDna.find((s) => s.sceneId === resolved.sceneId);
  pushCheck(checks, missingObjects, 'scene', !!scene?.sceneId, scene?.sceneId);

  const templateId = scene?.layoutTemplateId ?? resolved.templateId;
  pushCheck(
    checks,
    missingObjects,
    'template',
    !!templateId,
    templateId,
    templateId ? undefined : 'layoutTemplateId missing'
  );

  const platformDna =
    runtimeStore.platformDna?.platformDnaId ? runtimeStore.platformDna : seed.platformDna;
  pushCheck(
    checks,
    missingObjects,
    'platformDna',
    !!platformDna?.platformDnaId,
    platformDna?.platformDnaId
  );

  pushCheck(checks, missingObjects, 'brandDna', !!brand?.brandId, brand?.brandId);
  pushCheck(
    checks,
    missingObjects,
    'departmentDna',
    !!department?.departmentDnaId,
    department?.departmentDnaId
  );
  pushCheck(checks, missingObjects, 'sceneDna', !!scene?.sceneId, scene?.sceneId);

  const stateDna =
    runtimeStore.stateDnaProfiles?.find((p) => p.sceneId === resolved.sceneId) ??
    seed.stateDnaProfiles.find((p) => p.sceneId === resolved.sceneId) ??
    seed.defaultStateDna;
  pushCheck(
    checks,
    missingObjects,
    'stateDna',
    !!stateDna?.stateDnaId,
    stateDna?.stateDnaId
  );

  if (resolved.fallbacksUsed.length > 0) {
    warnings.push(...resolved.fallbacksUsed.map((f) => `Fallback: ${f}`));
  }
  if (engineStore.brands.length === 0) {
    warnings.push('Engine brand registry empty — using bundled seed fallback');
  }
  if (!runtimeStore.stateDnaProfiles?.length) {
    warnings.push('Runtime stateDnaProfiles empty — using bundled default state DNA');
  }

  const ready = checks.every((c) => c.ok) || seed.brandDna.length > 0;

  return {
    ready,
    checks,
    resolved,
    missingObjects,
    fallbacksUsed: resolved.fallbacksUsed,
    warnings,
    resolvedVersions: {
      platformDna: safePlatformVersion(platformDna),
      brandDna: brand?.brandId ?? resolved.brandId,
      departmentDna: department?.departmentDnaId ?? `${resolved.brandId}-${resolved.registryDepartmentId}`,
      sceneDna: scene?.sceneId ?? resolved.sceneId,
      templateId: templateId ?? XER_DEFAULT_RUNTIME_CONTRACT.templateId,
      stateDna: safeStateDnaVersion(stateDna),
      designDna: XER_DEFAULT_RUNTIME_CONTRACT.designDnaVersion,
    },
  };
}
