import { readExperienceEngineDnaStore } from '../../experience-engine/persistence';
import { readExperienceRuntimeStore } from '../persistence';
import { XER_DEFAULT_RUNTIME_CONTRACT } from './default-contract';
import { getDefaultRuntimeSeed } from './default-seed';
import {
  normalizeBrandId,
  normalizeDepartmentId,
  normalizeSceneId,
  normalizeTemplateId,
} from './id-aliases';
import type { XerAssemblyRequest } from '../types';
import type { XeeDepartmentDna } from '../../experience-engine/types';

const DEPARTMENT_LOOKUP_FALLBACKS: Record<string, string[]> = {
  executive: ['executive', 'headquarters'],
  command: ['command', 'command-center'],
  ai: ['ai', 'operations'],
  knowledge: ['knowledge'],
  creative: ['creative'],
};

function findDepartmentRow(
  brandId: string,
  publicDepartmentId: string,
  engineDepts: XeeDepartmentDna[],
  seedDepts: XeeDepartmentDna[]
): { row: XeeDepartmentDna; registryId: string } | null {
  const candidates = DEPARTMENT_LOOKUP_FALLBACKS[publicDepartmentId] ?? [publicDepartmentId];
  for (const registryId of candidates) {
    const row =
      engineDepts.find((d) => d.brandId === brandId && d.departmentId === registryId) ??
      seedDepts.find((d) => d.brandId === brandId && d.departmentId === registryId);
    if (row) return { row, registryId };
  }
  return null;
}

export type XerResolvedSelection = {
  brandId: string;
  departmentId: string;
  sceneId: string;
  templateId: string;
  motionDnaId: string;
  /** Registry department id used for DNA lookup (may differ from public id). */
  registryDepartmentId: string;
  fallbacksUsed: string[];
};

export function resolveRuntimeSelection(request?: XerAssemblyRequest): XerResolvedSelection {
  const seed = getDefaultRuntimeSeed();
  const runtimeStore = readExperienceRuntimeStore();
  const engineStore = readExperienceEngineDnaStore();
  const fallbacksUsed: string[] = [];

  const requestedBrand = request?.brandId ?? runtimeStore.selection?.brandId;
  let brandId = normalizeBrandId(requestedBrand);
  if (!engineStore.brands.some((b) => b.brandId === brandId)) {
    const seedBrand = seed.brandDna.find((b) => b.brandId === brandId) ?? seed.brandDna[0];
    brandId = seedBrand?.brandId ?? XER_DEFAULT_RUNTIME_CONTRACT.brandId;
    if (requestedBrand && requestedBrand !== brandId) {
      fallbacksUsed.push(`brand:${requestedBrand}→${brandId}`);
    }
  }

  const requestedDept = request?.departmentId ?? runtimeStore.selection?.departmentId;
  let publicDepartmentId = normalizeDepartmentId(requestedDept);
  let registryDepartmentId = publicDepartmentId;
  const deptMatch = findDepartmentRow(
    brandId,
    publicDepartmentId,
    engineStore.departments,
    seed.departmentDna
  );
  if (!deptMatch) {
    publicDepartmentId = XER_DEFAULT_RUNTIME_CONTRACT.departmentId;
    registryDepartmentId = publicDepartmentId;
    const fallbackMatch = findDepartmentRow(
      brandId,
      publicDepartmentId,
      engineStore.departments,
      seed.departmentDna
    );
    if (fallbackMatch) {
      registryDepartmentId = fallbackMatch.registryId;
      fallbacksUsed.push(`department:${requestedDept ?? '∅'}→${publicDepartmentId}`);
    } else {
      registryDepartmentId = 'headquarters';
      fallbacksUsed.push(`department:${requestedDept ?? '∅'}→headquarters`);
    }
  } else {
    registryDepartmentId = deptMatch.registryId;
    if (requestedDept && normalizeDepartmentId(requestedDept) !== deptMatch.registryId) {
      fallbacksUsed.push(`department:${requestedDept}→${deptMatch.registryId}`);
    }
  }

  const requestedScene = request?.sceneId ?? runtimeStore.selection?.sceneId;
  let sceneId = normalizeSceneId(requestedScene);
  const sceneExists =
    engineStore.scenes.some((s) => s.sceneId === sceneId) ||
    seed.sceneDna.some((s) => s.sceneId === sceneId);
  if (!sceneExists) {
    sceneId = XER_DEFAULT_RUNTIME_CONTRACT.sceneId;
    fallbacksUsed.push(`scene:${requestedScene ?? '∅'}→${sceneId}`);
  }

  const sceneRecord =
    engineStore.scenes.find((s) => s.sceneId === sceneId) ??
    seed.sceneDna.find((s) => s.sceneId === sceneId);
  let templateId = normalizeTemplateId(sceneRecord?.layoutTemplateId);
  if (!sceneRecord) {
    templateId = XER_DEFAULT_RUNTIME_CONTRACT.templateId;
    fallbacksUsed.push(`template→${templateId}`);
  }

  let motionDnaId = request?.motionDnaId ?? runtimeStore.selection?.motionDnaId ?? `motion-${brandId}`;
  const motionExists =
    engineStore.motions.some((m) => m.motionDnaId === motionDnaId) ||
    seed.motionDna.some((m) => m.motionDnaId === motionDnaId);
  if (!motionExists) {
    motionDnaId = `motion-${brandId}`;
    fallbacksUsed.push(`motion→${motionDnaId}`);
  }

  return {
    brandId,
    departmentId: publicDepartmentId,
    sceneId,
    templateId,
    motionDnaId,
    registryDepartmentId,
    fallbacksUsed,
  };
}

/** Assembly request with registry-safe ids for DNA resolver. */
export function toAssemblyRequest(resolved: XerResolvedSelection): XerAssemblyRequest {
  return {
    brandId: resolved.brandId,
    departmentId: resolved.registryDepartmentId,
    sceneId: resolved.sceneId,
    motionDnaId: resolved.motionDnaId,
  };
}
