import type { DepartmentUiSocketBlueprint } from '../architecture-law-001/ui-socket-registry';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { ApprovedMasterRenderHandoff } from '../master-founder-render/contract';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';
import { COMMAND_DOCK_SHELL_PROFILES, WORKBENCH_SHELL_PROFILES } from './shell-profiles';

export const CANONICAL_CDS_HANDOFF_VERSION = 'canonical-cds-handoff.v1' as const;

export type CanonicalCdsProductionHandoff = {
  handoffVersion: typeof CANONICAL_CDS_HANDOFF_VERSION;
  ownershipClass: 'CANONICAL_STUDIO_WORLD_DEPARTMENT';
  canonicalDepartmentId: CanonicalMainDepartmentId;
  departmentCharter: ReturnType<typeof resolveDepartmentCharter>;
  blueprint: { blueprintTemplateId: string; blueprintRevision: number };
  masterRenderHandoff: ApprovedMasterRenderHandoff | null;
  constructionPlan: ConstructionPlan | null;
  materialIntentId: string;
  lightingIntentId: string;
  compositionPackId: string;
  socketMap: DepartmentUiSocketBlueprint;
  commandDockPlaceholderMap: (typeof COMMAND_DOCK_SHELL_PROFILES)[string] | null;
  workbenchPlaceholderMap: (typeof WORKBENCH_SHELL_PROFILES)[string] | null;
  assetGraphNodeCount: number;
  approvedAt: string | null;
  approvedBy: string | null;
};

export function buildCanonicalCdsHandoff(input: {
  departmentId: CanonicalMainDepartmentId;
  socketMap: DepartmentUiSocketBlueprint;
  masterRenderHandoff?: ApprovedMasterRenderHandoff | null;
  constructionPlan?: ConstructionPlan | null;
  approvedBy?: string;
}): { ok: true; handoff: CanonicalCdsProductionHandoff } | { ok: false; code: string; message: string } {
  const record = getCanonicalDepartmentRecord(input.departmentId);
  if (!record) {
    return { ok: false, code: 'NOT_CANONICAL', message: `${input.departmentId} is not a canonical Studio World department.` };
  }

  if (record.lifecycleState !== 'AWAITING_APPROVAL' && record.lifecycleState !== 'IN_CDS' && record.lifecycleState !== 'PUBLISHED' && record.lifecycleState !== 'BLUEPRINT_READY') {
    // Allow handoff planning from blueprint-ready for pipeline integration
  }

  return {
    ok: true,
    handoff: {
      handoffVersion: CANONICAL_CDS_HANDOFF_VERSION,
      ownershipClass: 'CANONICAL_STUDIO_WORLD_DEPARTMENT',
      canonicalDepartmentId: input.departmentId,
      departmentCharter: resolveDepartmentCharter(input.departmentId),
      blueprint: {
        blueprintTemplateId: record.blueprintTemplateId,
        blueprintRevision: record.blueprintRevision,
      },
      masterRenderHandoff: input.masterRenderHandoff ?? null,
      constructionPlan: input.constructionPlan ?? null,
      materialIntentId: record.materialLibraryId,
      lightingIntentId: record.lightingProfileId,
      compositionPackId: record.compositionProfileId,
      socketMap: input.socketMap,
      commandDockPlaceholderMap: COMMAND_DOCK_SHELL_PROFILES[record.commandDockProfile] ?? null,
      workbenchPlaceholderMap: WORKBENCH_SHELL_PROFILES[record.workbenchProfile] ?? null,
      assetGraphNodeCount: 0,
      approvedAt: input.approvedBy ? new Date().toISOString() : null,
      approvedBy: input.approvedBy ?? null,
    },
  };
}

export function validateCanonicalCdsHandoff(
  handoff: CanonicalCdsProductionHandoff | null
): { ok: true } | { ok: false; code: string; message: string } {
  if (!handoff) {
    return { ok: false, code: 'HANDOFF_MISSING', message: 'CDS requires canonical department production handoff.' };
  }
  if (handoff.ownershipClass !== 'CANONICAL_STUDIO_WORLD_DEPARTMENT') {
    return { ok: false, code: 'WRONG_OWNERSHIP', message: 'Handoff must be canonical Studio World infrastructure.' };
  }
  if (!handoff.socketMap?.sockets?.length) {
    return { ok: false, code: 'SOCKET_MAP_MISSING', message: 'Socket metadata required for CDS canonical manufacturing.' };
  }
  if (!handoff.commandDockPlaceholderMap || !handoff.workbenchPlaceholderMap) {
    return { ok: false, code: 'SHELL_PLACEHOLDER_MISSING', message: 'Command Dock and Workbench placeholder maps required.' };
  }
  return { ok: true };
}
