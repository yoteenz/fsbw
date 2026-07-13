import { createHash } from 'node:crypto';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { BrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import { FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION } from './contract';

export type FounderFullRoomPrompt = {
  prompt: string;
  negativePrompt: string;
  promptVersion: typeof FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION;
  promptHash: string;
};

function hashPrompt(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function describeAssets(plan: ConstructionPlan): string {
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
    heroes.length ? `Hero assets: ${heroes.join('; ')}.` : '',
    furniture.length ? `Furniture: ${furniture.join('; ')}.` : '',
    decor.length ? `Decor: ${decor.join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildFounderFullRoomPreviewPrompt(input: {
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  founderRevisionNote?: string | null;
}): FounderFullRoomPrompt {
  const { plan, brandPackage } = input;
  const camera = plan.cameraAnchors.find((c) => c.purpose === 'overview' || c.purpose === 'hero') ?? plan.cameraAnchors[0];
  const materials = plan.materialSet.materialIds.join(', ');
  const assetSummary = describeAssets(plan);

  const sections = [
    `ROOM IDENTITY: ${plan.room.displayName} — ${plan.room.purpose}. Building ${plan.building.displayName}, floor ${plan.floor.displayName}.`,
    `ROOM PURPOSE: ${plan.room.purpose}. Organization visual language: ${plan.styleProfile.visualLanguage}.`,
    `COMPLETE-ROOM REQUIREMENT: Generate ONE complete photoreal interior room. This is a full environment preview for founder approval — NOT an isolated object, NOT a diagram, NOT a blueprint, NOT CAD, NOT wireframe, NOT procedural clay, NOT abstract geometry, NOT a UI mockup.`,
    `ARCHITECTURAL LAYOUT: Architecture ${plan.architecture.architectureId} v${plan.architecture.version}. Shell spec ${plan.architecture.shellSpecId}. Circulation and interaction zones per plan. Collision zones respected.`,
    `HERO AND FURNITURE PLACEMENT: ${assetSummary}`,
    `BRAND MATERIAL ASSIGNMENTS: ${materials}. ${brandPackage.promptSections.organizationMaterialAssignments}`,
    `LIGHTING PROFILE: ${plan.lightingProfile.profileId} — ${plan.lightingProfile.colorTemperatureK}K, reflection ${plan.lightingProfile.reflectionIntensity}, shadow softness ${plan.lightingProfile.shadowSoftness}, ambient ${plan.lightingProfile.ambientProfile}.`,
    `CAMERA AND COMPOSITION: ${camera?.label ?? 'Wide interior'} — ${camera?.position ?? 'eye-level wide interior'}, ${camera?.orientation ?? 'natural architectural lens'}. Wide interior composition with clear foreground, midground, and background. No extreme fisheye. No dutch angle.`,
    `IMMERSIVE 3D-WORLD: Photoreal immersive explorable interior. Architecture, furniture, lighting, and hero assets appear together in one cohesive finished room visualization.`,
    `FOUNDER AESTHETIC: Luxury editorial interior photography quality. Trustworthy creative visualization of the intended finished room before manufacturing.`,
    `ASSET SEPARABILITY: Objects should read as distinct elements within the room even though this is one full-scene render.`,
    brandPackage.promptSections.forbiddenMaterialSubstitutions
      ? `FORBIDDEN OUTPUTS: ${brandPackage.promptSections.forbiddenMaterialSubstitutions}`
      : '',
    ...(plan.negativeRules.length ? [`PLAN NEGATIVE RULES: ${plan.negativeRules.join(' · ')}`] : []),
    input.founderRevisionNote ? `FOUNDER REVISION: ${input.founderRevisionNote}` : '',
    `OUTPUT: ${FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION} · 16:9 cinematic interior · 4K photoreal.`,
  ].filter(Boolean);

  const prompt = sections.join('\n\n');
  const negativePrompt = [
    'isolated object on transparent background',
    'product cutout',
    'wireframe',
    'blueprint diagram',
    'CAD view',
    'floor plan',
    'bounding boxes',
    'clay block proxy',
    'procedural placeholder',
    'UI mockup',
    'checkerboard transparency',
    'generic random marble',
    'Carrara substitute',
    'Calacatta substitute',
  ].join(', ');

  return {
    prompt,
    negativePrompt,
    promptVersion: FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
    promptHash: hashPrompt(prompt),
  };
}
