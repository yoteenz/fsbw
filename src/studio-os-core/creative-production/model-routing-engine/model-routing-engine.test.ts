import { describe, expect, it } from 'vitest';
import {
  resolveModelRoutingDecision,
  resolveModelRoutingFromLayerId,
  getWorldArchitectDefaultModel,
  getAssetManufacturerDefaultModel,
  getBackgroundCleanupModel,
} from './model-routing-engine';
import { MODEL_ROUTING_ENGINE_VERSION } from './types';
import { resolvePromptRouting } from '../prompt-router';
import { buildGenerationRoutingRecord } from '../generation-routing-record';
import {
  validateModelRoutingDecision,
  validateAndResolveModelRouting,
  assertAssetWorkerNotGeneratingRoom,
  assertEnvironmentWorkerNotGeneratingAsset,
} from '../../immune-system/model-routing-validation';

describe('ModelRoutingEngine™', () => {
  it('routes founder-full-room-preview to Nano Banana Pro', () => {
    const decision = resolveModelRoutingDecision({
      artifactIntent: 'founder-full-room-preview',
      surface: 'founder-render',
    });
    expect(decision.engineVersion).toBe(MODEL_ROUTING_ENGINE_VERSION);
    expect(decision.workerFamily).toBe('world-architect');
    expect(decision.providerModel).toContain('nano-banana-pro');
    expect(decision.providerModel).not.toContain('nano-banana-2');
    expect(decision.routeId).toBe('nano-banana-pro-founder-full-room');
    expect(decision.promptBuilderId).toBe('founder-full-room-preview-prompt.v1');
  });

  it('routes experience-environment to Nano Banana Pro', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'experience-environment' });
    expect(decision.workerFamily).toBe('world-architect');
    expect(decision.providerModel).toContain('nano-banana-pro');
    expect(decision.promptBuilderId).toBe('experience-environment-prompt.v1');
  });

  it('routes reception-desk to Nano Banana 2', () => {
    const decision = resolveModelRoutingDecision({
      artifactIntent: 'reception-desk',
      surface: 'creative-direction-studio',
    });
    expect(decision.workerFamily).toBe('asset-manufacturer');
    expect(decision.providerModel).toContain('nano-banana-2');
    expect(decision.promptBuilderId).toBe('asset-reception-desk-prompt.v1');
    expect(decision.referenceStrategy).toBe('placement-metadata-only');
  });

  it('routes furniture-asset to Nano Banana 2 with chair prompt', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'furniture-asset' });
    expect(decision.workerFamily).toBe('asset-manufacturer');
    expect(decision.providerModel).toBe('fal-ai/nano-banana-2');
    expect(decision.promptBuilderId).toBe('asset-chair-prompt.v1');
  });

  it('routes background-cleanup to birefnet', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'background-cleanup' });
    expect(decision.workerFamily).toBe('background-cleanup');
    expect(decision.providerModel).toContain('birefnet');
    expect(decision.promptBuilderId).toBe('background-cleanup-prompt.v1');
  });

  it('scene-stack signature-landmark routes through engine to NB2', () => {
    const decision = resolveModelRoutingFromLayerId('signature-landmark');
    expect(decision.artifactIntent).toBe('landmark-asset');
    expect(decision.providerModel).toBe('fal-ai/nano-banana-2');
    expect(decision.textToImageOnly).toBe(true);
  });

  it('scene-stack environment-shell routes through engine to NBP', () => {
    const decision = resolveModelRoutingFromLayerId('environment-shell');
    expect(decision.artifactIntent).toBe('environment-shell');
    expect(decision.providerModel).toContain('nano-banana-pro');
    expect(decision.textToImageOnly).toBe(false);
  });

  it('brand grounding switches asset route to NB2 edit', () => {
    const decision = resolveModelRoutingFromLayerId('signature-landmark', {
      brandGroundingRequired: true,
    });
    expect(decision.providerEndpoint).toBe('fal-ai/nano-banana-2/edit');
  });

  it('exposes registry-derived default models', () => {
    expect(getWorldArchitectDefaultModel()).toContain('nano-banana-pro');
    expect(getAssetManufacturerDefaultModel()).toContain('nano-banana-2');
    expect(getBackgroundCleanupModel()).toContain('birefnet');
  });
});

describe('PromptRouter™', () => {
  it('selects versioned prompts by artifact intent', () => {
    const founder = resolvePromptRouting({ artifactIntent: 'founder-full-room-preview' });
    expect(founder.promptVersion).toBe('founder-full-room-preview-prompt.v1');

    const desk = resolvePromptRouting({ artifactIntent: 'reception-desk' });
    expect(desk.promptBuilderId).toBe('asset-reception-desk-prompt.v1');

    const logo = resolvePromptRouting({ artifactIntent: 'logo-asset' });
    expect(logo.promptBuilderId).toBe('asset-logo-prompt.v1');
  });
});

describe('Immune System — model routing validation', () => {
  it('accepts valid world architect routing', () => {
    const result = validateAndResolveModelRouting({ artifactIntent: 'founder-full-room-preview' });
    expect(result.ok).toBe(true);
  });

  it('accepts valid asset manufacturer routing', () => {
    const result = validateAndResolveModelRouting({ artifactIntent: 'reception-desk' });
    expect(result.ok).toBe(true);
  });

  it('rejects world intent with wrong model', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'founder-full-room-preview' });
    const tampered = { ...decision, providerModel: 'fal-ai/nano-banana-2' };
    const result = validateModelRoutingDecision(tampered);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('WORLD_INTENT_REQUIRES_NBP');
  });

  it('rejects asset intent with wrong model', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'furniture-asset' });
    const tampered = { ...decision, providerModel: 'fal-ai/nano-banana-pro/edit' };
    const result = validateModelRoutingDecision(tampered);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ASSET_INTENT_REQUIRES_NB2');
  });

  it('rejects CDS attempting room generation', () => {
    const result = assertAssetWorkerNotGeneratingRoom({
      artifactIntent: 'founder-full-room-preview',
      surface: 'creative-direction-studio',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects Experience Lab attempting asset generation', () => {
    const result = assertEnvironmentWorkerNotGeneratingAsset({
      artifactIntent: 'reception-desk',
      surface: 'experience-lab',
    });
    expect(result.ok).toBe(false);
  });
});

describe('Generation routing record — Quality Guard forensic', () => {
  it('records routing decision for replay', () => {
    const decision = resolveModelRoutingDecision({ artifactIntent: 'reception-desk' });
    const record = buildGenerationRoutingRecord({
      decision,
      materialLibraryVersion: 'founder-material-library.v1',
      lightingProfileId: 'executive-reception',
      blueprintRevision: 14,
      organizationId: 'frontal-slayer',
    });
    expect(record.recordVersion).toBe('generation-routing-record.v1');
    expect(record.selectedModel).toContain('nano-banana-2');
    expect(record.promptVersion).toBe('asset-reception-desk-prompt.v1');
    expect(record.materialLibraryVersion).toBe('founder-material-library.v1');
    expect(record.blueprintRevision).toBe(14);
  });
});
