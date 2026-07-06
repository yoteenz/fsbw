export {
  INDUSTRY_ARCHITECTURE_STORAGE_KEY,
  INDUSTRY_ARCHITECTURE_VERSION,
  UNIVERSAL_MARKETING_PACK_ID,
  EXPANSION_CENTER_TAGLINE,
} from './constants';

export type {
  IndustryId,
  PackKind,
  HeadquartersDepartment,
  ConciergeSpecialist,
  PackInstallOutcome,
  DepartmentPackDefinition,
  IndustryDefinition,
  InstalledPackRecord,
  OrganizationArchitectureProfile,
  IndustryArchitectureStore,
  ExpansionInstallPlan,
  DockExpansionRecommendation,
} from './types';

export {
  INDUSTRY_DEFINITIONS,
  getIndustryDefinition,
  listIndustryDefinitions,
  resolveIndustryForWorkspace,
} from './industries';

export {
  DEPARTMENT_PACKS,
  isUniversalMarketingPack,
} from './department-packs';

export { EXPANSION_PACKS } from './expansion-packs';

export {
  ALL_PACKS,
  getPackDefinition,
  listDepartmentPacks,
  listExpansionPacks,
  listStarterPacksForIndustry,
  listRecommendedExpansionPacks,
  listFeaturedExpansionPacks,
} from './pack-registry';

export {
  buildExpansionInstallPlan,
  mergePackIntoProfile,
  buildInitialOrganizationProfile,
  buildHeadquartersLayout,
  installPackOnProfile,
} from './install-engine';

export {
  readIndustryArchitectureStore,
  writeIndustryArchitectureStore,
  getOrganizationArchitectureProfile,
  upsertOrganizationArchitectureProfile,
  ensureOrganizationArchitectureProfile,
  installDepartmentPack,
  setOrganizationIndustry,
  listAllOrganizationProfiles,
} from './store';

export { bootstrapIndustryArchitecturePlatform, bootstrapOrganizationArchitecture } from './bootstrap';

export { resolveDockExpansionRecommendation, listDockExpansionSuggestions } from './dock-advisor';
