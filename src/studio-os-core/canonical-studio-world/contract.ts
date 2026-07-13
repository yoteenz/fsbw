/**
 * Canonical Studio World Architecture™ — global infrastructure vs company HQ boundary.
 */

export const CANONICAL_STUDIO_WORLD_VERSION = 'canonical-studio-world.v1' as const;

export type CanonicalDepartmentId =
  | 'experience-lab'
  | 'creative-director-studio'
  | 'construction-mode'
  | 'marketplace'
  | 'permit-office'
  | 'city-council'
  | 'composition-studio'
  | 'asset-registry'
  | 'lighting-studio'
  | 'material-library'
  | 'blueprint-author'
  | 'ai-workforce'
  | 'immune-system'
  | 'quality-guard'
  | 'world-compiler'
  | 'asset-vault'
  | 'command-center';

export type CanonicalDepartment = {
  departmentId: CanonicalDepartmentId;
  displayName: string;
  purpose: string;
  routePath: string;
  /** Canonical departments are global — never tenant-scoped. */
  scope: 'studio-world-global';
  registryVersion: typeof CANONICAL_STUDIO_WORLD_VERSION;
};

export type StudioWorldHierarchyLayer =
  | 'studio-world'
  | 'canonical-departments'
  | 'industry-packs'
  | 'company-hq'
  | 'hq-departments'
  | 'rooms'
  | 'scenes'
  | 'assets';

export type ExperienceLabIndustryPackOptionId =
  | 'hair-brand'
  | 'hair-salon'
  | 'medical-practice'
  | 'law-firm'
  | 'real-estate'
  | 'architecture'
  | 'restaurant'
  | 'fitness'
  | 'creator'
  | 'agency'
  | 'education'
  | 'e-commerce'
  | 'technology'
  | 'nonprofit'
  | 'hospitality'
  | 'corporate'
  | 'government'
  | 'custom-blank';

export type ExperienceLabIndustryPackOption = {
  optionId: ExperienceLabIndustryPackOptionId;
  displayName: string;
  description: string;
  industryPackId: string;
  archetypeId: string;
};

export type CompanyHqEditableLayer =
  | 'company-hq'
  | 'hq-departments'
  | 'rooms'
  | 'scenes'
  | 'decor'
  | 'materials'
  | 'furniture'
  | 'lighting'
  | 'brand-assets'
  | 'architecture'
  | 'custom-additions';

export type CanonicalValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export type ExperienceLabEntryContext = {
  selectedPackOptionId: ExperienceLabIndustryPackOptionId;
  industryPackId: string;
  /** Founder company HQ — tenant scope for customization only. */
  companyHqOrganizationId: string;
  canonicalDepartmentsInUse: CanonicalDepartmentId[];
};
