import type { ContentClass } from './contract';

export const CONTENT_CLASSIFICATION_VERSION = 'content-classification.v1' as const;

export type ContentClassDefinition = {
  classId: ContentClass;
  displayName: string;
  description: string;
  tenantOwned: boolean;
  globalScope: boolean;
  officialPackEligible: boolean;
};

export const CONTENT_CLASS_REGISTRY: Record<ContentClass, ContentClassDefinition> = {
  CANONICAL_STUDIO_WORLD_DEPARTMENT: {
    classId: 'CANONICAL_STUDIO_WORLD_DEPARTMENT',
    displayName: 'Canonical Studio World Department',
    description: 'Global Studio World infrastructure — exists once.',
    tenantOwned: false,
    globalScope: true,
    officialPackEligible: false,
  },
  SHARED_HQ_DEPARTMENT_TEMPLATE: {
    classId: 'SHARED_HQ_DEPARTMENT_TEMPLATE',
    displayName: 'Shared HQ Department Template',
    description: 'Neutral reusable headquarters department across Industry Packs.',
    tenantOwned: false,
    globalScope: false,
    officialPackEligible: true,
  },
  INDUSTRY_UNIQUE_DEFAULT_TEMPLATE: {
    classId: 'INDUSTRY_UNIQUE_DEFAULT_TEMPLATE',
    displayName: 'Industry-Unique Default Template',
    description: 'Neutral industry-specific department provided by Studio World.',
    tenantOwned: false,
    globalScope: false,
    officialPackEligible: true,
  },
  FOUNDER_CUSTOMIZED_DEPARTMENT: {
    classId: 'FOUNDER_CUSTOMIZED_DEPARTMENT',
    displayName: 'Founder Customized Department',
    description: 'Founder customized version of a default department.',
    tenantOwned: true,
    globalScope: false,
    officialPackEligible: false,
  },
  FOUNDER_CREATED_MODDED_SCENE: {
    classId: 'FOUNDER_CREATED_MODDED_SCENE',
    displayName: 'Founder-Created Modded Scene',
    description: 'New founder-created scene not included in the official pack.',
    tenantOwned: true,
    globalScope: false,
    officialPackEligible: false,
  },
  MARKETPLACE_LICENSED_MOD: {
    classId: 'MARKETPLACE_LICENSED_MOD',
    displayName: 'Marketplace Licensed Mod',
    description: 'Certified installable derivative under license.',
    tenantOwned: false,
    globalScope: false,
    officialPackEligible: false,
  },
};

/** Founder-protected scenes — never official Industry Pack defaults. */
export const FOUNDER_PROTECTED_SCENE_IDS = new Set([
  'build-a-wig-atelier',
  'hair-analysis-lab',
  'transformation-suite',
]);

export function classifyContent(input: {
  contentId: string;
  isCanonicalRegistryMember?: boolean;
  isSharedHqTemplate?: boolean;
  isFounderMod?: boolean;
  isMarketplaceLicensed?: boolean;
  isFounderCustomization?: boolean;
}): ContentClass {
  if (input.isCanonicalRegistryMember) return 'CANONICAL_STUDIO_WORLD_DEPARTMENT';
  if (input.isMarketplaceLicensed) return 'MARKETPLACE_LICENSED_MOD';
  if (input.isFounderMod || FOUNDER_PROTECTED_SCENE_IDS.has(input.contentId)) {
    return 'FOUNDER_CREATED_MODDED_SCENE';
  }
  if (input.isFounderCustomization) return 'FOUNDER_CUSTOMIZED_DEPARTMENT';
  if (input.isSharedHqTemplate) return 'SHARED_HQ_DEPARTMENT_TEMPLATE';
  return 'INDUSTRY_UNIQUE_DEFAULT_TEMPLATE';
}
