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
} from './layer-model-routing';
import { resolveMasterSceneBlueprint } from './master-scene-blueprint';

describe('layer model routing', () => {
  it('signature-landmark routes to text-to-image nano-banana-pro', () => {
    const route = resolveSceneStackLayerModelRoute('signature-landmark');
    expect(route.generationMode).toBe('isolated-single-object');
    expect(route.providerModel).toBe(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL);
    expect(route.textToImageOnly).toBe(true);
    expect(route.referenceStrategy).toBe('placement-metadata-only');
  });

  it('furniture-objects routes to isolated object group t2i', () => {
    const route = resolveSceneStackLayerModelRoute('furniture-objects');
    expect(route.generationMode).toBe('isolated-object-group');
    expect(route.textToImageOnly).toBe(true);
  });

  it('environment-shell routes to img2img edit model', () => {
    const route = resolveSceneStackLayerModelRoute('environment-shell');
    expect(route.generationMode).toBe('full-scene-shell');
    expect(route.providerModel).toBe(SCENE_STACK_SHELL_FAL_MODEL);
    expect(route.textToImageOnly).toBe(false);
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
});

describe('isolated asset prompts', () => {
  const blueprint = resolveMasterSceneBlueprint({
    departmentId: 'creative-direction',
    projectId: 'default',
    stationId: 'story-table',
  });

  it('signature landmark uses dedicated prompt builder', () => {
    const built = buildSignatureLandmarkPrompt({
      landmarkDescription: 'Bronze helix sculpture',
      stationName: 'Story Table',
      blueprint,
    });
    expect(built.promptBuilderId).toBe('signature-landmark-isolated-prompt.v2');
    expect(built.prompt).toMatch(/TASK IDENTITY/i);
    expect(built.prompt).toMatch(/transparent background/i);
    expect(built.prompt).toMatch(/do not reproduce reference environment/i);
    expect(built.negativePrompt).toMatch(/full room/i);
  });

  it('furniture uses dedicated prompt builder', () => {
    const built = buildFurnitureObjectsPrompt({
      furnitureDescription: 'Executive desk cluster',
      stationName: 'Story Table',
      blueprint,
    });
    expect(built.promptBuilderId).toBe('furniture-objects-isolated-prompt.v2');
    expect(built.prompt).toMatch(/object-group/i);
  });

  it('compiled prompt does not reuse shell room language for landmark', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
    });
    expect(compiled.promptBuilderId).toBe('signature-landmark-isolated-prompt.v2');
    expect(compiled.textToImageOnly).toBe(true);
    expect(compiled.providerModel).toBe(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL);
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
    });
    const result = assertIsolatedPromptBeforeDispatch({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      generationMode: 'isolated-single-object',
      referenceImageUrls: [],
      textToImageOnly: true,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects dominant shell reference for isolated mode', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
    });
    const result = assertIsolatedPromptBeforeDispatch({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      generationMode: 'isolated-single-object',
      referenceImageUrls: ['https://example.com/shell.png'],
      textToImageOnly: false,
    });
    expect(result.ok).toBe(false);
  });

  it('records effective generation request metadata', () => {
    const compiled = compileSceneStackLayerPrompt({
      departmentId: 'creative-direction',
      stationId: 'story-table',
      layerId: 'signature-landmark',
      projectId: 'default',
    });
    const record = buildEffectiveGenerationRequestRecord({
      layerId: 'signature-landmark',
      prompt: compiled.prompt,
      negativePrompt: compiled.negativePrompt,
      outputFormat: compiled.outputFormat,
      aspectRatio: compiled.aspectRatio,
      compileRunId: 'run-test',
    });
    expect(record.providerModel).toBe(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL);
    expect(record.textToImageOnly).toBe(true);
    expect(record.referenceCount).toBe(0);
    expect(record.shellImageSupplied).toBe(false);
    expect(record.promptBuilderId).toBe('signature-landmark-isolated-prompt.v2');
  });
});
