import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from '../studio-builder/genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import { getLayerDefinition } from './layer-catalog';
import { getSceneStackStation, requireSceneStackManifest } from './station-manifest';
import type { CompiledSceneStackLayerPrompt, SceneStackLayerId } from './types';
import { SCENE_STACK_PROMPT_VERSION } from './types';

const LAYER_ISOLATION: Record<SceneStackLayerId, string> = {
  'environment-shell':
    'LAYER PASS 01 ENVIRONMENT SHELL ONLY — architecture walls ceiling floor structure proportions. NO furniture NO hero objects NO lighting effects NO atmosphere NO people NO UI.',
  'signature-landmark':
    'LAYER PASS 02 SIGNATURE LANDMARK ONLY — department hero object isolated in scene context. NO full room rebuild NO UI.',
  'furniture-objects':
    'LAYER PASS 03 FURNITURE AND PHYSICAL OBJECTS ONLY — desks shelves props equipment. NO architecture rebuild NO lighting pass.',
  'lighting-systems':
    'LAYER PASS 04 LIGHTING SYSTEMS ONLY — light pools accents tracks coffer glow reflections. Dark-friendly lighting pass for compositing.',
  'atmospheric-systems':
    'LAYER PASS 05 ATMOSPHERIC SYSTEMS ONLY — volumetric haze depth air particles subtle fog.',
  'surface-materials':
    'LAYER PASS 06 SURFACE MATERIALS AND DETAIL ONLY — bronze stone glass metal texture richness.',
  'ambient-motion':
    'LAYER PASS 07 AMBIENT MOTION HINT — subtle motion blur trails shimmer for idle life compositing.',
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
  /** Approved layer URLs locked before this pass — prompts FAL to preserve geometry. */
  referenceImageUrls?: string[];
}): CompiledSceneStackLayerPrompt {
  const pkg = requireDepartmentPackage(input.departmentId);
  const manifest = requireSceneStackManifest(input.departmentId);
  const station = getSceneStackStation(input.departmentId, input.stationId);
  if (!station) throw new Error(`Scene Stack station not found: ${input.stationId}`);

  const layerPrompt = station.layerPrompts[input.layerId];
  if (!layerPrompt) {
    throw new Error(`No layer prompt for ${input.stationId}/${input.layerId}`);
  }

  const layerDef = getLayerDefinition(input.layerId);
  const company = resolveCompanyGenomeSnapshot(input.workspaceId);
  const project = resolveActiveProjectGenome(input.departmentId);
  const feeling = pkg.roomDna.defaultFeeling.join(', ');
  const forbidden = pkg.roomDna.forbiddenFeeling.join(', ');

  const hasAnchor = (input.referenceImageUrls?.length ?? 0) > 0;
  const anchorClause = hasAnchor
    ? 'CRITICAL ANCHOR: Reference image defines locked architecture, camera angle, room geometry, and shell. Preserve exactly — add ONLY this layer pass on top. Do NOT rebuild walls, ceiling, floor, or replace the environment shell.'
    : '';

  const prompt = [
    `SCENE STACK™ — ${layerDef.displayName.toUpperCase()}.`,
    `STATION: ${station.displayName} · ${station.stationId}.`,
    LAYER_ISOLATION[input.layerId],
    anchorClause,
    layerPrompt.primary,
    `PROJECT: ${project.name}. ROOM DNA: ${feeling}. Avoid: ${forbidden}.`,
    `Company ${company.companyName}: ${company.editorialDirection}.`,
    `OUTPUT: Mobile portrait ${manifest.aspectRatio} · single layer pass · photoreal · compositing-ready · no UI chrome.`,
    `NEGATIVE: complete scene single image full room render dashboard UI ${layerPrompt.negative}`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    prompt,
    negativePrompt: layerPrompt.negative,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    stationId: input.stationId,
    layerId: input.layerId,
    productionGroupId: layerPrompt.productionGroupId,
    heroAssetId: layerPrompt.heroAssetId,
    promptVersion: SCENE_STACK_PROMPT_VERSION,
  };
}
