import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from '../studio-builder/genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import { getLayerDefinition } from './layer-catalog';
import {
  formatBlueprintPromptClause,
  resolveMasterSceneBlueprint,
} from './master-scene-blueprint';
import { isBlendCompositeLayer } from './reference-chain';
import {
  buildIsolatedLayerPromptClauses,
  isolatedPromptContractVersion,
  resolveIsolatedOutputFormat,
} from './isolated-layer-prompt';
import { getIsolatedLayerContract, isIsolatedObjectLayer } from './isolated-layer-contract';
import { getSceneStackStation, requireSceneStackManifest } from './station-manifest';
import type { CompiledSceneStackLayerPrompt, SceneStackLayerId } from './types';
import { SCENE_STACK_PROMPT_VERSION } from './types';

const LAYER_ISOLATION: Record<SceneStackLayerId, string> = {
  'environment-shell':
    'LAYER PASS 01 ENVIRONMENT SHELL ONLY — architecture walls ceiling floor structure proportions. NO furniture NO hero objects NO lighting effects NO atmosphere NO people NO UI.',
  'signature-landmark':
    'LAYER PASS 02 SIGNATURE LANDMARK ONLY — hero object / landmark isolated. NO full room rebuild NO UI.',
  'furniture-objects':
    'LAYER PASS 03 FURNITURE AND PHYSICAL OBJECTS ONLY — desks shelves props equipment. NO architecture rebuild NO lighting pass.',
  'lighting-systems':
    'LAYER PASS 04 LIGHTING SYSTEMS ONLY — light pools accents tracks coffer glow reflections. Overlay-friendly pass.',
  'atmospheric-systems':
    'LAYER PASS 05 ATMOSPHERIC SYSTEMS ONLY — volumetric haze depth air particles subtle fog. Transparent overlay when possible.',
  'surface-materials':
    'LAYER PASS 06 SURFACE MATERIALS AND DETAIL ONLY — bronze stone glass metal texture richness.',
  'ambient-motion':
    'LAYER PASS 07 AMBIENT MOTION HINT — subtle motion blur trails shimmer particles. Transparent overlay when possible.',
  interaction: '',
  'runtime-effects': '',
  'founder-personalization':
    'LAYER PASS 10 FOUNDER PERSONALIZATION ONLY — genome-adapted accents materials expression without rebuilding shell.',
};

export function compileSceneStackLayerPrompt(input: {
  departmentId: string;
  stationId: string;
  layerId: SceneStackLayerId;
  workspaceId?: string;
  projectId?: string;
  /** Shell placement URL only — never prior generative layers */
  referenceImageUrls?: string[];
  /** Regeneration attempt for isolated layers (0 = first pass) */
  isolationAttempt?: number;
}): CompiledSceneStackLayerPrompt {
  const pkg = requireDepartmentPackage(input.departmentId);
  const manifest = requireSceneStackManifest(input.departmentId);
  const station = getSceneStackStation(input.departmentId, input.stationId);
  if (!station) throw new Error(`Scene Stack station not found: ${input.stationId}`);

  const layerPrompt = station.layerPrompts[input.layerId];
  if (!layerPrompt) {
    throw new Error(`No layer prompt for ${input.stationId}/${input.layerId}`);
  }

  const blueprint = resolveMasterSceneBlueprint({
    departmentId: input.departmentId,
    projectId: input.projectId ?? 'default',
    stationId: input.stationId,
    workspaceId: input.workspaceId,
  });

  const layerDef = getLayerDefinition(input.layerId);
  const contract = getIsolatedLayerContract(input.layerId);
  const company = resolveCompanyGenomeSnapshot(input.workspaceId);
  const project = resolveActiveProjectGenome(input.departmentId);
  const feeling = pkg.roomDna.defaultFeeling.join(', ');
  const forbidden = pkg.roomDna.forbiddenFeeling.join(', ');

  const isolatedClauses = isIsolatedObjectLayer(input.layerId)
    ? buildIsolatedLayerPromptClauses({
        layerId: input.layerId,
        displayName: layerDef.displayName,
        stationName: station.displayName,
        objectDescription: layerPrompt.primary,
        isolationAttempt: input.isolationAttempt ?? 0,
      })
    : null;

  const perspectiveClause = isIsolatedObjectLayer(input.layerId)
    ? 'PERSPECTIVE METADATA ONLY: Match station camera angle and approximate scale from blueprint — do NOT redraw shell, walls, or room.'
    : (input.referenceImageUrls?.length ?? 0) > 0
      ? 'PLACEMENT REFERENCE ONLY: Shell reference defines camera angle and room geometry for positioning — NOT an image to redraw or re-encode. Do NOT include walls, ceiling, floor, or any prior layer content in output.'
      : '';

  const outputClause = (() => {
    if (isolatedClauses) return isolatedClauses.outputClause;
    if (input.layerId === 'environment-shell') {
      return 'OUTPUT: Full environment shell plate — architecture only. This is the ONLY layer pass permitted as a full-scene render.';
    }
    if (isBlendCompositeLayer(input.layerId)) {
      return 'OUTPUT: Isolated lighting/atmosphere/particle/material overlay on pure black (#000000) or transparent background for runtime CSS blend. NOT a full scene.';
    }
    return 'OUTPUT: Isolated asset plate — ONLY this pass\'s landmark/furniture/objects with transparent background outside subjects. NOT a full scene.';
  })();

  const isolationBody = isolatedClauses
    ? isolatedClauses.isolationClause
    : LAYER_ISOLATION[input.layerId];

  const prompt = [
    `SCENE STACK™ — ${layerDef.displayName.toUpperCase()}.`,
    `STATION: ${station.displayName} · ${station.stationId}.`,
    `CONTRACT: ${contract.generationMode} · ${isolatedPromptContractVersion()}.`,
    formatBlueprintPromptClause(blueprint, input.layerId),
    isolationBody,
    perspectiveClause,
    outputClause,
    layerPrompt.primary,
    `PROJECT: ${project.name}. ROOM DNA: ${feeling}. Avoid: ${forbidden}.`,
    `Company ${company.companyName}: ${company.editorialDirection}.`,
    `OUTPUT: Mobile portrait ${manifest.aspectRatio} · single isolated layer pass · photoreal · compositing-ready · no UI chrome.`,
    `NEGATIVE: complete scene single image full room render cumulative layer stack re-encoded reference prior layers baked composite dashboard UI ${layerPrompt.negative}${isolatedClauses ? ` ${isolatedClauses.negativeClause}` : ''}`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: isolatedClauses?.negativeClause ?? layerPrompt.negative,
    aspectRatio: manifest.aspectRatio,
    outputFormat: resolveIsolatedOutputFormat(input.layerId, manifest.outputFormat),
    stationId: input.stationId,
    layerId: input.layerId,
    productionGroupId: layerPrompt.productionGroupId,
    heroAssetId: layerPrompt.heroAssetId,
    promptVersion: SCENE_STACK_PROMPT_VERSION,
    blueprintId: blueprint.blueprintId,
  };
}
