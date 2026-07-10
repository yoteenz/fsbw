/**
 * Boot-time repair for Experience Engine / Runtime / Lab nested genesis DNA.
 */

import { XER_DEFAULT_RUNTIME_CONTRACT } from '../studio-os-core/genesis/experience-runtime/runtime-boot/default-contract';
import { repairGenesisExperienceLabDna } from '../studio-os-core/genesis/experience-lab/repair';
import { repairGenesisExperienceEngineDna } from '../studio-os-core/genesis/experience-engine/repair';
import type { GenesisStore } from '../studio-os-core/genesis/types';

export type GenesisExperiencePersistenceRepairResult = {
  genesis: GenesisStore;
  repaired: boolean;
  reasons: string[];
};

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

  const engineRepair = repairGenesisExperienceEngineDna(current);
  if (engineRepair.repaired) {
    current = engineRepair.genesis;
    reasons.push(...engineRepair.reasons);
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
