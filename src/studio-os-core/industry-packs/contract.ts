/**
 * Studio World Industry Packs™ — canonical contracts.
 * Headquarters generator architecture — not room-by-room invention.
 */

export const INDUSTRY_PACKS_VERSION = 'industry-packs.v1' as const;

export type IndustryPackValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

/** Permanent business category — contains many Industry Packs. */
export type BusinessArchetypeId =
  | 'beauty'
  | 'healthcare'
  | 'professional-services'
  | 'retail'
  | 'hospitality'
  | 'fitness'
  | 'education'
  | 'entertainment'
  | 'technology'
  | 'finance'
  | 'construction'
  | 'manufacturing'
  | 'automotive'
  | 'government'
  | 'non-profit'
  | 'food-beverage'
  | 'creative'
  | 'real-estate'
  | 'wellness'
  | 'custom';

export type BusinessArchetype = {
  archetypeId: BusinessArchetypeId;
  displayName: string;
  description: string;
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

/** Reusable department wing — exists once, referenced by many packs. */
export type DepartmentTemplateId =
  | 'reception'
  | 'waiting-area'
  | 'lobby'
  | 'office'
  | 'conference-room'
  | 'inventory'
  | 'break-room'
  | 'training-room'
  | 'storage'
  | 'mechanical-room'
  | 'executive-office'
  | 'checkout'
  | 'photo-studio'
  | 'retail-floor'
  | 'kitchen'
  | 'dining-area'
  | 'treatment-room'
  | 'exam-room'
  | 'retail-boutique'
  | 'studio-floor'
  | 'reception-waiting';

export type DepartmentTemplate = {
  templateId: DepartmentTemplateId;
  displayName: string;
  description: string;
  purpose: string;
  defaultSocketIds: string[];
  defaultCapabilities: string[];
  constructionTemplateId: string;
  compatibleArchetypes: BusinessArchetypeId[];
  currentVersion: string;
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

/** Shared registry entry — one generated department reused across packs. */
export type SharedDepartmentInstance = {
  instanceId: string;
  templateId: DepartmentTemplateId;
  templateVersion: string;
  blueprintTemplateId: string;
  constructionTemplateId: string;
  materialLibraryId: string;
  lightingProfileId: string;
  cameraPackId: string;
  renderArtifactUrl: string | null;
  generatedAt: string | null;
  reuseCount: number;
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

export type SharedDepartmentRegistry = {
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
  instances: SharedDepartmentInstance[];
};

export type IndustryPackDepartmentSlot = {
  slotId: string;
  templateId: DepartmentTemplateId;
  pinnedVersion: string;
  displayName: string;
  floor: string;
  dependencies: string[];
  customizationLayerId: string | null;
};

export type IndustryPackAssetRef = {
  assetId: string;
  assetClass: string;
  departmentSlotId: string;
  required: boolean;
};

export type FounderPackPermissions = {
  canCustomizeDepartments: boolean;
  canCustomizeAssets: boolean;
  canCustomizeMaterials: boolean;
  canCustomizeLighting: boolean;
  canPublishMods: boolean;
  canPublishToMarketplace: boolean;
};

export type MarketplacePackEligibility = {
  eligible: boolean;
  tier: 'official' | 'certified' | 'community' | null;
  requiresCityCouncilApproval: boolean;
};

/** First-class Studio World object — complete headquarters template. */
export type IndustryPack = {
  packId: string;
  name: string;
  description: string;
  archetypeId: BusinessArchetypeId;
  packVersion: string;
  official: boolean;
  defaultDepartments: IndustryPackDepartmentSlot[];
  defaultAssets: IndustryPackAssetRef[];
  lightingProfileId: string;
  materialLibraryId: string;
  cameraPackId: string;
  blueprintTemplateId: string;
  constructionTemplateId: string;
  renderPromptId: string;
  founderPermissions: FounderPackPermissions;
  marketplaceEligibility: MarketplacePackEligibility;
  revisionHistory: string[];
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

export type IndustryPackRegistry = {
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
  packs: IndustryPack[];
};

export type DepartmentReuseDecision =
  | {
      action: 'reuse';
      instanceId: string;
      templateId: DepartmentTemplateId;
      templateVersion: string;
      reason: string;
    }
  | {
      action: 'generate';
      templateId: DepartmentTemplateId;
      templateVersion: string;
      reason: string;
    };

export type GenerationPriorityStep =
  | 'reuse-department'
  | 'reuse-construction-template'
  | 'reuse-material-library'
  | 'reuse-lighting-profile'
  | 'reuse-camera-pack'
  | 'generate-missing-departments'
  | 'generate-changed-departments';

export type HeadquartersDepartmentPlan = {
  slotId: string;
  templateId: DepartmentTemplateId;
  pinnedVersion: string;
  displayName: string;
  reuse: DepartmentReuseDecision;
  constructionTemplateId: string;
  materialLibraryId: string;
  lightingProfileId: string;
  cameraPackId: string;
  requiresGeneration: boolean;
};

export type HeadquartersGenerationPlan = {
  planVersion: typeof INDUSTRY_PACKS_VERSION;
  packId: string;
  packVersion: string;
  archetypeId: BusinessArchetypeId;
  organizationId: string;
  headquartersBlueprintId: string;
  departments: HeadquartersDepartmentPlan[];
  reuseInstanceIds: string[];
  generateSlotIds: string[];
  estimatedNewGenerations: number;
  estimatedReusedDepartments: number;
  generationPriority: GenerationPriorityStep[];
  packDependencyGraph: PackDependencyGraph;
  departmentReuseGraph: DepartmentReuseGraph;
};

export type PackDependencyGraph = {
  graphId: string;
  packId: string;
  nodes: { id: string; type: 'department' | 'asset' | 'mod'; label: string }[];
  edges: { from: string; to: string; relation: 'depends-on' | 'contains' | 'customizes' }[];
};

export type DepartmentReuseGraph = {
  graphId: string;
  nodes: { templateId: DepartmentTemplateId; version: string; instanceId: string | null }[];
  edges: { packId: string; templateId: DepartmentTemplateId; version: string; instanceId: string | null }[];
};

export type FounderPackInstance = {
  instanceId: string;
  organizationId: string;
  packId: string;
  packVersion: string;
  archetypeId: BusinessArchetypeId;
  status: 'draft' | 'generating' | 'review' | 'approved' | 'manufacturing' | 'published';
  departmentSlots: IndustryPackDepartmentSlot[];
  approvedAt: string | null;
  approvedBy: string | null;
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

export type MarketplacePackListing = {
  listingId: string;
  packId: string;
  packVersion: string;
  title: string;
  description: string;
  listingType:
    | 'industry-pack'
    | 'department-pack'
    | 'room-variant'
    | 'asset-collection'
    | 'material-library'
    | 'lighting-pack'
    | 'camera-pack'
    | 'animation-pack'
    | 'construction-template'
    | 'entire-headquarters';
  certificationTier: 'official' | 'certified' | 'community';
  creatorOrganizationId: string;
  registryVersion: typeof INDUSTRY_PACKS_VERSION;
};

export const APPROVED_HEADQUARTERS_HANDOFF_VERSION = 'approved-headquarters-handoff.v1' as const;

export type ApprovedHeadquartersHandoff = {
  handoffVersion: typeof APPROVED_HEADQUARTERS_HANDOFF_VERSION;
  organizationId: string;
  packId: string;
  packVersion: string;
  archetypeId: BusinessArchetypeId;
  founderPackInstanceId: string;
  headquartersBlueprintId: string;
  founderRenderJobId: string;
  previewArtifactUrl: string;
  approvedAt: string;
  approvedBy: string;
  departmentRegistry: IndustryPackDepartmentSlot[];
  constructionMetadata: {
    constructionTemplateId: string;
    materialLibraryId: string;
    lightingProfileId: string;
    cameraPackId: string;
  };
  packDependencyGraph: PackDependencyGraph;
  departmentReuseGraph: DepartmentReuseGraph;
  assetGraphNodeCount: number;
};
