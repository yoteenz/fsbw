/**
 * Milestone 88 — Industry Architecture, Department Packs & Expansion Center V1.0
 * Permanent architecture for how every organization is created, expanded, and evolves.
 */

export type IndustryId =
  | 'creator'
  | 'ecommerce'
  | 'beauty'
  | 'contractor'
  | 'construction'
  | 'painting'
  | 'landscaping'
  | 'restaurant'
  | 'medical'
  | 'dental'
  | 'law-firm'
  | 'real-estate'
  | 'insurance'
  | 'financial-services'
  | 'nonprofit'
  | 'fitness'
  | 'hospitality'
  | 'education'
  | 'agency'
  | 'manufacturing'
  | 'automotive';

export type PackKind = 'department-pack' | 'expansion-pack';

export type HeadquartersDepartment = {
  id: string;
  label: string;
  wingLabel?: string;
  description: string;
  /** Links to adminStudioNavigation module id when routable. */
  moduleId?: string;
  kpiLabel?: string;
  kpiValue?: string;
  icon?: string;
};

export type ConciergeSpecialist = {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  focus: string;
};

export type PackInstallOutcome = {
  departmentsAdded: HeadquartersDepartment[];
  conciergesAdded: ConciergeSpecialist[];
  navModuleIds: string[];
  kpiLabels: string[];
  commandDockCapabilities: string[];
  automationRules: string[];
};

export type DepartmentPackDefinition = {
  id: string;
  kind: PackKind;
  name: string;
  tagline: string;
  description: string;
  /** Industries that receive this pack on Day One onboarding. */
  defaultForIndustries: IndustryId[];
  /** Industries where this pack is recommended in Expansion Center. */
  recommendedForIndustries: IndustryId[];
  outcome: PackInstallOutcome;
  installPreview: string;
  featured?: boolean;
};

export type IndustryDefinition = {
  id: IndustryId;
  label: string;
  tagline: string;
  /** Default department pack ids installed at org creation (plus universal marketing). */
  starterPackIds: string[];
  headquartersExample: string[];
  marketingInsightExample: string;
};

export type InstalledPackRecord = {
  packId: string;
  installedAt: string;
  version: string;
};

export type OrganizationArchitectureProfile = {
  organizationId: string;
  industryId: IndustryId;
  installedPacks: InstalledPackRecord[];
  headquartersDepartments: HeadquartersDepartment[];
  conciergeRoster: ConciergeSpecialist[];
  marketingInsight: string;
  recommendedExpansionPackIds: string[];
  commandDockShortcuts: string[];
  onboardingComplete: boolean;
  updatedAt: string;
};

export type IndustryArchitectureStore = {
  profiles: OrganizationArchitectureProfile[];
  version: string;
};

export type ExpansionInstallPlan = {
  packId: string;
  packName: string;
  previewDepartments: string[];
  previewConcierges: string[];
  previewMessage: string;
  expandsHeadquarters: boolean;
};

export type DockExpansionRecommendation = {
  triggerPhrase: string;
  recommendedPackId: string;
  response: string;
  previewDepartments: string[];
};
