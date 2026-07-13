import type { FounderPackInstance, IndustryPack } from './contract';
import { INDUSTRY_PACKS_VERSION } from './contract';
import { buildHeadquartersGenerationPlan } from './department-reuse-engine';
import { SHARED_DEPARTMENT_REGISTRY } from './department-template-registry';
import { validateApprovedHeadquartersHandoff } from './approved-headquarters-handoff';
import { validateIndustryPack } from './industry-pack-registry';

/** Experience Lab — headquarters pack workflow entry. */
export function planExperienceLabHeadquartersGeneration(input: {
  pack: IndustryPack;
  organizationId: string;
  changedSlotIds?: Set<string>;
}) {
  const packValidation = validateIndustryPack(input.pack);
  if (!packValidation.ok) return { ok: false as const, error: packValidation };

  const plan = buildHeadquartersGenerationPlan({
    pack: input.pack,
    organizationId: input.organizationId,
    sharedRegistry: SHARED_DEPARTMENT_REGISTRY,
    changedSlotIds: input.changedSlotIds,
  });

  return { ok: true as const, plan };
}

/** CDS gate — reject architecture invention when pack flow active. */
export function validateCdsHeadquartersEntry(
  handoff: Parameters<typeof validateApprovedHeadquartersHandoff>[0]
) {
  return validateApprovedHeadquartersHandoff(handoff);
}

export function createFounderPackInstance(input: {
  instanceId: string;
  organizationId: string;
  pack: IndustryPack;
}): FounderPackInstance {
  return {
    instanceId: input.instanceId,
    organizationId: input.organizationId,
    packId: input.pack.packId,
    packVersion: input.pack.packVersion,
    archetypeId: input.pack.archetypeId,
    status: 'draft',
    departmentSlots: input.pack.defaultDepartments,
    approvedAt: null,
    approvedBy: null,
    registryVersion: INDUSTRY_PACKS_VERSION,
  };
}

/** Municipal mod attach — mods bind to department slots, not random generation. */
export function validateModAttachesToDepartmentSlot(input: {
  pack: IndustryPack;
  baseDepartmentSlotId: string;
}): { ok: true } | { ok: false; code: string; message: string } {
  const slot = input.pack.defaultDepartments.find((s) => s.slotId === input.baseDepartmentSlotId);
  if (!slot) {
    return {
      ok: false,
      code: 'MOD_ORPHAN_DEPARTMENT',
      message: `Mod must attach to department slot ${input.baseDepartmentSlotId} on pack ${input.pack.packId}.`,
    };
  }
  return { ok: true };
}
