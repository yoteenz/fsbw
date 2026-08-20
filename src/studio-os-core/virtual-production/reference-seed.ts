/**
 * Frontal Slayer reference tenant seed — structure only, no fabricated canon.
 */

import type {
  VirtualProductionBrand,
  VirtualProductionCampaign,
  VirtualProductionScene,
  VirtualProductionShot,
} from './types';

export const FRONTAL_SLAYER_ORG_ID = 'frontal-slayer';

export const FRONTAL_SLAYER_BRAND_SHELL: Omit<VirtualProductionBrand, 'id' | 'createdAt' | 'updatedAt'> = {
  orgId: FRONTAL_SLAYER_ORG_ID,
  brandKey: 'frontal-slayer',
  displayName: 'FRONTAL SLAYER',
  description: 'Reference tenant brand shell — populate canon from approved sources only.',
  visualRules: {},
  forbiddenDeviations: [],
  status: 'setup_required',
  metadata: {
    tenantRole: 'reference',
    canonCategories: [
      'characters',
      'products',
      'mansion_environments',
      'wardrobe',
      'props',
      'camera_language',
      'lighting',
      'behavior',
      'visual_rules',
    ],
    note: 'Do not invent fictional products or characters to fill UI.',
  },
};

export const CAMPAIGN_001_SHELL: Omit<
  VirtualProductionCampaign,
  'id' | 'brandId' | 'createdAt' | 'updatedAt'
> = {
  orgId: FRONTAL_SLAYER_ORG_ID,
  campaignKey: 'campaign-001',
  name: 'FRONTAL SLAYER / CAMPAIGN 001',
  objective: '[PLACEHOLDER] Validate Virtual Production OS architecture',
  platform: '[PLACEHOLDER]',
  audience: '[PLACEHOLDER]',
  creativeBrief: '[PLACEHOLDER — awaiting creative direction]',
  narrativeConcept: '[PLACEHOLDER — story not yet defined]',
  treatment: '[PLACEHOLDER — treatment not yet defined]',
  productionMode: 'hybrid',
  deliverables: [{ label: '[PLACEHOLDER deliverable]', platform: 'TBD' }],
  format: { aspectRatio: '9:16', durationTarget: null },
  canonSnapshot: { note: 'Canon attachment pending founder approval' },
  lifecycleStatus: 'brief',
  approvalState: 'draft',
  metadata: {
    referenceProject: true,
    purpose: 'Validate campaign production architecture',
  },
};

export function buildCampaign001PlaceholderScenes(campaignId: string): Omit<VirtualProductionScene, 'id'>[] {
  return [
    {
      orgId: FRONTAL_SLAYER_ORG_ID,
      campaignId,
      sceneKey: 'scene-01',
      title: '[PLACEHOLDER] Scene 01',
      description: 'Placeholder scene for architecture validation',
      sortOrder: 1,
      metadata: { placeholder: true },
    },
  ];
}

export function buildCampaign001PlaceholderShots(
  campaignId: string,
  sceneId: string
): Omit<VirtualProductionShot, 'id'>[] {
  const qcPlaceholders: Array<{ key: string; order: number; qc: string; approval: VirtualProductionShot['approvalState'] }> = [
    { key: 'shot-01', order: 1, qc: 'pass', approval: 'approved' },
    { key: 'shot-02', order: 2, qc: 'pass', approval: 'approved' },
    { key: 'shot-03', order: 3, qc: 'identity_warning', approval: 'repair_required' },
    { key: 'shot-04', order: 4, qc: 'pass', approval: 'approved' },
    { key: 'shot-05', order: 5, qc: 'product_failure', approval: 'repair_required' },
    { key: 'shot-06', order: 6, qc: 'not_reviewed', approval: 'ready_for_review' },
  ];

  return qcPlaceholders.map((p) => ({
    orgId: FRONTAL_SLAYER_ORG_ID,
    campaignId,
    sceneId,
    shotKey: p.key,
    sortOrder: p.order,
    purpose: `[PLACEHOLDER] ${p.key}`,
    shotType: 'placeholder',
    description: `[PLACEHOLDER] Shot ${p.order} — ${p.qc.replace(/_/g, ' ')}`,
    durationSeconds: 3,
    productionMode: p.order <= 2 ? 'director' : 'precision',
    providerId: p.order <= 2 ? 'openart-director' : 'fal',
    modelSettings: {},
    canonRefs: {},
    approvalState: p.approval,
    qcSummary: { overall: p.qc },
    metadata: { placeholder: true, demoQcState: p.qc },
  }));
}
