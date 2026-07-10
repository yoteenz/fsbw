/**
 * Boot-time repair for Experience Engine / Runtime / Lab nested genesis DNA.
 */

import type { XeeBrandDna } from '../studio-os-core/genesis/experience-engine/types';
import { SEED_BRAND_DNA } from '../studio-os-core/genesis/experience-engine/bootstrap/seed-data';
import { XER_DEFAULT_RUNTIME_CONTRACT } from '../studio-os-core/genesis/experience-runtime/runtime-boot/default-contract';
import { repairGenesisExperienceLabDna } from '../studio-os-core/genesis/experience-lab/repair';
import type { GenesisStore } from '../studio-os-core/genesis/types';

export type GenesisExperiencePersistenceRepairResult = {
  genesis: GenesisStore;
  repaired: boolean;
  reasons: string[];
};

function hasValidBrandRegistry(brands: XeeBrandDna[] | undefined): boolean {
  if (!brands?.length) return false;
  const requiredIds = new Set(SEED_BRAND_DNA.map((b) => b.brandId));
  for (const brand of brands) {
    if (!brand?.brandId || !requiredIds.has(brand.brandId)) return false;
    if (!brand.colorSystem?.primary || !brand.glassStyle?.border || !brand.typography?.displayFont) {
      return false;
    }
  }
  return brands.length >= SEED_BRAND_DNA.length;
}

function repairExperienceEngineDna(genesis: GenesisStore, reasons: string[]): GenesisStore {
  const engine = genesis.experienceEngineDna;
  if (!engine) return genesis;

  const invalidRegistry =
    !hasValidBrandRegistry(engine.brands) ||
    !engine.departments?.length ||
    !engine.scenes?.length ||
    !engine.motions?.length ||
    !engine.interactions?.length;

  if (!invalidRegistry) return genesis;

  reasons.push('experienceEngineDna:invalid-registry→bundled-seed-fallback');
  return {
    ...genesis,
    experienceEngineDna: {
      ...engine,
      brands: [],
      departments: [],
      scenes: [],
      components: [],
      motions: [],
      interactions: [],
      seededAt: undefined,
    },
  };
}

function repairExperienceRuntimeDna(genesis: GenesisStore, reasons: string[]): GenesisStore {
  const runtime = genesis.experienceRuntimeDna;
  if (!runtime) return genesis;

  const selection = runtime.selection;
  const invalidSelection =
    !selection?.brandId ||
    typeof selection.brandId !== 'string' ||
    !selection.departmentId ||
    !selection.sceneId;

  const invalidPlatform = !runtime.platformDna?.platformDnaId;
  const invalidState =
    Boolean(runtime.seededAt) && (!runtime.stateDnaProfiles || runtime.stateDnaProfiles.length === 0);

  if (!invalidSelection && !invalidPlatform && !invalidState) return genesis;

  if (invalidSelection) {
    reasons.push('experienceRuntimeDna.selection:invalid→default-contract');
  }
  if (invalidPlatform) {
    reasons.push('experienceRuntimeDna.platformDna:invalid→re-seed');
  }
  if (invalidState) {
    reasons.push('experienceRuntimeDna.stateDnaProfiles:empty→re-seed');
  }

  return {
    ...genesis,
    experienceRuntimeDna: {
      ...runtime,
      seededAt: undefined,
      selection: {
        brandId: selection?.brandId ?? XER_DEFAULT_RUNTIME_CONTRACT.brandId,
        departmentId: selection?.departmentId ?? XER_DEFAULT_RUNTIME_CONTRACT.departmentId,
        sceneId: selection?.sceneId ?? XER_DEFAULT_RUNTIME_CONTRACT.sceneId,
        componentId: selection?.componentId ?? XER_DEFAULT_RUNTIME_CONTRACT.componentId,
        motionDnaId: selection?.motionDnaId ?? XER_DEFAULT_RUNTIME_CONTRACT.motionDnaId,
      },
    },
  };
}

/** Sanitize nested experience DNA before genesis is cached — safe on every cold boot. */
export function repairGenesisExperiencePersistence(
  genesis: GenesisStore
): GenesisExperiencePersistenceRepairResult {
  const reasons: string[] = [];
  let current = genesis;

  const engineRepair = repairExperienceEngineDna(current, reasons);
  if (engineRepair !== current) {
    current = engineRepair;
  }

  const runtimeRepair = repairExperienceRuntimeDna(current, reasons);
  if (runtimeRepair !== current) {
    current = runtimeRepair;
  }

  const labRepair = repairGenesisExperienceLabDna(current);
  if (labRepair.repaired) {
    current = labRepair.genesis;
    reasons.push(...labRepair.reasons);
  }

  return {
    genesis: current,
    repaired: reasons.length > 0,
    reasons,
  };
}
