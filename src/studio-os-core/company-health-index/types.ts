import type { HEALTH_CATEGORIES, HEALTH_STATUS_LEVELS } from './constants';

export type HealthCategoryId = (typeof HEALTH_CATEGORIES)[number];
export type HealthStatusLevel = (typeof HEALTH_STATUS_LEVELS)[number];

export type CategoryHealthScore = {
  id: HealthCategoryId;
  label: string;
  scorePct: number;
  status: HealthStatusLevel;
  signal: string;
  recommendation: string;
  sourceModules: string[];
  trend: 'rising' | 'stable' | 'declining';
};

export type WeakAreaAlert = {
  id: string;
  categoryId: HealthCategoryId;
  label: string;
  scorePct: number;
  severity: 'watch' | 'at-risk' | 'critical';
  proactiveAction: string;
};

export type OrganizationHealthIndexProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  executiveHealthScore: number;
  executiveStatus: HealthStatusLevel;
  categoryScores: CategoryHealthScore[];
  weakAreas: WeakAreaAlert[];
  proactivePriorities: string[];
  syncedSources: string[];
};

export type CompanyHealthIndexStore = {
  version: string;
  profiles: OrganizationHealthIndexProfile[];
};

export type CompanyHealthIndexDockAdvice = {
  response: string;
  concierge: string;
  executiveScore?: number;
};
