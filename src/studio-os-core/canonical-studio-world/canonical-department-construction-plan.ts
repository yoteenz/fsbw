import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';
import { buildCanonicalDepartmentPromptContract } from './prompt-contracts';
import { buildCanonicalDepartmentBlueprint } from './department-blueprint-builder';

/** Brand vault alias — canonical renders use studio-os → frontal-slayer marble grounding. */
export const CANONICAL_RENDER_ORGANIZATION_ID = 'studio-os' as const;

export const CANONICAL_QUEUE_PROGRAM = 'canonical-studio-world' as const;

export const CANONICAL_QUEUE_CAPACITY = 4;

export function buildCanonicalDepartmentConstructionPlan(
  departmentId: CanonicalMainDepartmentId,
  renderKind: 'landscape' | 'portrait' = 'landscape'
): { ok: true; plan: ConstructionPlan } | { ok: false; code: string; message: string } {
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    return { ok: false, code: 'DEPARTMENT_UNKNOWN', message: `Unknown canonical department: ${departmentId}` };
  }

  const charter = resolveDepartmentCharter(departmentId);
  const contract = buildCanonicalDepartmentPromptContract(departmentId);
  if ('ok' in contract && contract.ok === false) return contract;
  if (!('positivePrompt' in contract)) {
    return { ok: false, code: 'PROMPT_CONTRACT_INVALID', message: 'Invalid prompt contract.' };
  }

  const revision = record.blueprintRevision;
  const requestId = `canonical-${departmentId}-${renderKind}-r${revision}`;

  const founderIntent = [
    `CANONICAL STUDIO WORLD DEPARTMENT — ${record.name}`,
    charter.mission,
    contract.positivePrompt.slice(0, 1200),
  ].join('\n\n');

  const plan = buildCanonicalDepartmentBlueprint({
    departmentId,
    organizationId: CANONICAL_RENDER_ORGANIZATION_ID,
    buildingId: 'studio-world-hq',
    floorId: 'canonical-infrastructure',
    requestId,
    renderKind,
    blueprintRevision: revision,
    promptVersion: record.departmentPromptVersion,
    founderIntent,
  });

  plan.versions.promptVersion = record.departmentPromptVersion;
  plan.planId = `canonical-plan-${departmentId}-${renderKind}-r${revision}`;

  return { ok: true, plan };
}
