/**
 * Brand Asset Grounding Contract™
 * Organization-specific material identity for governed generation.
 */

export const BRAND_ASSET_GROUNDING_VERSION = 'brand-asset-grounding.v1';

export type BrandAssetRole =
  | 'primary-marble-texture'
  | 'secondary-marble-texture'
  | 'logo'
  | 'monogram'
  | 'wordmark'
  | 'color-palette'
  | 'chrome-finish-reference'
  | 'acrylic-finish-reference'
  | 'red-foil-finish-reference'
  | 'fabric-reference'
  | 'wood-reference'
  | 'stone-reference'
  | 'pattern-reference'
  | 'approved-lighting-reference'
  | 'product-reference'
  | 'signature-shape-reference';

export type BrandReferenceRole =
  | 'material-reference'
  | 'logo-reference'
  | 'form-reference'
  | 'color-reference'
  | 'forbidden-scene-reference';

export type BrandAssetRecord = {
  organizationId: string;
  brandProfileId: string;
  brandAssetSetId: string;
  assetRole: BrandAssetRole;
  assetId: string;
  assetType: 'texture' | 'logo' | 'swatch' | 'palette' | 'finish-policy';
  canonicalUrl: string;
  storagePath: string;
  checksum: string;
  mimeType: string;
  width: number;
  height: number;
  colorSpace: string;
  repeatPolicy: 'tile' | 'stretch' | 'none';
  cropPolicy: 'full' | 'center' | 'none';
  referenceStrengthPolicy: 'strong-material' | 'moderate-material' | 'weak-hint';
  materialScale: string;
  materialOrientation: string;
  approvedForGeneration: boolean;
  approvedForPublicOutput: boolean;
  sensitivity: 'public' | 'internal' | 'restricted';
  active: boolean;
  version: string;
  updatedAt: string;
};

export type MaterialSlotAssignment = {
  slot: string;
  requestedMaterial: string;
  resolvedBrandAssetId: string | null;
  resolvedReferenceUrl: string | null;
  checksum: string | null;
  useMode: 'reference-image' | 'prompt-token' | 'finish-policy';
  promptInstruction: string;
  required: boolean;
  fallbackAllowed: boolean;
  referenceRole: BrandReferenceRole;
  referenceWeight: number;
  sourceOrganizationId: string;
  appliedToMaterialSlot: string;
};

export type BrandMaterialPackage = {
  organizationId: string;
  brandProfileId: string;
  brandAssetSetId: string;
  materialSlots: MaterialSlotAssignment[];
  referenceUrls: string[];
  referenceChecksums: string[];
  colorTokens: Record<string, string>;
  materialMappings: Record<string, string>;
  promptSections: {
    organizationMaterialAssignments: string;
    exactBrandAssetReferences: string;
    forbiddenMaterialSubstitutions: string;
  };
};

export type MaterialFidelityVerdict =
  | 'exact-brand-material-pass'
  | 'acceptable-brand-material-interpretation'
  | 'generic-material-substitution'
  | 'wrong-brand-material'
  | 'missing-required-material'
  | 'low-confidence-material-match';

export type MaterialFidelityEvidence = {
  requiredBrandAssetIds: string[];
  materialSlots: Record<string, string>;
  suppliedReferenceChecksums: string[];
  referenceDeliveryConfirmed: boolean;
  expectedMaterialSignature: string;
  observedMaterialClassification: string;
  materialMatchConfidence: number;
  genericSubstitutionLikelihood: number;
  wrongMarbleLikelihood: number;
  colorTokenDeviation: number;
  finalMaterialVerdict: MaterialFidelityVerdict;
};

export type BrandAssetResolutionError = {
  code: 'BRAND_ASSET_REQUIRED_MISSING';
  missingRole: BrandAssetRole;
  organizationId: string;
  message: string;
};
