import { describe, expect, it } from 'vitest';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import { resolveBrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import {
  allowsFullSceneOutput,
  requiresIsolatedObjectValidation,
  validatorExistsForIntent,
} from '../creative-production/artifact-intent';
import {
  buildFounderRenderJobView,
  canApproveFounderRender,
  FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
  FOUNDER_RENDER_ARTIFACT_INTENT,
} from './contract';
import { buildFounderFullRoomPreviewPrompt } from './prompt-builder';
import { resolveFounderRenderModelRoute, FOUNDER_RENDER_MODEL, FOUNDER_RENDER_ROUTE_ID } from './model-route';
import { runFounderRenderPreflight, founderRenderArtifactIntentLabel } from './preflight';

function receptionPlan() {
  return fixtureReceptionConstructionPlan({
    organizationId: 'frontal-slayer',
    buildingId: 'b1',
    floorId: 'f1',
    roomId: 'reception',
    requestId: 'req-1',
    founderIntent: 'Luxury reception',
    styleProfile: {
      styleId: 'luxury',
      version: '1',
      organizationStyle: 'frontal-slayer',
      visualLanguage: 'warm marble',
    },
  });
}

describe('Founder Render™ — full-room photoreal preview', () => {
  it('uses founder-full-room-preview artifact intent', () => {
    expect(FOUNDER_RENDER_ARTIFACT_INTENT).toBe('founder-full-room-preview');
    expect(founderRenderArtifactIntentLabel()).toBe('founder-full-room-preview');
  });

  it('registers validator for founder-full-room-preview intent', () => {
    expect(validatorExistsForIntent('founder-full-room-preview')).toBe(true);
  });

  it('does not apply isolated-object validation to founder render', () => {
    expect(requiresIsolatedObjectValidation('founder-full-room-preview')).toBe(false);
  });

  it('accepts full-scene output for founder render intent', () => {
    expect(allowsFullSceneOutput('founder-full-room-preview')).toBe(true);
  });

  it('routes to approved full-scene nano-banana-pro model', () => {
    const route = resolveFounderRenderModelRoute('16:9');
    expect(route.routeId).toBe(FOUNDER_RENDER_ROUTE_ID);
    expect(route.providerModel).toBe(FOUNDER_RENDER_MODEL);
    expect(route.providerModel).toContain('nano-banana-pro');
    expect(route.providerModel).not.toContain('nano-banana-2');
    expect(route.artifactIntent).toBe('founder-full-room-preview');
  });

  it('builds prompt from live construction plan', () => {
    const plan = receptionPlan();
    const brand = resolveBrandMaterialPackage({
      organizationId: plan.metadata.organizationId,
      materialRequests: [
        { slot: 'floor', requestedMaterial: 'white polished marble', brandRole: 'primary-marble-texture', required: true },
      ],
    });
    if ('code' in brand) throw new Error(brand.message);
    const bundle = buildFounderFullRoomPreviewPrompt({ plan, brandPackage: brand });
    expect(bundle.promptVersion).toBe(FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION);
    expect(bundle.prompt).toContain(plan.room.displayName);
    expect(bundle.prompt).toContain('photoreal');
    expect(bundle.prompt).toContain('NOT a diagram');
    expect(bundle.negativePrompt).toContain('wireframe');
    expect(bundle.negativePrompt).toContain('procedural placeholder');
  });

  it('resolves required brand marble for frontal-slayer', () => {
    const preflight = runFounderRenderPreflight(receptionPlan());
    expect(preflight.ok).toBe(true);
    if (preflight.ok) {
      expect(preflight.brandReferenceUrls.length).toBeGreaterThan(0);
      expect(preflight.materialSetId).toBeTruthy();
    }
  });

  it('blocks preview when required brand asset is missing', () => {
    const plan = receptionPlan();
    plan.metadata.organizationId = 'unknown-org-without-vault';
    const preflight = runFounderRenderPreflight(plan);
    expect(preflight.ok).toBe(false);
    if (!preflight.ok) {
      expect(preflight.code).toBe('BRAND_ASSET_REQUIRED_MISSING');
    }
  });

  it('starts with no_preview when no job exists', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({ plan });
    expect(view.status).toBe('no_preview');
    expect(view.previewArtifactUrl).toBeNull();
    expect(view.artifactIntent).toBe('founder-full-room-preview');
  });

  it('persists blueprint revision on job view', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({
      plan,
      job: { blueprintRevision: 3, status: 'ready', previewArtifactUrl: 'https://cdn.example/render.png' },
    });
    expect(view.blueprintRevision).toBe(3);
    expect(view.currentBlueprintRevision).toBe(plan.metadata.revision);
  });

  it('marks stale preview when blueprint revision advances', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({
      plan,
      job: {
        blueprintRevision: plan.metadata.revision - 1,
        status: 'ready',
        previewArtifactUrl: 'https://cdn.example/render.png',
      },
    });
    expect(view.status).toBe('stale');
    expect(view.isStale).toBe(true);
  });

  it('disables approval for stale preview', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({
      plan,
      job: {
        blueprintRevision: plan.metadata.revision - 1,
        status: 'ready',
        previewArtifactUrl: 'https://cdn.example/render.png',
      },
    });
    expect(canApproveFounderRender(view, true)).toBe(false);
  });

  it('disables approval until real image is ready and loaded', () => {
    const plan = receptionPlan();
    const noPreview = buildFounderRenderJobView({ plan });
    expect(canApproveFounderRender(noPreview, false)).toBe(false);

    const ready = buildFounderRenderJobView({
      plan,
      job: {
        status: 'ready',
        previewArtifactUrl: 'https://cdn.example/render.png',
        blueprintRevision: plan.metadata.revision,
      },
    });
    expect(canApproveFounderRender(ready, false)).toBe(false);
    expect(canApproveFounderRender(ready, true)).toBe(true);
  });

  it('disables approval on failed generation', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({
      plan,
      job: {
        status: 'failed',
        failureReason: 'FAL provider job failed',
        blueprintRevision: plan.metadata.revision,
      },
    });
    expect(canApproveFounderRender(view, true)).toBe(false);
  });

  it('does not fall back to procedural shapes in job view', () => {
    const plan = receptionPlan();
    const view = buildFounderRenderJobView({ plan });
    expect(view.previewArtifactUrl).toBeNull();
    expect(view.status).toBe('no_preview');
  });
});
