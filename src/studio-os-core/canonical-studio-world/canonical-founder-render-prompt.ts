import { createHash } from 'node:crypto';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { BrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import { appendArchitectureLawToEnvironmentPrompt, appendArchitectureLawToNegativePrompt } from '../architecture-law-001/prompt-directives';
import type { CanonicalMainDepartmentId } from './canonical-department-registry';
import { getCanonicalDepartmentRecord } from './canonical-department-registry';
import { resolveDepartmentCharter } from './department-charters';
import { buildCanonicalDepartmentPromptContract } from './prompt-contracts';
import { resolveDepartmentFingerprint } from './department-architectural-fingerprints';

export type CanonicalFounderRenderPrompt = {
  prompt: string;
  negativePrompt: string;
  promptVersion: string;
  promptHash: string;
  departmentId: CanonicalMainDepartmentId;
  artifactIntent: 'master-founder-landscape';
  architecturalFingerprint: string[];
};

function hashPrompt(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function describeDepartmentAssets(plan: ConstructionPlan): string {
  const heroes = plan.heroAssets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId} (${a.assetClass})`;
  });
  const furniture = plan.furnitureSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  const decor = plan.decorSet.assets.map((a) => {
    const socket = plan.assetSockets.find((s) => s.socketId === a.socketId);
    return `${socket?.label ?? a.assetId}`;
  });
  return [
    heroes.length ? `Signature hero elements: ${heroes.join('; ')}.` : '',
    furniture.length ? `Department furniture: ${furniture.join('; ')}.` : '',
    decor.length ? `Department decor: ${decor.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildCanonicalFounderRenderPrompt(input: {
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  founderRevisionNote?: string | null;
}): CanonicalFounderRenderPrompt {
  const departmentId = input.plan.room.roomId as CanonicalMainDepartmentId;
  const record = getCanonicalDepartmentRecord(departmentId);
  if (!record) {
    throw new Error(`Cannot build canonical prompt for unknown department: ${departmentId}`);
  }

  const contract = buildCanonicalDepartmentPromptContract(departmentId);
  if ('ok' in contract && contract.ok === false) {
    throw new Error(contract.message);
  }
  if (!('positivePrompt' in contract)) {
    throw new Error('Invalid prompt contract');
  }

  const charter = resolveDepartmentCharter(departmentId);
  const fingerprint = resolveDepartmentFingerprint(departmentId);
  const camera = input.plan.cameraAnchors.find((c) => c.purpose === 'overview' || c.purpose === 'hero') ?? input.plan.cameraAnchors[0];
  const assetSummary = describeDepartmentAssets(input.plan);

  const mustInclude = charter.mustInclude?.length
    ? `MUST INCLUDE: ${charter.mustInclude.join(' · ')}.`
    : `MUST INCLUDE: ${fingerprint.signatureElements.join(' · ')}.`;
  const neverInclude = charter.neverInclude?.length
    ? `NEVER INCLUDE: ${charter.neverInclude.join(' · ')}.`
    : `NEVER INCLUDE: ${fingerprint.forbiddenElements.slice(0, 6).join(' · ')}.`;

  const sections = [
    `CANONICAL DEPARTMENT RENDER — ${record.name}`,
    `DEPARTMENT ID: ${departmentId}`,
    `PROMPT VERSION: ${record.departmentPromptVersion}`,
    `BLUEPRINT: ${input.plan.architecture.architectureId} v${input.plan.architecture.version} · Shell ${input.plan.architecture.shellSpecId}`,
    contract.positivePrompt,
    `ARCHITECTURAL CHARTER: ${charter.mission}`,
    `VISUAL IDENTITY: ${charter.visualIdentity} — ${charter.atmosphere}`,
    `ARCHITECTURAL METAPHOR: ${charter.architecturalMetaphor}`,
    `ARCHITECTURAL FINGERPRINT™: ${fingerprint.signatureElements.join(' · ')}`,
    mustInclude,
    neverInclude,
    `ROOM PURPOSE: ${input.plan.room.purpose}`,
    `COMPLETE-ROOM REQUIREMENT: Generate ONE complete photoreal interior environment unique to ${record.name}. NOT a reception lobby. NOT a generic luxury room. NOT a shared template.`,
    `ARCHITECTURAL LAYOUT: ${input.plan.architecture.architectureId} — department-specific shell. Circulation zones per ${departmentId} charter.`,
    `DEPARTMENT ASSET PLACEMENT: ${assetSummary}`,
    `BRAND MATERIAL ASSIGNMENTS: ${input.plan.materialSet.materialIds.join(', ')}. ${input.brandPackage.promptSections.organizationMaterialAssignments}`,
    `LIGHTING PROFILE: ${input.plan.lightingProfile.profileId} — ${input.plan.lightingProfile.colorTemperatureK}K.`,
    `CAMERA: ${camera?.label ?? 'Wide interior'} — ${camera?.position ?? 'eye-level wide interior'}.`,
    `COMMAND DOCK: ${record.commandDockProfile} — physical shell only, blank displays.`,
    `WORKBENCH: ${record.workbenchProfile} — physical console only, blank tool housings.`,
    input.founderRevisionNote ? `FOUNDER REVISION: ${input.founderRevisionNote}` : '',
    `OUTPUT: ${record.departmentPromptVersion} · 16:9 cinematic interior · 4K photoreal · department-isolated.`,
  ].filter(Boolean);

  const prompt = appendArchitectureLawToEnvironmentPrompt(sections.join('\n\n'));
  const negativePrompt = appendArchitectureLawToNegativePrompt(
    [
      contract.negativePrompt,
      'reception desk',
      'concierge desk',
      'waiting lounge',
      'reception foyer',
      'receptionist furniture',
      'corporate lobby',
      'generic luxury room',
      'shared reception template',
      'ReceptionShell',
      ...fingerprint.forbiddenElements,
    ].join(', ')
  );

  return {
    prompt,
    negativePrompt,
    promptVersion: record.departmentPromptVersion,
    promptHash: hashPrompt(prompt),
    departmentId,
    artifactIntent: 'master-founder-landscape',
    architecturalFingerprint: fingerprint.signatureElements,
  };
}
