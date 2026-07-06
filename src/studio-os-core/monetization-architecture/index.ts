export {
  MONETIZATION_ARCHITECTURE_STORAGE_KEY,
  MONETIZATION_ARCHITECTURE_VERSION,
  MONETIZATION_PHILOSOPHY,
  THREE_LAYER_ECONOMY,
  HEADQUARTERS_LICENSE_MONTHLY,
  HEADQUARTERS_LICENSE_INCLUDES,
  DEFAULT_DIGITAL_STAFF_MONTHLY,
  EXPANSION_CENTER_MONETIZATION_TAGLINE,
} from './constants';

export type {
  PricingLayer,
  HeadquartersLicenseStatus,
  DigitalStaffStatus,
  DigitalStaffDefinition,
  DepartmentPackPricing,
  HeadquartersLicense,
  DigitalStaffActivation,
  OrganizationMonetizationProfile,
  MonetizationArchitectureStore,
  DigitalPayrollSummary,
  GrowthRecommendation,
  ExecutiveGrowthAdvice,
} from './types';

export {
  buildDefaultHeadquartersLicense,
  formatHeadquartersLicenseLabel,
} from './headquarters-license';

export {
  DEPARTMENT_PACK_PRICING,
  getDepartmentPackPricing,
  formatPermanentPurchasePrice,
} from './pack-pricing';

export {
  DIGITAL_STAFF_CATALOG,
  getDigitalStaffDefinition,
  listDigitalStaffCatalog,
  resolveStaffIdFromConcierge,
} from './digital-staff-catalog';

export {
  listUnlockedStaffIds,
  getStaffStatus,
  buildDigitalPayrollSummary,
  listStaffForOwnedPack,
  formatMonthlyPayroll,
} from './payroll-engine';

export {
  listGrowthRecommendations,
  getPrimaryGrowthRecommendation,
} from './growth-recommendations';

export {
  readMonetizationArchitectureStore,
  writeMonetizationArchitectureStore,
  getOrganizationMonetizationProfile,
  upsertOrganizationMonetizationProfile,
  ensureOrganizationMonetizationProfile,
  recordDepartmentPackPurchase,
  setDigitalStaffStatus,
  syncMonetizationFromArchitecture,
} from './store';

export {
  bootstrapMonetizationArchitecturePlatform,
  bootstrapOrganizationMonetization,
} from './bootstrap';

export {
  resolveExecutiveGrowthAdvice,
  buildProactiveGrowthSuggestion,
  listExecutiveGrowthSuggestions,
} from './dock-advisor';
