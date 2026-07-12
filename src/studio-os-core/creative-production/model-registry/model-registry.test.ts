import { describe, expect, it } from 'vitest';
import {
  resolveModelRoute,
  resolveSceneStackLayerModelRouteFromRegistry,
  SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL,
  SCENE_STACK_SHELL_FAL_MODEL,
  MODEL_REGISTRY_POLICY_VERSION,
  rollbackIsolatedRouteTo,
  NANO_BANANA_2_PRODUCTION_QUALITY,
  classifyResolutionTruth,
  buildNanoBanana2FalInput,
} from './index';

describe('Model Registry', () => {
  it('resolves Nano Banana 2 for signature landmarks', () => {
    const route = resolveModelRoute({ assetClass: 'signature-landmark' });
    expect(route.endpointId).toBe('fal-ai/nano-banana-2');
    expect(route.routeId).toBe('nano-banana-2-isolated');
  });

  it('resolves Nano Banana 2 for furniture objects', () => {
    const route = resolveModelRoute({ assetClass: 'furniture-objects' });
    expect(route.endpointId).toBe('fal-ai/nano-banana-2');
    expect(route.routeId).toBe('nano-banana-2-isolated-group');
  });

  it('keeps environment shell on Nano Banana Pro Edit', () => {
    const route = resolveSceneStackLayerModelRouteFromRegistry('environment-shell');
    expect(route.providerModel).toBe(SCENE_STACK_SHELL_FAL_MODEL);
    expect(route.providerModel).toBe('fal-ai/nano-banana-pro/edit');
    expect(route.textToImageOnly).toBe(false);
  });

  it('routes brand-grounded isolated assets to NB2 edit when refs required', () => {
    const route = resolveModelRoute({
      assetClass: 'signature-landmark',
      brandGroundingRequired: true,
    });
    expect(route.endpointId).toBe('fal-ai/nano-banana-2/edit');
  });

  it('uses configuration-driven policy version', () => {
    expect(MODEL_REGISTRY_POLICY_VERSION).toBe('layer-model-routing.v2');
  });

  it('derives quality preset from NB2 schema', () => {
    const { falInput } = buildNanoBanana2FalInput({
      prompt: 'test',
      aspectRatio: '1:1',
      outputFormat: 'png',
    });
    expect(falInput.resolution).toBe(NANO_BANANA_2_PRODUCTION_QUALITY);
    expect(falInput.thinking_level).toBe('high');
  });

  it('does not falsely report native 4K for sub-4K output', () => {
    const report = classifyResolutionTruth({
      requestedResolution: '4K',
      providerNativeResolution: '2K',
      outputWidth: 2048,
      outputHeight: 2048,
    });
    expect(report.truthState).toBe('provider-nearest-supported');
    expect(report.upscaleApplied).toBe(false);
  });

  it('records post-upscaled 4K truthfully', () => {
    const report = classifyResolutionTruth({
      requestedResolution: '4K',
      providerNativeResolution: '2K',
      outputWidth: 4096,
      outputHeight: 4096,
      upscaleApplied: true,
      upscaleModel: 'fal-ai/clarity-upscaler',
    });
    expect(report.truthState).toBe('post-upscaled-4k');
    expect(report.upscaleApplied).toBe(true);
  });

  it('isolated default is NB2 not NBP', () => {
    expect(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL).toBe('fal-ai/nano-banana-2');
    expect(SCENE_STACK_ISOLATED_OBJECT_FAL_MODEL).not.toBe('fal-ai/nano-banana-pro');
  });

  it('supports rollback without code changes', () => {
    const rolled = rollbackIsolatedRouteTo('nano-banana-2-isolated');
    expect(rolled?.endpointId).toBe('fal-ai/nano-banana-2');
  });
});
