import type {
  DepartmentReuseDecision,
  DepartmentTemplateId,
  GenerationPriorityStep,
  HeadquartersDepartmentPlan,
  HeadquartersGenerationPlan,
  IndustryPack,
  IndustryPackDepartmentSlot,
  PackDependencyGraph,
  DepartmentReuseGraph,
  SharedDepartmentRegistry,
} from './contract';
import { INDUSTRY_PACKS_VERSION } from './contract';
import { getSharedDepartmentInstance } from './department-template-registry';
import { getDepartmentTemplate } from './department-template-registry';

export const GENERATION_PRIORITY_ORDER: GenerationPriorityStep[] = [
  'reuse-department',
  'reuse-construction-template',
  'reuse-material-library',
  'reuse-lighting-profile',
  'reuse-camera-pack',
  'generate-missing-departments',
  'generate-changed-departments',
];

export type DepartmentReuseEngineInput = {
  slot: IndustryPackDepartmentSlot;
  pack: IndustryPack;
  sharedRegistry: SharedDepartmentRegistry;
  /** When set, force regeneration even if shared instance exists. */
  changedSlotIds?: Set<string>;
};

/**
 * DepartmentReuseEngine™ — mandatory before any headquarters generation.
 * If two packs reference the same department version, DO NOT regenerate.
 */
export function resolveDepartmentReuse(input: DepartmentReuseEngineInput): DepartmentReuseDecision {
  const { slot, sharedRegistry, changedSlotIds } = input;
  const template = getDepartmentTemplate(slot.templateId);
  if (!template) {
    return {
      action: 'generate',
      templateId: slot.templateId,
      templateVersion: slot.pinnedVersion,
      reason: `Unknown department template: ${slot.templateId}`,
    };
  }

  if (changedSlotIds?.has(slot.slotId)) {
    return {
      action: 'generate',
      templateId: slot.templateId,
      templateVersion: slot.pinnedVersion,
      reason: `Slot ${slot.slotId} marked changed — regenerate only this department.`,
    };
  }

  const shared = getSharedDepartmentInstance(sharedRegistry, slot.templateId, slot.pinnedVersion);
  if (shared) {
    return {
      action: 'reuse',
      instanceId: shared.instanceId,
      templateId: slot.templateId,
      templateVersion: slot.pinnedVersion,
      reason: `Shared ${slot.templateId} ${slot.pinnedVersion} exists — reuse instance ${shared.instanceId}.`,
    };
  }

  return {
    action: 'generate',
    templateId: slot.templateId,
    templateVersion: slot.pinnedVersion,
    reason: `No shared instance for ${slot.templateId} ${slot.pinnedVersion} — generate once, register for reuse.`,
  };
}

export function buildDepartmentReuseGraph(
  pack: IndustryPack,
  decisions: DepartmentReuseDecision[]
): DepartmentReuseGraph {
  const nodes = pack.defaultDepartments.map((slot, idx) => {
    const decision = decisions[idx]!;
    return {
      templateId: slot.templateId,
      version: slot.pinnedVersion,
      instanceId: decision.action === 'reuse' ? decision.instanceId : null,
    };
  });

  const edges = pack.defaultDepartments.map((slot, idx) => {
    const decision = decisions[idx]!;
    return {
      packId: pack.packId,
      templateId: slot.templateId,
      version: slot.pinnedVersion,
      instanceId: decision.action === 'reuse' ? decision.instanceId : null,
    };
  });

  return {
    graphId: `reuse-graph.${pack.packId}.${pack.packVersion}`,
    nodes,
    edges,
  };
}

export function buildPackDependencyGraph(pack: IndustryPack): PackDependencyGraph {
  const nodes = [
    { id: pack.packId, type: 'department' as const, label: pack.name },
    ...pack.defaultDepartments.map((slot) => ({
      id: slot.slotId,
      type: 'department' as const,
      label: slot.displayName,
    })),
    ...pack.defaultAssets.map((asset) => ({
      id: asset.assetId,
      type: 'asset' as const,
      label: asset.assetId,
    })),
  ];

  const edges = pack.defaultDepartments.flatMap((slot) =>
    slot.dependencies.map((dep) => ({
      from: slot.slotId,
      to: dep,
      relation: 'depends-on' as const,
    }))
  );

  return {
    graphId: `dep-graph.${pack.packId}.${pack.packVersion}`,
    packId: pack.packId,
    nodes,
    edges,
  };
}

function buildDepartmentPlan(
  slot: IndustryPackDepartmentSlot,
  pack: IndustryPack,
  sharedRegistry: SharedDepartmentRegistry,
  changedSlotIds?: Set<string>
): HeadquartersDepartmentPlan {
  const reuse = resolveDepartmentReuse({ slot, pack, sharedRegistry, changedSlotIds });
  const template = getDepartmentTemplate(slot.templateId)!;

  return {
    slotId: slot.slotId,
    templateId: slot.templateId,
    pinnedVersion: slot.pinnedVersion,
    displayName: slot.displayName,
    reuse,
    constructionTemplateId: template.constructionTemplateId,
    materialLibraryId: pack.materialLibraryId,
    lightingProfileId: pack.lightingProfileId,
    cameraPackId: pack.cameraPackId,
    requiresGeneration: reuse.action === 'generate',
  };
}

/**
 * Headquarters generation plan — Experience Lab generates ALL departments together.
 */
export function buildHeadquartersGenerationPlan(input: {
  pack: IndustryPack;
  organizationId: string;
  sharedRegistry: SharedDepartmentRegistry;
  changedSlotIds?: Set<string>;
}): HeadquartersGenerationPlan {
  const { pack, organizationId, sharedRegistry, changedSlotIds } = input;
  const departments = pack.defaultDepartments.map((slot) =>
    buildDepartmentPlan(slot, pack, sharedRegistry, changedSlotIds)
  );

  const reuseInstanceIds = departments
    .filter((d) => d.reuse.action === 'reuse')
    .map((d) => (d.reuse as Extract<DepartmentReuseDecision, { action: 'reuse' }>).instanceId);

  const generateSlotIds = departments.filter((d) => d.requiresGeneration).map((d) => d.slotId);

  const reuseDecisions = departments.map((d) => d.reuse);

  return {
    planVersion: INDUSTRY_PACKS_VERSION,
    packId: pack.packId,
    packVersion: pack.packVersion,
    archetypeId: pack.archetypeId,
    organizationId,
    headquartersBlueprintId: pack.blueprintTemplateId,
    departments,
    reuseInstanceIds,
    generateSlotIds,
    estimatedNewGenerations: generateSlotIds.length,
    estimatedReusedDepartments: reuseInstanceIds.length,
    generationPriority: [...GENERATION_PRIORITY_ORDER],
    packDependencyGraph: buildPackDependencyGraph(pack),
    departmentReuseGraph: buildDepartmentReuseGraph(pack, reuseDecisions),
  };
}

/** Never regenerate entire HQ when only one department changed. */
export function planHeadquartersDeltaUpdate(input: {
  pack: IndustryPack;
  organizationId: string;
  sharedRegistry: SharedDepartmentRegistry;
  changedTemplateId: DepartmentTemplateId;
}): HeadquartersGenerationPlan {
  const changedSlotIds = new Set(
    input.pack.defaultDepartments
      .filter((s) => s.templateId === input.changedTemplateId)
      .map((s) => s.slotId)
  );
  return buildHeadquartersGenerationPlan({
    pack: input.pack,
    organizationId: input.organizationId,
    sharedRegistry: input.sharedRegistry,
    changedSlotIds,
  });
}
