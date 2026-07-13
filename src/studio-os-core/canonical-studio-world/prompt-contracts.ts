import { buildArchitectureLawNegativeDirective, buildArchitectureLawPositiveDirective } from '../architecture-law-001/prompt-directives';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';

export const CANONICAL_PROMPT_CONTRACT_VERSION = 'canonical-prompt-contract.v1' as const;

export type CanonicalDepartmentPromptContract = {
  contractVersion: typeof CANONICAL_PROMPT_CONTRACT_VERSION;
  promptVersion: string;
  departmentId: CanonicalMainDepartmentId;
  artifactIntent: 'master-founder-landscape';
  modelRoute: 'nano-banana-pro-full-scene';
  portraitModelRoute: 'nano-banana-pro-edit-recompose';
  isolatedAssetRoute: 'nano-banana-2';
  positivePrompt: string;
  negativePrompt: string;
};

export function buildCanonicalDepartmentPromptContract(
  departmentId: CanonicalMainDepartmentId
): CanonicalDepartmentPromptContract | { ok: false; code: string; message: string } {
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    return { ok: false, code: 'DEPARTMENT_UNKNOWN', message: `Unknown canonical department: ${departmentId}` };
  }

  const charter = resolveDepartmentCharter(departmentId);
  const base = [
    `CANONICAL DEPARTMENT: ${record.name}`,
    `MISSION: ${charter.mission}`,
    `ATMOSPHERE: ${charter.atmosphere}`,
    `METAPHOR: ${charter.architecturalMetaphor}`,
    `COMMAND DOCK PROFILE: ${record.commandDockProfile} — physical shell only, blank displays.`,
    `WORKBENCH PROFILE: ${record.workbenchProfile} — physical console only, blank tool housings.`,
    buildArchitectureLawPositiveDirective(),
  ].join('\n\n');

  return {
    contractVersion: CANONICAL_PROMPT_CONTRACT_VERSION,
    promptVersion: record.departmentPromptVersion,
    departmentId,
    artifactIntent: 'master-founder-landscape',
    modelRoute: 'nano-banana-pro-full-scene',
    portraitModelRoute: 'nano-banana-pro-edit-recompose',
    isolatedAssetRoute: 'nano-banana-2',
    positivePrompt: base,
    negativePrompt: buildArchitectureLawNegativeDirective(),
  };
}

export function resolveCanonicalDepartmentModelRoute(intent: 'full-scene' | 'portrait' | 'isolated-asset'): string {
  if (intent === 'full-scene') return 'fal-ai/nano-banana-pro';
  if (intent === 'portrait') return 'fal-ai/nano-banana-pro/edit';
  return 'fal-ai/nano-banana-2/edit';
}
