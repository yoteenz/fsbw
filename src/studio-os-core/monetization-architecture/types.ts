/**
 * Milestone 89 — Studio OS Monetization Architecture V1.0
 * Three-layer economy: Headquarters License · Department Packs · Digital Workforce
 */

export type PricingLayer = 'headquarters-license' | 'department-pack' | 'digital-workforce';

export type HeadquartersLicenseStatus = 'active' | 'trial' | 'paused';

export type DigitalStaffStatus = 'active' | 'paused' | 'available';

export type DigitalStaffDefinition = {
  id: string;
  name: string;
  role: string;
  departmentLabel: string;
  monthlyPayroll: number;
  /** Pack that unlocks this role — undefined = core organization staff. */
  unlockedByPackId?: string;
  /** Included with Headquarters License — no payroll line item when active. */
  includedInHeadquartersLicense?: boolean;
  description: string;
};

export type DepartmentPackPricing = {
  packId: string;
  layer: 'department-pack';
  permanentPrice: number;
  label: string;
  /** Wings that visibly expand Headquarters when owned. */
  expansionWings: string[];
};

export type HeadquartersLicense = {
  status: HeadquartersLicenseStatus;
  monthlyAmount: number;
  renewsAt: string;
  includes: string[];
};

export type DigitalStaffActivation = {
  staffId: string;
  status: DigitalStaffStatus;
  activatedAt?: string;
  pausedAt?: string;
};

export type OrganizationMonetizationProfile = {
  organizationId: string;
  headquartersLicense: HeadquartersLicense;
  /** Permanent department / expansion pack ownership (never recurring unlock). */
  ownedPackIds: string[];
  staffActivations: DigitalStaffActivation[];
  updatedAt: string;
};

export type MonetizationArchitectureStore = {
  profiles: OrganizationMonetizationProfile[];
  version: string;
};

export type DigitalPayrollSummary = {
  activeEmployeeCount: number;
  availableEmployeeCount: number;
  pausedEmployeeCount: number;
  monthlyDigitalPayroll: number;
  headquartersLicenseMonthly: number;
  totalMonthlyInvestment: number;
};

export type GrowthRecommendation = {
  id: string;
  signal: string;
  headline: string;
  recommendedExpansion: string;
  packId?: string;
  staffId?: string;
  executiveTone: string;
};

export type ExecutiveGrowthAdvice = {
  response: string;
  concierge: string;
  recommendedPackId?: string;
  recommendedStaffId?: string;
  suggestedCommand?: string;
};
