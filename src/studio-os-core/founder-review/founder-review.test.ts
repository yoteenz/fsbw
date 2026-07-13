import { describe, expect, it } from 'vitest';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import { buildManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import { deriveAllAssetDnaFromPlan } from '../manufacturing-engine/asset-dna';
import { buildRenderIntentsForPlan } from '../manufacturing-engine/render-intent';
import {
  buildFounderRenderModel,
  buildFounderReviewDiff,
  buildConstructionTimeline,
  FOUNDER_RENDER_VARIANTS,
} from './index';

function receptionPlan() {
  return fixtureReceptionConstructionPlan({
    organizationId: 'frontal-slayer',
    buildingId: 'b1',
    floorId: 'f1',
    roomId: 'reception',
    requestId: 'req-1',
    founderIntent: 'Luxury reception',
    styleProfile: { styleId: 'luxury', version: '1', organizationStyle: 'frontal-slayer', visualLanguage: 'warm marble' },
  });
}

describe('founder review core', () => {
  it('builds founder render without engineering style', () => {
    const plan = receptionPlan();
    const model = buildFounderRenderModel({ plan, variantId: 'luxury' });
    expect(model.generationOccurred).toBe(false);
    expect(model.variant.id).toBe('luxury');
    expect(model.assets.some((a) => a.visualStyle === 'desk')).toBe(true);
    expect(model.assets.length).toBeGreaterThan(2);
  });

  it('exposes five visual direction variants', () => {
    expect(FOUNDER_RENDER_VARIANTS.map((v) => v.id)).toEqual([
      'current',
      'luxury',
      'minimal',
      'editorial',
      'signature',
    ]);
  });

  it('marks variant changes in live diff', () => {
    const plan = receptionPlan();
    const diff = buildFounderReviewDiff({ plan, variantChanged: true });
    expect(diff.hasChanges).toBe(true);
    expect(diff.regions.find((r) => r.label === 'Lighting')?.status).toBe('changed');
  });

  it('builds construction timeline for manufacturing phase', () => {
    const plan = receptionPlan();
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIdMap = Object.fromEntries(dna.map((d, i) => [d.assetId, `mfg-job-${i + 1}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds: jobIdMap });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    const timeline = buildConstructionTimeline({ planId: plan.planId, queue, phase: 'manufacturing' });
    expect(timeline.steps[0].label).toBe('Blueprint Approved');
    expect(timeline.steps.some((s) => s.status === 'active' || s.status === 'complete')).toBe(true);
  });
});
