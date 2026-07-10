/**
 * Phase 1 demo seed — one vertical governed generation request for verification.
 */

import { createCreativeInitiative, createVersionPin } from './initiative-model';
import { demoGenomePins } from './authorization';
import { buildSourceLineage } from './lineage';
import type { AssetIntent, CreativeInitiative, ProductionAuthorization } from './types';

export const DEMO_TENANT_ID = 'frontal-slayer';
export const DEMO_COMPANY_ID = 'frontal-slayer';
export const DEMO_INITIATIVE_ID = 'initiative-cds-phase1-demo';
export const DEMO_PACKAGE_ID = 'pkg-creative-direction-golden-v1';
export const DEMO_BLUEPRINT_ID = 'narrative-blueprint-phase1-demo';
export const DEMO_GENOME_ID = 'production-genome-phase1-demo';
export const DEMO_AUTHORIZATION_ID = 'auth-cds-phase1-demo';

export function createDemoCreativeInitiative(): CreativeInitiative {
  const initiative = createCreativeInitiative({
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: 'Creative Direction Studio Phase 1 Verification',
    expressionFamily: 'campaign-launch',
    businessObjective: 'Prove governed generation through canonical production graph types',
    audienceScope: { segment: 'founder', channels: ['studio-internal'] },
    touchpointPlan: [
      { touchpoint: 'single-asset', discipline: 'icon', priority: 'primary' },
    ],
    companyGenomeVersion: createVersionPin('company-genome', 'frontal-slayer-genome', 'phase-1-demo'),
    brandDnaVersion: createVersionPin('brand-dna', 'frontal-slayer-brand', 'phase-1-demo'),
    designCanonVersion: createVersionPin('design-canon', 'frontal-slayer-design-canon', 'phase-1-demo'),
    narrativeBlueprintId: DEMO_BLUEPRINT_ID,
    productionGenomeId: DEMO_GENOME_ID,
    status: 'in_production',
  });
  return { ...initiative, id: DEMO_INITIATIVE_ID };
}

export function createDemoProductionAuthorizationPayload(
  initiative: CreativeInitiative
): Omit<ProductionAuthorization, 'signature'> {
  return {
    id: DEMO_AUTHORIZATION_ID,
    productionPackageId: DEMO_PACKAGE_ID,
    narrativeBlueprintId: DEMO_BLUEPRINT_ID,
    productionGenomeId: DEMO_GENOME_ID,
    initiativeId: initiative.id,
    satisfiedGateIds: [
      'narrative-blueprint',
      'strategic-fit',
      'production-package',
      'asset-generation',
    ],
    issuedAt: new Date().toISOString(),
    issuedBy: {
      actorId: 'studio-production-system',
      role: 'system',
      issuedVia: 'demo-seed',
    },
    scope: {
      touchpoints: ['single-asset'],
      assetIntents: ['intent-cds-phase1-demo'],
    },
    genomeRefs: demoGenomePins(),
    rightsState: 'cleared',
    approvalState: 'approved',
  };
}

export function createDemoAssetIntent(initiativeId: string): AssetIntent {
  return {
    id: 'intent-cds-phase1-demo',
    productionAuthorizationId: DEMO_AUTHORIZATION_ID,
    initiativeId,
    touchpoint: 'single-asset',
    discipline: 'icon',
    recipeSlug: 'hero-icon',
    inputRefs: [
      { kind: 'genome', refId: 'frontal-slayer-genome', version: 'phase-1-demo' },
      { kind: 'brand', refId: 'frontal-slayer-brand', version: 'phase-1-demo' },
      { kind: 'design-canon', refId: 'frontal-slayer-design-canon', version: 'phase-1-demo' },
    ],
    rightsRequirements: [{ licenseClass: 'internal-studio', requiredApproval: true }],
    qualityGates: ['design-canon', 'brand-alignment'],
    expressionLineage: buildSourceLineage(initiativeId),
    outputClass: 'material',
  };
}
