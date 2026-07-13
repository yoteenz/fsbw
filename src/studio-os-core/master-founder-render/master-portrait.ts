import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import {
  MASTER_FOUNDER_PORTRAIT_INTENT,
  MASTER_PORTRAIT_ASPECT,
  MASTER_PORTRAIT_PROMPT_VERSION,
  MASTER_FOUNDER_RENDER_VERSION,
  type MasterFounderRender,
  type MasterPortraitRender,
} from './contract';
import { canGenerateMasterPortrait } from './master-landscape';

export const PORTRAIT_RECOMPOSE_MANDATE = [
  'DO NOT redesign.',
  'DO NOT move architecture.',
  'DO NOT replace furniture.',
  'DO NOT invent materials.',
  'DO NOT change lighting.',
  'DO NOT regenerate layout.',
  'Preserve every architectural feature exactly.',
  'Only reposition the virtual camera for an optimized portrait composition while maintaining the exact room identity.',
].join(' ');

export function buildMasterPortraitRecomposeRequest(input: {
  portraitId: string;
  landscape: MasterFounderRender;
  plan: ConstructionPlan;
  jobId?: string | null;
  artifactUrl?: string | null;
  aiModel: string;
  status?: MasterPortraitRender['status'];
}): MasterPortraitRender {
  if (!canGenerateMasterPortrait(input.landscape)) {
    throw new Error('Master Portrait may only generate after Master Landscape is approved.');
  }

  return {
    renderVersion: MASTER_FOUNDER_RENDER_VERSION,
    portraitId: input.portraitId,
    masterLandscapeRenderId: input.landscape.renderId,
    landscapeArtifactUrl: input.landscape.artifactUrl!,
    aspectRatio: MASTER_PORTRAIT_ASPECT,
    artifactUrl: input.artifactUrl ?? null,
    jobId: input.jobId ?? null,
    status: input.status ?? 'no_preview',
    aiModel: input.aiModel,
    promptVersion: MASTER_PORTRAIT_PROMPT_VERSION,
    landscapeApprovedAt: input.landscape.approvedAt!,
    approvedAt: null,
    approvedBy: null,
  };
}

export function buildMasterPortraitRecomposePrompt(input: {
  plan: ConstructionPlan;
  landscapeUrl: string;
}): {
  prompt: string;
  negativePrompt: string;
  artifactIntent: typeof MASTER_FOUNDER_PORTRAIT_INTENT;
  referenceImageUrl: string;
} {
  const prompt = [
    `MASTER PORTRAIT RECOMPOSITION — NOT a new room.`,
    `REFERENCE: Approved Master Landscape at ${input.landscapeUrl}.`,
    `ROOM: ${input.plan.room.displayName} — same room as landscape reference.`,
    PORTRAIT_RECOMPOSE_MANDATE,
    `ASPECT: ${MASTER_PORTRAIT_ASPECT} portrait composition optimized for mobile and vertical devices.`,
    `PRIORITY FRAMING: Emphasize ${input.plan.room.displayName} hero elements while keeping identical architecture, materials, lighting, furniture, décor, reflections, logos, plants, and atmosphere.`,
    `OUTPUT: ${MASTER_PORTRAIT_PROMPT_VERSION} · ${MASTER_PORTRAIT_ASPECT} · 4K photoreal portrait recomposition.`,
  ].join('\n\n');

  const negativePrompt = [
    'new room design',
    'different chandelier',
    'different marble',
    'different walls',
    'different furniture layout',
    'different lighting mood',
    'redesigned architecture',
    'alternate building',
    'split scene',
  ].join(', ');

  return {
    prompt,
    negativePrompt,
    artifactIntent: MASTER_FOUNDER_PORTRAIT_INTENT,
    referenceImageUrl: input.landscapeUrl,
  };
}

export function approveMasterPortrait(
  portrait: MasterPortraitRender,
  approvedBy: string
): MasterPortraitRender {
  if (!portrait.artifactUrl?.startsWith('http')) {
    throw new Error('Cannot approve master portrait without artifact URL.');
  }
  return {
    ...portrait,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy,
  };
}
