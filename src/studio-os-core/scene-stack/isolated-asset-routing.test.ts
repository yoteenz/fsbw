import { describe, expect, it } from 'vitest';
import { compileSceneStackLayerPrompt } from './prompt-compiler';
import { buildSignatureLandmarkPrompt, buildFurnitureObjectsPrompt } from './isolated-asset-prompt';
import {
  assertIsolatedPromptBeforeDispatch,
  buildEffectiveGenerationRequestRecord,
  PROHIBITED_ISOLATED_PROMPT_PATTERNS,
} from './effective-generation-request';
import {
  assertLayerGenerationModeAllowed,
  resolveLayerIdFromProductionGroupId,
  resolveSceneStackLayerModelRoute,
  SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
  SCENE_STACK_SHELL_FAL_MODEL,
  SCENE_STACK_MODEL_ROUTING_VERSION,
} from './layer-model-routing';
import { resolveMasterSceneBlueprint } from './master-scene-blueprint';
import { resolveBrandMaterialPackage, isBrandAssetResolutionError } from '../creative-production/brand-asset-grounding';

describe('layer model routing', () => {
  it('signature-landmark routes to text-to-image nano-banana-2', () => {
    const route = resolveSceneStackLayerModelRoute('signature-landmark');
    expect(route.generationMode).toBe('isolated-single-object');
    expect(route.providerModel).toBe(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL);
    expect(route.providerModel).toBe('fal-ai/nano-banana-2');
    expect(route.textToImageOnly).toBe(true);
    expect(route.referenceStrategy).toBe('placement-metadata-only');
    expect(route.routeId).toBe('nano-banana-2-isolated');
  });

  it('furniture-objects routes to isolated object group t2i NB2', () => {
    const route = resolveSceneStackLayerModelRoute('furniture-objects');
    expect(route.generationMode).toBe('isolated-object-group');
    expect(route.providerModel).toBe('fal-ai/nano-banana-2');
    expect(route.textToImageOnly).toBe(true);
  });

  it('environment-shell routes to img2img edit model unchanged', () => {
    const route = resolveSceneStackLayerModelRoute('environment-shell');
    expect(route.generationMode).toBe('full-scene-shell');
    expect(route.providerModel).toBe(SCENE_STACK_SHELL_FAL_MODEL);
    expect(route.textToImageOnly).toBe(false);
  });

  it('uses v2 configuration-driven routing version', () => {
    expect(SCENE_STACK_MODEL_ROUTING_VERSION).toBe('layer-model-routing.v2');
  });

  it('resolves layer id from production group with hyphenated station', () => {
    expect(resolveLayerIdFromProductionGroupId('scene-stack-executive-atrium-signature-landmark')).toBe(
      'signature-landmark'
    );
  });

  it('rejects full-scene-shell mode for landmark', () => {
    const result = assertLayerGenerationModeAllowed('signature-landmark', 'full-scene-shell');
    expect(result.ok).toBe(false);
  });

  it('brand grounding switches to NB2 edit endpoint', () => {
    const route = resolveSceneStackLayerModelRoute('signature-landmark', 0, {
      organizationId: 'frontal-slayer',
      brandGroundingRequired: true,
    });
    expect(route.providerEndpoint).toBe('fal-ai/nano-banana-2/edit');
  });
});

describe('isolated asset prompts', () => {
  const blueprint = resolveMasterSceneBlueprint({
    departmentId: 'creative-direction',
    projectId: 'default',
    stationId: 'story-table',
  });

  const brandPkg = resolveBrandMaterialPackage({
    organizationId: 'frontal-slayer',
    organizationName: 'Frontal Slayer',
    materialRequests: [
      { slot: 'deskBase', requestedMaterial: 'white polished marble', required: true },
    ],
  });

  it('signature landmark uses v3 brand-grounded prompt builder', () => {
    const built = buildSignatureLandmarkPrompt({
      landmarkDescription: 'Bronze helix sculpture',
      stationName: 'Story Table',
      blueprint,
      organizationName: 'Frontal Slayer',
      brandMaterialPackage: isBrandAssetResolutionError(brandPkg) ? null : brandPkg,
    });
    expect(built.promptBuilderId).toBe('signature-landmark-isolated-prompt.v3');
    expect(built.prompt).toMatch(/TASK IDENTITY/i);
    expect(built.prompt).toMatch(/transparent background/i);
    expect(built.prompt).toMatch(/do not invent or substitute another marble/i);
    expect(built.prompt).toMatch(/FORBIDDEN MATERIAL SUBSTITUTIONS/i);
    expect(built.negativePrompt).toMatch(/generic white marble/i);
  });

  it('furniture uses v3 prompt builder', () => {
    const built = buildFurnitureObjectsPrompt({
      furnitureDescription: 'Executive desk cluster',
      stationName: 'Story Table',
      blueprint,
      organizationName: 'Frontal Slayer',
      brandMaterialPackage: isBrandAssetResolutionError(brandPkg) ? null : brandPkg,
    });
    expect(built.promptBuilderId).toBe('furniture-objects-isolated-prompt.v3');
    expect(built.prompt).toMatch(/object-group/i);
  });

  it('compiled prompt routes through model registry for landmark', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
      organizationId: 'frontal-slayer',
    });
    expect(compiled.promptBuilderId).toBe('signature-landmark-isolated-prompt.v3');
    expect(compiled.textToImageOnly).toBe(false);
    expect(compiled.providerModel).toBe('fal-ai/nano-banana-2/edit');
    expect(compiled.brandReferenceUrls?.length).toBeGreaterThan(0);
    expect(compiled.routeId).toBe('nano-banana-2-isolated-edit');
    for (const pattern of PROHIBITED_ISOLATED_PROMPT_PATTERNS) {
      const positivePrompt = compiled.prompt.split(/\bNEGATIVE:/i)[0] ?? compiled.prompt;
      expect(positivePrompt).not.toMatch(pattern);
    }
  });

  it('asserts isolated prompt contract before dispatch', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
      organizationId: 'frontal-slayer',
    });
    const result = assertIsolatedPromptBeforeDispatch({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      generationMode: 'isolated-single-object',
      referenceImageUrls: [],
      brandReferenceUrls: compiled.brandReferenceUrls,
      textToImageOnly: compiled.textToImageOnly === true,
      organizationId: 'frontal-slayer',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects dominant shell reference for isolated mode', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
      organizationId: 'frontal-slayer',
    });
    const result = assertIsolatedPromptBeforeDispatch({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      generationMode: 'isolated-single-object',
      referenceImageUrls: ['https://example.com/shell.png'],
      textToImageOnly: false,
      organizationId: 'frontal-slayer',
    });
    expect(result.ok).toBe(false);
  });

  it('records effective generation request with brand metadata', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
      organizationId: 'frontal-slayer',
    });
    const record = buildEffectiveGenerationRequestRecord({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      negativePrompt: compiled.negativePrompt,
      outputFormat: compiled.outputFormat,
      aspectRatio: compiled.aspectRatio,
      compileRunId: 'run-test',
      organizationId: 'frontal-slayer',
      routeId: compiled.routeId,
      brandReferenceUrls: compiled.brandReferenceUrls,
      brandReferenceChecksums: compiled.brandMaterialPackage?.referenceChecksums,
      materialMappings: compiled.brandMaterialPackage?.materialMappings,
      resolutionTruth: compiled.resolutionTruth,
    });
    expect(record.providerModel).toBe('fal-ai/nano-banana-2/edit');
    expect(record.schemaVersion).toBe('effective-generation-request.v2');
    expect(record.shellImageSupplied).toBe(false);
    expect(record.brandReferenceUrls.length).toBeGreaterThan(0);
    expect(record.routeId).toBe('nano-banana-2-isolated-edit');
    expect(record.resolutionRequested).toBe('4K');
  });
});
