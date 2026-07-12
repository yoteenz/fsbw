import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from '../studio-builder/genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import { getLayerDefinition } from './layer-catalog';
import { resolveMasterSceneBlueprint } from './master-scene-blueprint';
import { isBlendCompositeLayer } from './reference-chain';
import { resolveIsolatedOutputFormat } from './isolated-layer-prompt';
import { getIsolatedLayerContract, isIsolatedObjectLayer } from './isolated-layer-contract';
import { buildIsolatedAssetPrompt, ISOLATED_ASSET_PROMPT_CONTRACT_VERSION } from './isolated-asset-prompt';
import { resolveSceneStackLayerModelRoute } from './layer-model-routing';
import {
  resolveBrandMaterialPackage,
  isBrandAssetResolutionError,
  CIRCULAR_CONCIERGE_DESK_SPEC,
} from '../creative-production/brand-asset-grounding';
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
  organizationId?: string;
  /** When true, resolve brand materials for isolated layers */
  brandGrounding?: boolean;
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
  const organizationId = input.organizationId ?? input.workspaceId ?? 'frontal-slayer';
  const brandGrounding = input.brandGrounding !== false && isIsolatedObjectLayer(input.layerId);

  let brandMaterialPackage: import('../creative-production/brand-asset-grounding').BrandMaterialPackage | null = null;
  if (brandGrounding && isIsolatedObjectLayer(input.layerId)) {
    const materialResult = resolveBrandMaterialPackage({
      organizationId,
      organizationName: company.companyName,
      materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
    });
    if (!isBrandAssetResolutionError(materialResult)) {
      brandMaterialPackage = materialResult;
    }
  }

  const route = resolveSceneStackLayerModelRoute(input.layerId, input.isolationAttempt ?? 0, {
    organizationId,
    brandGroundingRequired: (brandMaterialPackage?.referenceUrls.length ?? 0) > 0,
  });
  const feeling = pkg.roomDna.defaultFeeling.join(', ');
  const forbidden = pkg.roomDna.forbiddenFeeling.join(', ');

  const isolatedAsset = isIsolatedObjectLayer(input.layerId)
    ? buildIsolatedAssetPrompt({
        layerId: input.layerId,
        objectDescription: layerPrompt.primary,
        stationName: station.displayName,
        blueprint,
        isolationAttempt: input.isolationAttempt ?? 0,
        organizationName: company.companyName,
        brandMaterialPackage,
      })
    : null;

  let prompt: string;
  let negativePrompt: string;
  let promptBuilderId: string;

  if (isolatedAsset) {
    prompt = [
      isolatedAsset.prompt,
      `MATERIAL LANGUAGE: ${feeling}. Avoid: ${forbidden}.`,
      `Company ${company.companyName}: ${company.editorialDirection}.`,
      `NEGATIVE: ${isolatedAsset.negativePrompt} ${layerPrompt.negative}`,
    ].join(' ');
    negativePrompt = isolatedAsset.negativePrompt;
    promptBuilderId = isolatedAsset.promptBuilderId;
  } else if (input.layerId === 'environment-shell') {
    prompt = [
      `SCENE STACK™ — ${layerDef.displayName.toUpperCase()}.`,
      `STATION: ${station.displayName} · ${station.stationId}.`,
      `CONTRACT: ${contract.generationMode} · ${ISOLATED_ASSET_PROMPT_CONTRACT_VERSION}.`,
      LAYER_ISOLATION[input.layerId],
      'OUTPUT: Full environment shell plate — architecture only. This is the ONLY layer pass permitted as a full-scene render.',
      layerPrompt.primary,
      `PROJECT: ${project.name}. ROOM DNA: ${feeling}. Avoid: ${forbidden}.`,
      `Company ${company.companyName}: ${company.editorialDirection}.`,
      `OUTPUT: Mobile portrait ${manifest.aspectRatio} · architecture shell · photoreal · no UI chrome.`,
      `NEGATIVE: furniture hero objects lighting effects atmosphere people UI ${layerPrompt.negative}`,
    ].join(' ');
    negativePrompt = layerPrompt.negative;
    promptBuilderId = 'environment-shell-prompt.v1';
  } else if (isBlendCompositeLayer(input.layerId)) {
    prompt = [
      `SCENE STACK™ — ${layerDef.displayName.toUpperCase()}.`,
      `STATION: ${station.displayName}.`,
      LAYER_ISOLATION[input.layerId],
      'OUTPUT: Isolated lighting/atmosphere/particle/material overlay on transparent or black background. NOT a full scene.',
      layerPrompt.primary,
      `NEGATIVE: full room interior architecture complete scene ${layerPrompt.negative}`,
    ].join(' ');
    negativePrompt = layerPrompt.negative;
    promptBuilderId = 'blend-overlay-prompt.v1';
  } else {
    prompt = [
      `SCENE STACK™ — ${layerDef.displayName.toUpperCase()}.`,
      LAYER_ISOLATION[input.layerId],
      layerPrompt.primary,
      `NEGATIVE: ${layerPrompt.negative}`,
    ].join(' ');
    negativePrompt = layerPrompt.negative;
    promptBuilderId = 'generic-layer-prompt.v1';
  }

  return {
    prompt,
    negativePrompt,
    aspectRatio: manifest.aspectRatio,
    outputFormat: resolveIsolatedOutputFormat(input.layerId, manifest.outputFormat),
    stationId: input.stationId,
    layerId: input.layerId,
    productionGroupId: layerPrompt.productionGroupId,
    heroAssetId: layerPrompt.heroAssetId,
    promptVersion: `${SCENE_STACK_PROMPT_VERSION}+${ISOLATED_ASSET_PROMPT_CONTRACT_VERSION}`,
    blueprintId: blueprint.blueprintId,
    generationMode: route.generationMode,
    promptBuilderId,
    providerModel: route.providerModel,
    textToImageOnly: route.textToImageOnly,
    referenceStrategy: route.referenceStrategy,
    routeId: route.routeId,
    brandMaterialPackage,
    brandReferenceUrls: brandMaterialPackage?.referenceUrls ?? [],
    resolutionTruth: route.resolutionTruth,
  };
}
