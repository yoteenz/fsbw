import { describe, expect, it } from 'vitest';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import { resolveBrandMaterialPackage } from '../creative-production/brand-asset-grounding';
import { validatorExistsForIntent } from '../creative-production/artifact-intent';
import {
  MASTER_LANDSCAPE_ASPECT,
  MASTER_PORTRAIT_ASPECT,
  MASTER_FOUNDER_LANDSCAPE_INTENT,
  MASTER_FOUNDER_PORTRAIT_INTENT,
} from './contract';
import { DEFAULT_COMPOSITION_PROFILES, buildDefaultCompositionPack, resolveSmartCompositionGuidance, lockCompositionPack, appendCompositionProfile } from './composition-pack';
import { buildBlueprintCompositionMetadata } from './blueprint-composition-metadata';
import {
  approveMasterLandscape,
  buildMasterLandscapePrompt,
  buildMasterLandscapeRenderRecord,
  canGenerateMasterPortrait,
} from './master-landscape';
import {
  buildMasterPortraitRecomposePrompt,
  buildMasterPortraitRecomposeRequest,
  PORTRAIT_RECOMPOSE_MANDATE,
} from './master-portrait';
import {
  rejectCompositionDriftFlags,
  validatePortraitGenerationGate,
  validatePortraitLandscapeParity,
} from './quality-guard-composition';
import {
  buildApprovedMasterRenderHandoff,
  buildBrandAssetLockBundle,
  initializeCompositionPackForLandscape,
  validateCdsMasterRenderEntry,
} from './integration';

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

describe('Master Founder Render™ — landscape canonical truth', () => {
  it('registers master landscape and portrait intents', () => {
    expect(validatorExistsForIntent('master-founder-landscape')).toBe(true);
    expect(validatorExistsForIntent('master-founder-portrait-recompose')).toBe(true);
    expect(MASTER_FOUNDER_LANDSCAPE_INTENT).toBe('master-founder-landscape');
    expect(MASTER_FOUNDER_PORTRAIT_INTENT).toBe('master-founder-portrait-recompose');
  });

  it('builds 21:9 master landscape record', () => {
    const plan = receptionPlan();
    const record = buildMasterLandscapeRenderRecord({
      renderId: 'mfr-landscape-1',
      plan,
      aiModel: 'fal-ai/nano-banana-pro/edit',
      artifactUrl: 'https://cdn.example/landscape.png',
      status: 'ready',
    });
    expect(record.aspectRatio).toBe(MASTER_LANDSCAPE_ASPECT);
    expect(record.blueprintId).toBe(plan.planId);
    expect(record.revisions.blueprintRevision).toBe(plan.metadata.revision);
  });

  it('builds master landscape prompt as canonical source', () => {
    const plan = receptionPlan();
    const brand = resolveBrandMaterialPackage({
      organizationId: plan.metadata.organizationId,
      materialRequests: [{ slot: 'floor', requestedMaterial: 'marble', brandRole: 'primary-marble-texture', required: true }],
    });
    if ('code' in brand) throw new Error(brand.message);
    const bundle = buildMasterLandscapePrompt({ plan, brandPackage: brand });
    expect(bundle.artifactIntent).toBe(MASTER_FOUNDER_LANDSCAPE_INTENT);
    expect(bundle.prompt).toContain(MASTER_LANDSCAPE_ASPECT);
    expect(bundle.prompt).toContain('canonical architectural source of truth');
    expect(bundle.negativePrompt).toContain('split desktop mobile');
  });
});

describe('Master Portrait™ — recomposition only after landscape approval', () => {
  it('blocks portrait before landscape approval', () => {
    const plan = receptionPlan();
    const landscape = buildMasterLandscapeRenderRecord({
      renderId: 'mfr-1',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/landscape.png',
      status: 'ready',
    });
    expect(canGenerateMasterPortrait(landscape)).toBe(false);
    expect(validatePortraitGenerationGate(landscape).ok).toBe(false);
    expect(() =>
      buildMasterPortraitRecomposeRequest({
        portraitId: 'mfr-portrait-1',
        landscape,
        plan,
        aiModel: 'nbp',
      })
    ).toThrow(/approved/i);
  });

  it('generates portrait from approved landscape with recompose mandate', () => {
    const plan = receptionPlan();
    let landscape = buildMasterLandscapeRenderRecord({
      renderId: 'mfr-1',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/landscape.png',
      status: 'ready',
    });
    landscape = approveMasterLandscape(landscape, 'founder@example.com');

    const portrait = buildMasterPortraitRecomposeRequest({
      portraitId: 'mfr-portrait-1',
      landscape,
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/portrait.png',
      status: 'ready',
    });

    expect(portrait.aspectRatio).toBe(MASTER_PORTRAIT_ASPECT);
    expect(portrait.landscapeArtifactUrl).toBe(landscape.artifactUrl);

    const prompt = buildMasterPortraitRecomposePrompt({
      plan,
      landscapeUrl: landscape.artifactUrl!,
    });
    expect(prompt.artifactIntent).toBe(MASTER_FOUNDER_PORTRAIT_INTENT);
    expect(prompt.prompt).toContain(PORTRAIT_RECOMPOSE_MANDATE);
    expect(prompt.referenceImageUrl).toBe(landscape.artifactUrl);
    expect(prompt.negativePrompt).toContain('different marble');
  });
});

describe('Composition Pack™', () => {
  it('ships 14 default composition profiles with no new generation', () => {
    expect(DEFAULT_COMPOSITION_PROFILES.length).toBe(14);
    expect(DEFAULT_COMPOSITION_PROFILES.every((p) => p.requiresNewGeneration === false)).toBe(true);
  });

  it('locks pack after founder approval', () => {
    const pack = buildDefaultCompositionPack({ packId: 'cp-1', masterLandscapeRenderId: 'mfr-1' });
    const locked = lockCompositionPack(pack);
    expect(locked.locked).toBe(true);
    expect(() => appendCompositionProfile(locked, locked.profiles[0]!)).toThrow(/locked/i);
  });
});

describe('Blueprint composition metadata', () => {
  it('extracts hero objects and smart composition guidance', () => {
    const plan = receptionPlan();
    const metadata = buildBlueprintCompositionMetadata(plan);
    expect(metadata.heroObjects.length).toBeGreaterThan(0);
    expect(metadata.primaryFocus).toBeTruthy();
    expect(resolveSmartCompositionGuidance(metadata, 'mobile')).toBe('mobile-hero');
    expect(resolveSmartCompositionGuidance(metadata, 'construction')).toBe('construction');
  });
});

describe('Quality Guard™ — portrait landscape parity', () => {
  it('passes parity when portrait references approved landscape', () => {
    const plan = receptionPlan();
    let landscape = buildMasterLandscapeRenderRecord({
      renderId: 'mfr-1',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/landscape.png',
      status: 'ready',
    });
    landscape = approveMasterLandscape(landscape, 'founder@example.com');

    const portrait = buildMasterPortraitRecomposeRequest({
      portraitId: 'mfr-p-1',
      landscape,
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/portrait.png',
      status: 'ready',
    });

    const brandLock = buildBrandAssetLockBundle({ landscape, plan });
    const result = validatePortraitLandscapeParity({
      landscape,
      portrait,
      revisions: landscape.revisions,
      brandLock,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects architecture drift flags', () => {
    const drift = rejectCompositionDriftFlags({ differentMarble: true });
    expect(drift.ok).toBe(false);
    if (!drift.ok) expect(drift.code).toBe('MATERIAL_DRIFT');
  });
});

describe('CDS + Experience Lab integration', () => {
  it('builds approved master render handoff with locked composition pack', () => {
    const plan = receptionPlan();
    const landscape = buildMasterLandscapeRenderRecord({
      renderId: 'mfr-1',
      plan,
      aiModel: 'nbp',
      artifactUrl: 'https://cdn.example/landscape.png',
      status: 'ready',
    });
    const pack = initializeCompositionPackForLandscape(landscape);

    const handoff = buildApprovedMasterRenderHandoff({
      landscape,
      portrait: null,
      compositionPack: pack,
      plan,
      approvedBy: 'founder@example.com',
    });

    expect(handoff.compositionPack.locked).toBe(true);
    expect(handoff.masterLandscape.status).toBe('approved');
    expect(validateCdsMasterRenderEntry(handoff).ok).toBe(true);
  });
});
