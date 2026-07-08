/**
 * Headquarters Principles™ — constitutional platform governance schemas.
 * Studio OS is Company Headquarters™, not an admin dashboard.
 */

export type PlatformMaturityStage =
  | 'internal-tool'
  | 'founder-workflow'
  | 'company-capability'
  | 'platform-product';

export type InternalValidationStatus = 'pending' | 'in-progress' | 'passed' | 'failed';

export type UsageLevel = 'none' | 'occasional' | 'daily' | 'embedded';

export type ReadinessDimensionId =
  | 'founder-adoption'
  | 'daily-usage'
  | 'business-impact'
  | 'technical-stability'
  | 'architectural-completeness'
  | 'integration-quality'
  | 'user-delight'
  | 'documentation-completeness';

export type ReadinessDimensionScore = {
  id: ReadinessDimensionId;
  label: string;
  score: number;
  weight: number;
  evidence?: string;
};

export type SubsystemMaturityRecord = {
  subsystemId: string;
  title: string;
  description: string;
  currentStage: PlatformMaturityStage;
  internalValidation: InternalValidationStatus;
  founderUsage: UsageLevel;
  companyUsage: UsageLevel;
  platformReadiness: number;
  readinessDimensions: ReadinessDimensionScore[];
  dependencies: string[];
  expansionEligible: boolean;
  expansionBlockers: string[];
  codexArticleIds: string[];
  routePath?: string;
  moduleKey?: string;
  updatedAt: string;
};

export type HeadquartersZoneId =
  | 'executive-atrium'
  | 'founder-office'
  | 'department-wings'
  | 'mission-control'
  | 'daily-briefing'
  | 'ai-concierge'
  | 'studio-intelligence'
  | 'orb'
  | 'atlas';

export type HeadquartersZone = {
  id: HeadquartersZoneId;
  title: string;
  purpose: string;
  routePath: string;
  relatedSystems: string[];
};

export type CanonicalTerminologyEntry = {
  legacyTerm: string;
  constitutionalTerm: string;
  description: string;
};

export type HeadquartersPrinciplesStore = {
  version: string;
  subsystems: SubsystemMaturityRecord[];
  bootstrappedAt?: string;
};

export type PlatformReadinessReport = {
  subsystemId: string;
  title: string;
  readinessScore: number;
  currentStage: PlatformMaturityStage;
  expansionEligible: boolean;
  expansionBlockers: string[];
  topGap?: string;
};

export type DailyBriefingLine = {
  kind: 'priority' | 'advisory' | 'readiness' | 'maturity' | 'navigation';
  title: string;
  detail: string;
  routePath?: string;
};
