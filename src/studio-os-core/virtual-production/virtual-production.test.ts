/**
 * Virtual Production OS — domain tests.
 */

import { describe, expect, it } from 'vitest';
import {
  buildCampaign001PlaceholderScenes,
  buildCampaign001PlaceholderShots,
  CAMPAIGN_001_SHELL,
  FRONTAL_SLAYER_BRAND_SHELL,
  FRONTAL_SLAYER_ORG_ID,
} from './reference-seed';
import {
  applyRepairSupersession,
  createRepairRecord,
  preserveOriginalOnRepair,
} from './repair';
import { linkShotContinuity } from './continuity';
import {
  buildDirectorProductionPackage,
  formatDirectorPackageMarkdown,
  OPENART_DIRECTOR_INTEGRATION,
} from './director-package';
import {
  canChangeProductionMode,
  canTransitionApproval,
  computeOverallQcStatus,
  sortShotsByOrder,
} from './workflows';
import {
  classifyProductionError,
  providerSupportsCapability,
  resolveProviderForCapability,
} from './providers';
import type {
  VirtualProductionBrand,
  VirtualProductionCampaign,
  VirtualProductionGenerationAsset,
  VirtualProductionShot,
} from './types';

describe('Virtual Production OS — reference tenant', () => {
  it('Frontal Slayer brand shell uses tenant org id without FS coupling in keys', () => {
    expect(FRONTAL_SLAYER_BRAND_SHELL.orgId).toBe(FRONTAL_SLAYER_ORG_ID);
    expect(FRONTAL_SLAYER_BRAND_SHELL.status).toBe('setup_required');
    expect(FRONTAL_SLAYER_BRAND_SHELL.metadata.tenantRole).toBe('reference');
  });

  it('Campaign 001 shell is a non-destructive reference project', () => {
    expect(CAMPAIGN_001_SHELL.campaignKey).toBe('campaign-001');
    expect(CAMPAIGN_001_SHELL.metadata.referenceProject).toBe(true);
    expect(CAMPAIGN_001_SHELL.productionMode).toBe('hybrid');
  });

  it('creates placeholder scenes and shots with QC demo states', () => {
    const campaignId = 'camp-1';
    const scenes = buildCampaign001PlaceholderScenes(campaignId);
    expect(scenes).toHaveLength(1);
    const shots = buildCampaign001PlaceholderShots(campaignId, 'scene-1');
    expect(shots).toHaveLength(6);
    expect(shots[2].qcSummary.overall).toBe('identity_warning');
    expect(shots[4].qcSummary.overall).toBe('product_failure');
  });
});

describe('Virtual Production OS — provider capability resolution', () => {
  it('FAL supports image generation', () => {
    expect(providerSupportsCapability('fal', 'image_generation')).toBe(true);
  });

  it('OpenArt Director supports directed multi-scene only via external manual', () => {
    expect(providerSupportsCapability('openart-director', 'directed_multi_scene')).toBe(true);
    expect(providerSupportsCapability('openart-director', 'image_generation')).toBe(false);
  });

  it('resolves director mode to openart-director for multi-scene', () => {
    const p = resolveProviderForCapability('directed_multi_scene', 'director');
    expect(p?.id).toBe('openart-director');
  });

  it('resolves precision mode to FAL for image generation', () => {
    const p = resolveProviderForCapability('image_generation', 'precision');
    expect(p?.id).toBe('fal');
  });

  it('classifies timeout errors', () => {
    const r = classifyProductionError(new Error('Request timed out after 120s'));
    expect(r.category).toBe('generation_timed_out');
    expect(r.message).not.toContain('120s');
  });
});

describe('Virtual Production OS — approval and QC', () => {
  it('allows draft → generating → ready_for_review', () => {
    expect(canTransitionApproval('draft', 'generating')).toBe(true);
    expect(canTransitionApproval('generating', 'ready_for_review')).toBe(true);
  });

  it('blocks invalid supersession from draft', () => {
    expect(canTransitionApproval('draft', 'superseded')).toBe(false);
  });

  it('computes overall QC from categories', () => {
    expect(
      computeOverallQcStatus({
        identity: { status: 'pass' },
        product: { status: 'fail' },
      })
    ).toBe('fail');
  });

  it('sorts shots by order', () => {
    const sorted = sortShotsByOrder([
      { sortOrder: 3, shotKey: 'c' },
      { sortOrder: 1, shotKey: 'a' },
      { sortOrder: 2, shotKey: 'b' },
    ]);
    expect(sorted.map((s) => s.shotKey)).toEqual(['a', 'b', 'c']);
  });
});

describe('Virtual Production OS — repair workflow', () => {
  const baseAsset = (state: VirtualProductionGenerationAsset['approvalState']): VirtualProductionGenerationAsset => ({
    id: 'asset-original',
    orgId: FRONTAL_SLAYER_ORG_ID,
    assetKey: 'take-1',
    mediaType: 'image',
    providerId: 'fal',
    settings: {},
    sourceReferences: [],
    canonVersions: {},
    repairAncestry: [],
    approvalState: state,
    metadata: {},
  });

  const baseShot = (): VirtualProductionShot => ({
    id: 'shot-1',
    orgId: FRONTAL_SLAYER_ORG_ID,
    campaignId: 'camp-1',
    sceneId: 'scene-1',
    shotKey: 'shot-03',
    sortOrder: 3,
    modelSettings: {},
    canonRefs: {},
    approvalState: 'repair_required',
    qcSummary: {},
    metadata: {},
  });

  it('creates repair record preserving original asset reference', () => {
    const repair = createRepairRecord({
      orgId: FRONTAL_SLAYER_ORG_ID,
      campaignId: 'camp-1',
      shotId: 'shot-1',
      originalAssetId: 'asset-original',
      reason: 'identity_warning',
      providerId: 'fal',
    });
    expect(repair.originalAssetId).toBe('asset-original');
    expect(repair.status).toBe('open');
  });

  it('supersedes original without destroying history', () => {
    const original = baseAsset('approved');
    const replacement = baseAsset('draft');
    replacement.id = 'asset-replacement';
    replacement.assetKey = 'take-2';

    const result = applyRepairSupersession(original, replacement, baseShot());
    expect(result.originalAsset.approvalState).toBe('superseded');
    expect(result.replacementAsset.parentAssetId).toBe('asset-original');
    expect(result.replacementAsset.repairAncestry).toContain('asset-original');
    expect(preserveOriginalOnRepair(result.originalAsset)).toBe(true);
  });
});

describe('Virtual Production OS — continuity', () => {
  it('inherits end state into next shot start state', () => {
    const prevEnd = { character_state: { holding: 'red bag' } };
    const link = linkShotContinuity(
      {
        id: 'shot-5',
        orgId: FRONTAL_SLAYER_ORG_ID,
        campaignId: 'c',
        sceneId: 's',
        shotKey: 'shot-05',
        sortOrder: 5,
        modelSettings: {},
        canonRefs: {},
        approvalState: 'draft',
        qcSummary: {},
        metadata: {},
      },
      'shot-4',
      prevEnd
    );
    expect(link.inheritsFromShotId).toBe('shot-4');
    expect(link.startState.character_state).toEqual({ holding: 'red bag' });
  });
});

describe('Virtual Production OS — director package', () => {
  it('documents OpenArt Director as external/manual', () => {
    expect(OPENART_DIRECTOR_INTEGRATION.programmaticApi).toBe(false);
    expect(OPENART_DIRECTOR_INTEGRATION.externalManualWorkflow).toBe(true);
  });

  it('builds markdown director package', () => {
    const brand: VirtualProductionBrand = {
      id: 'b1',
      orgId: FRONTAL_SLAYER_ORG_ID,
      brandKey: 'frontal-slayer',
      displayName: 'FRONTAL SLAYER',
      visualRules: {},
      forbiddenDeviations: ['No off-brand colors'],
      status: 'setup_required',
      metadata: {},
      createdAt: '',
      updatedAt: '',
    };
    const campaign: VirtualProductionCampaign = {
      id: 'c1',
      orgId: FRONTAL_SLAYER_ORG_ID,
      brandId: 'b1',
      campaignKey: 'campaign-001',
      name: 'CAMPAIGN 001',
      productionMode: 'director',
      deliverables: [],
      format: { aspectRatio: '9:16' },
      canonSnapshot: {},
      lifecycleStatus: 'brief',
      approvalState: 'draft',
      metadata: {},
      createdAt: '',
      updatedAt: '',
    };
    const pkg = buildDirectorProductionPackage({
      campaign,
      brand,
      scenes: [],
      shots: [],
      characters: [],
      environments: [],
      products: [],
    });
    const md = formatDirectorPackageMarkdown(pkg);
    expect(md).toContain('OpenArt Director Production Package');
    expect(md).toContain('No off-brand colors');
  });
});

describe('Virtual Production OS — production mode', () => {
  it('blocks mode change after delivery', () => {
    expect(canChangeProductionMode('hybrid', 'delivered')).toBe(false);
    expect(canChangeProductionMode('hybrid', 'brief')).toBe(true);
  });
});

describe('Virtual Production OS — tenant isolation', () => {
  it('repair records are scoped to org', () => {
    const repair = createRepairRecord({
      orgId: 'other-tenant',
      campaignId: 'camp-1',
      shotId: 'shot-1',
      originalAssetId: 'a1',
      reason: 'test',
    });
    expect(repair.orgId).toBe('other-tenant');
    expect(repair.orgId).not.toBe(FRONTAL_SLAYER_ORG_ID);
  });
});
