export {
  EXPERT_MARKETPLACE_STORAGE_KEY,
  EXPERT_MARKETPLACE_VERSION,
  EXPERT_MARKETPLACE_PHILOSOPHY,
  REGULATED_INDUSTRIES,
  TRUST_DISCLAIMER_LEVELS,
  REVENUE_CHANNEL_TYPES,
  DISCOVERY_DIMENSIONS,
} from './constants';

export type {
  ExpertTrustLevel,
  ExpertConsumerCapability,
  ExpertProfile,
  AcademyMarketplaceOffering,
  RevenueOffering,
  MultiAudienceExperience,
  ExpertMarketplaceListing,
  OrganizationExpertMarketplaceProfile,
  ExpertMarketplaceStore,
  ExpertDiscoveryQuery,
  ExpertMarketplaceDockAdvice,
} from './types';

export {
  buildExpertProfileFromBrain,
  buildExpertProfilesFromProfessionBrain,
} from './profile-generator';

export {
  discoverExperts,
  listDiscoverySuggestions,
} from './discovery-engine';

export {
  getTrustDisclaimer,
  formatTrustBadge,
  requiresLicensedReview,
} from './trust-transparency';

export { generateAcademyOfferings } from './academy-connection';

export {
  generateRevenueOfferings,
  summarizeRevenueChannels,
} from './monetization';

export { generateAudienceExperiences } from './multi-audience';

export {
  readExpertMarketplaceStore,
  writeExpertMarketplaceStore,
  syncExpertMarketplaceFromProfessionBrain,
  getOrganizationExpertMarketplaceProfile,
  ensureOrganizationExpertMarketplaceProfile,
  setExpertPublished,
  listPublicExpertCatalog,
  bootstrapExpertMarketplaceForOrg,
} from './store';

export { bootstrapExpertMarketplacePlatform } from './bootstrap';

export {
  resolveExpertMarketplaceAdvice,
  listExpertMarketplaceDockSuggestions,
} from './dock-advisor';
