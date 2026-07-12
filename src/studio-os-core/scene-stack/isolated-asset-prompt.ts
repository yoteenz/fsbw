import type { SceneStackLayerId } from './types';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import {
  buildPlacementMetadata,
  formatPlacementMetadataClause,
} from './placement-metadata';
import { resolveLayerGenerationMode } from './isolated-layer-contract';
import type { BrandMaterialPackage } from '../creative-production/brand-asset-grounding';

export const ISOLATED_ASSET_PROMPT_CONTRACT_VERSION = 'isolated-asset-prompt.v3';

const ISOLATED_NEGATIVE_PROMPT = [
  'full room',
  'complete interior',
  'architectural environment',
  'background scenery',
  'walls',
  'floor',
  'ceiling',
  'window',
  'door',
  'hallway',
  'office',
  'lobby',
  'showroom',
  'wide-angle room',
  'cinematic interior',
  'environmental render',
  'full-scene rerender',
  'complete composition',
  'redrawn reference image',
  'baked architecture',
  'room lighting',
  'landscape',
  'people',
  'text',
  'watermark',
  'frame',
  'border',
  'opaque backdrop',
  'checkerboard pattern',
  'interior redesign',
  'photorealistic room',
  'scene reconstruction',
  'shell recreation',
  'Carrara marble',
  'Calacatta marble',
  'generic white marble',
  'dramatic gray-veined marble',
  'gold-veined marble',
  'random luxury stone',
  'invented veining',
  'substitute marble',
].join(', ');

export type IsolatedAssetPromptResult = {
  prompt: string;
  negativePrompt: string;
  promptBuilderId: string;
  generationMode: ReturnType<typeof resolveLayerGenerationMode>;
  brandMaterialPackage?: BrandMaterialPackage | null;
};

function regenerationEmphasis(attempt: number): string {
  if (attempt <= 0) return '';
  return [
    'REGENERATION PASS — prior output was a full-scene rerender and is rejected.',
    'Remove every trace of room, architecture, walls, floor, ceiling, windows, and environment.',
    'Deliver ONLY the isolated object on transparent alpha in an invisible studio.',
    'Do not reproduce any reference environment pixels.',
    'Strengthen exact organization material fidelity — use approved brand references only.',
  ].join(' ');
}

function brandGroundingSections(input: {
  organizationName: string;
  brandPackage?: BrandMaterialPackage | null;
}): string[] {
  if (!input.brandPackage) return [];
  return [
    `BRAND IDENTITY: This asset belongs to ${input.organizationName} inside Studio World.`,
    'Use only the approved organization materials supplied with this request.',
    input.brandPackage.promptSections.organizationMaterialAssignments,
    input.brandPackage.promptSections.exactBrandAssetReferences,
    'The attached marble texture is the canonical marble for this organization. Do not invent or substitute another marble.',
    input.brandPackage.promptSections.forbiddenMaterialSubstitutions,
    'The asset must visually belong to the organization while remaining a standalone mountable object.',
  ];
}

export function buildSignatureLandmarkPrompt(input: {
  landmarkDescription: string;
  stationName: string;
  blueprint: MasterSceneBlueprint;
  isolationAttempt?: number;
  organizationName?: string;
  brandMaterialPackage?: BrandMaterialPackage | null;
}): IsolatedAssetPromptResult {
  const placement = formatPlacementMetadataClause(
    buildPlacementMetadata(input.blueprint, 'signature-landmark')
  );
  const attempt = input.isolationAttempt ?? 0;
  const orgName = input.organizationName ?? 'the organization';

  const prompt = [
    'TASK IDENTITY: You are generating one isolated production asset that will be composited into an existing environment later.',
    'OUTPUT SUBJECT: Generate only one signature landmark object.',
    `LANDMARK: ${input.landmarkDescription}.`,
    'OUTPUT PURPOSE: This is a separate Scene Stack object layer. It is NOT a room render. NOT an environment. NOT a completed scene. NOT an architectural redesign.',
    'REFERENCE RESTRICTION: No environment image is supplied. Brand material references may be supplied for exact material identity only. Use placement metadata only for viewing angle, perspective, approximate scale, orientation, and light direction. Do not reproduce, redraw, extend, repaint, imitate, preserve, or include any visual content from any reference environment.',
    ...brandGroundingSections({ organizationName: orgName, brandPackage: input.brandMaterialPackage }),
    'OUTPUT REQUIREMENTS: one isolated landmark · transparent background · clean alpha channel · complete object visible · transparent margin around object · neutral local illumination · no environmental shadows baked into background · correct camera-relative angle · realistic materials · production-ready edges · no floor plane · no pedestal unless part of landmark · no room geometry · no surrounding set.',
    'FORBIDDEN CONTENT: room · interior · office · lobby · hallway · walls · ceiling · floor · windows · doors · architecture · background · environment · ambient room lighting · complete composition · wide shot · cinematic environment · scene reconstruction · shell recreation · people · text · watermark · checkerboard background · generic marble substitution.',
    'FINAL EMPHASIS: Return the landmark as if it were a separately manufactured object photographed in an invisible studio. The output must be mountable over another image without covering that image. Separately composited Scene Stack layer.',
    `STATION: ${input.stationName}.`,
    placement,
    'ISOLATED · object only · transparent background · no room · no architecture · separately composited · do not reproduce reference environment.',
    regenerationEmphasis(attempt),
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: ISOLATED_NEGATIVE_PROMPT,
    promptBuilderId: 'signature-landmark-isolated-prompt.v3',
    generationMode: 'isolated-single-object',
    brandMaterialPackage: input.brandMaterialPackage,
  };
}

export function buildFurnitureObjectsPrompt(input: {
  furnitureDescription: string;
  stationName: string;
  blueprint: MasterSceneBlueprint;
  isolationAttempt?: number;
  organizationName?: string;
  brandMaterialPackage?: BrandMaterialPackage | null;
}): IsolatedAssetPromptResult {
  const placement = formatPlacementMetadataClause(
    buildPlacementMetadata(input.blueprint, 'furniture-objects')
  );
  const attempt = input.isolationAttempt ?? 0;
  const orgName = input.organizationName ?? 'the organization';

  const prompt = [
    'TASK IDENTITY: You are generating one isolated object-group production asset for Scene Stack compositing.',
    'OUTPUT SUBJECT: Generate only the grouped furniture package with preserved relative arrangement.',
    `FURNITURE GROUP: ${input.furnitureDescription}.`,
    'OUTPUT PURPOSE: Separate Scene Stack object-group layer — NOT a room render, NOT an environment, NOT a completed scene.',
    'REFERENCE RESTRICTION: No environment image supplied. Brand material references may be supplied for exact material identity only. Placement metadata only. Do not reproduce any room architecture or reference environment.',
    ...brandGroundingSections({ organizationName: orgName, brandPackage: input.brandMaterialPackage }),
    'OUTPUT REQUIREMENTS: grouped furniture only · transparent background · alpha outside subjects · preserved arrangement · neutral local lighting · no floor · no walls · no room background.',
    'FORBIDDEN CONTENT: room · interior · architecture · floor · ceiling · walls · windows · environment · wide shot · complete composition · scene reconstruction · generic marble substitution.',
    'FINAL EMPHASIS: Deliver furniture as a separately manufactured package photographed in an invisible studio for compositing. Separately composited Scene Stack layer.',
    `STATION: ${input.stationName}.`,
    placement,
    'ISOLATED · object group only · transparent background · no room · no architecture · separately composited · do not reproduce reference environment.',
    regenerationEmphasis(attempt),
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: ISOLATED_NEGATIVE_PROMPT,
    promptBuilderId: 'furniture-objects-isolated-prompt.v3',
    generationMode: 'isolated-object-group',
    brandMaterialPackage: input.brandMaterialPackage,
  };
}

export function buildIsolatedAssetPrompt(input: {
  layerId: SceneStackLayerId;
  objectDescription: string;
  stationName: string;
  blueprint: MasterSceneBlueprint;
  isolationAttempt?: number;
  organizationName?: string;
  brandMaterialPackage?: BrandMaterialPackage | null;
}): IsolatedAssetPromptResult | null {
  if (input.layerId === 'signature-landmark') {
    return buildSignatureLandmarkPrompt({
      landmarkDescription: input.objectDescription,
      stationName: input.stationName,
      blueprint: input.blueprint,
      isolationAttempt: input.isolationAttempt,
      organizationName: input.organizationName,
      brandMaterialPackage: input.brandMaterialPackage,
    });
  }
  if (input.layerId === 'furniture-objects') {
    return buildFurnitureObjectsPrompt({
      furnitureDescription: input.objectDescription,
      stationName: input.stationName,
      blueprint: input.blueprint,
      isolationAttempt: input.isolationAttempt,
      organizationName: input.organizationName,
      brandMaterialPackage: input.brandMaterialPackage,
    });
  }
  return null;
}
