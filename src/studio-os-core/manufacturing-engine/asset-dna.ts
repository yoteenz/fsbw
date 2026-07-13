import type { ConstructionPlan, ConstructionPlanAssetRef } from '../blueprint-author/construction-plan-schema';
import type { StudioWorldMaterialId } from '../studio-world-architecture-v2/material-library';
import type { AssetLifecycleStatus } from './contract';

export const ASSET_DNA_VERSION = 'asset-dna.v1';

export type AssetFamily = 'architecture' | 'hero' | 'furniture' | 'decor' | 'lighting' | 'interaction' | 'particle';

export type AssetCategory = string;

export type VisualDna = {
  silhouette: string;
  scale: string;
  proportion: string;
  symmetry: string;
  transparency: 'opaque' | 'alpha' | 'glass';
  reflection: number;
  finish: string;
  curvature: string;
  materialBreakdown: Record<string, number>;
  colorPalette: string[];
  surfaceComplexity: 'low' | 'medium' | 'high';
  edgeStyle: string;
  glassRatio: number;
  chromeRatio: number;
  marbleRatio: number;
  acrylicRatio: number;
  illuminationProfile: string;
  shadowProfile: string;
};

export type NegativeDna = {
  forbiddenMaterials: string[];
  forbiddenGenerations: string[];
  forbiddenVariations: string[];
};

export type PhysicalDna = {
  widthM: number;
  heightM: number;
  depthM: number;
  boundingVolume: { width: number; height: number; depth: number };
  collisionProfile: string;
  centerOfMass: string;
  pivotPoint: string;
};

export type AssetDnaRecord = {
  dnaVersion: typeof ASSET_DNA_VERSION;
  assetId: string;
  assetFamily: AssetFamily;
  assetCategory: AssetCategory;
  blueprintOwner: string;
  roomCompatibility: string[];
  organizationId: string;
  assetRevision: string;
  geometryRevision: string;
  materialRevision: string;
  lightingRevision: string;
  animationRevision: string;
  interactionRevision: string;
  socketCompatibility: string[];
  physical: PhysicalDna;
  placementRules: string[];
  cameraRules: string[];
  allowedVariations: string[];
  forbiddenVariations: string[];
  repairRules: string[];
  manufacturingRules: string[];
  inspectionRules: string[];
  lifecycleStatus: AssetLifecycleStatus;
  healthHistory: string[];
  generationHistory: string[];
  promptHistory: string[];
  modelHistory: string[];
  repairHistory: string[];
  visualDna: VisualDna;
  negativeDna: NegativeDna;
  materialIds: StudioWorldMaterialId[];
  assetSignatureHash: string;
};

export function computeAssetSignatureHash(dna: Pick<AssetDnaRecord, 'assetId' | 'assetRevision' | 'geometryRevision' | 'materialRevision'>): string {
  return `sig-${dna.assetId}-${dna.assetRevision}-${dna.geometryRevision}-${dna.materialRevision}`;
}

const STANDARD_NEGATIVE_DNA: NegativeDna = {
  forbiddenMaterials: ['gold', 'wood', 'granite', 'black-marble', 'generic-marble', 'generic-stone'],
  forbiddenGenerations: [
    'architecture',
    'walls',
    'windows',
    'floors',
    'ceilings',
    'people',
    'landscapes',
    'complete-rooms',
    'furniture-embedded-in-hero',
  ],
  forbiddenVariations: ['style-drift', 'scale-drift', 'material-substitution'],
};

export function deriveAssetDnaFromPlan(input: {
  plan: ConstructionPlan;
  assetRef: ConstructionPlanAssetRef;
  architecture?: boolean;
}): AssetDnaRecord {
  const { plan, assetRef } = input;
  const family: AssetFamily = input.architecture
    ? 'architecture'
    : assetRef.tier === 'hero'
      ? 'hero'
      : assetRef.tier === 'furniture'
        ? 'furniture'
        : 'decor';

  const marbleRatio = family === 'hero' ? 0.45 : family === 'furniture' ? 0.2 : 0.1;
  const chromeRatio = family === 'hero' ? 0.25 : 0.1;
  const glassRatio = assetRef.assetClass.includes('glass') || assetRef.assetClass.includes('crystal') ? 0.4 : 0.05;
  const acrylicRatio = 1 - marbleRatio - chromeRatio - glassRatio;

  const assetRevision = assetRef.version;
  const geometryRevision = assetRevision;
  const materialRevision = plan.versions.materialVersion;

  const dna: AssetDnaRecord = {
    dnaVersion: ASSET_DNA_VERSION,
    assetId: assetRef.assetId,
    assetFamily: family,
    assetCategory: assetRef.assetClass,
    blueprintOwner: plan.planId,
    roomCompatibility: [plan.room.roomType],
    organizationId: plan.metadata.organizationId,
    assetRevision,
    geometryRevision,
    materialRevision,
    lightingRevision: plan.versions.lightingVersion,
    animationRevision: '0.0.0',
    interactionRevision: plan.versions.interactionVersion,
    socketCompatibility: [assetRef.socketId],
    physical: {
      widthM: family === 'hero' ? 2.4 : 1.2,
      heightM: family === 'hero' ? 1.1 : 0.8,
      depthM: family === 'hero' ? 2.4 : 1.0,
      boundingVolume: {
        width: family === 'hero' ? 2.4 : 1.2,
        height: family === 'hero' ? 1.1 : 0.8,
        depth: family === 'hero' ? 2.4 : 1.0,
      },
      collisionProfile: `${assetRef.assetId}-collision`,
      centerOfMass: '0,0.5,0',
      pivotPoint: '0,0,0',
    },
    placementRules: [`socket:${assetRef.socketId}`, 'blueprint-bound'],
    cameraRules: family === 'hero' ? ['inspection', 'hero'] : ['overview'],
    allowedVariations: [],
    forbiddenVariations: STANDARD_NEGATIVE_DNA.forbiddenVariations,
    repairRules: ['targeted-attribute-repair', 'reuse-generation-on-silhouette-fix'],
    manufacturingRules: ['render-intent-only', 'no-freeform-prompt'],
    inspectionRules: [
      'silhouette-match',
      'geometry-match',
      'transparency-match',
      'scale-match',
      'material-match',
      'no-architecture-leakage',
    ],
    lifecycleStatus: 'designed',
    healthHistory: [],
    generationHistory: [],
    promptHistory: [],
    modelHistory: [],
    repairHistory: [],
    visualDna: {
      silhouette: `${assetRef.assetClass}-canonical`,
      scale: '1:1',
      proportion: family === 'hero' ? 'monumental' : 'standard',
      symmetry: 'bilateral',
      transparency: family === 'hero' ? 'alpha' : 'opaque',
      reflection: family === 'hero' ? 0.85 : 0.5,
      finish: 'founder-luxury',
      curvature: 'soft-organic',
      materialBreakdown: { marble: marbleRatio, chrome: chromeRatio, glass: glassRatio, acrylic: acrylicRatio },
      colorPalette: ['founder-white', 'founder-chrome', 'founder-red-accent'],
      surfaceComplexity: family === 'hero' ? 'high' : 'medium',
      edgeStyle: 'precision-bevel',
      glassRatio,
      chromeRatio,
      marbleRatio,
      acrylicRatio,
      illuminationProfile: plan.lightingProfile.profileId,
      shadowProfile: 'soft-contact-shadow',
    },
    negativeDna: {
      ...STANDARD_NEGATIVE_DNA,
      forbiddenGenerations: input.architecture
        ? ['furniture', 'people', 'landscapes']
        : STANDARD_NEGATIVE_DNA.forbiddenGenerations,
    },
    materialIds: plan.materialSet.materialIds,
    assetSignatureHash: '',
  };

  dna.assetSignatureHash = computeAssetSignatureHash(dna);
  return dna;
}

export function deriveAllAssetDnaFromPlan(plan: ConstructionPlan): AssetDnaRecord[] {
  const records: AssetDnaRecord[] = [];

  records.push(
    deriveAssetDnaFromPlan({
      plan,
      assetRef: {
        assetId: plan.architecture.architectureId,
        version: plan.architecture.version,
        assetClass: 'environment-shell',
        socketId: 'architecture-root',
        tier: 'hero',
      },
      architecture: true,
    })
  );

  for (const asset of [...plan.heroAssets, ...plan.furnitureSet.assets, ...plan.decorSet.assets]) {
    records.push(deriveAssetDnaFromPlan({ plan, assetRef: asset }));
  }

  return records;
}

export function getAssetDnaById(records: AssetDnaRecord[], assetId: string): AssetDnaRecord | null {
  return records.find((r) => r.assetId === assetId) ?? null;
}
