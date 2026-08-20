/**
 * studio-os-core — reusable studio os platform package.
 * Industry-agnostic logic only; workspace implementations live in src/workspaces/.
 */

export {
  configureStudioOsAuth,
  getStudioOsAuthProvider,
  tryGetStudioOsAuthProvider,
} from './auth/provider';

export type { StudioOsAuthUser, StudioOsAuthProvider, StudioOsOrgMembership } from './auth/types';

export {
  resolveOrgMembership,
  ensureOrgMembershipResolved,
  getCachedOrgMembership,
  clearOrgMembershipCache,
} from './auth/membership';

export {
  resolveHeadquartersPageModule,
  isLegacyFrontalSlayerStudioPath,
  headquartersModuleCount,
} from './workspace/headquarters-module-resolver';

export {
  resolveWorkspaceIdFromRoute,
  resolveBootstrapWorkspaceId,
  isNdxbookScopedRoute,
} from './workspace/route-workspace-resolver';
export type { RouteMembershipContext } from './workspace/route-workspace-resolver';

export { STUDIO_OS_PLATFORM } from './config/platform';
export type { StudioOsPlatformConfig } from './config/platform';

export { STUDIO_OS_PRODUCT_LAYERS, STUDIO_OS_KNOWN_ORGANIZATIONS } from './application/layers';
export type { StudioOsKnownOrganizationId } from './application/layers';

export {
  isPortfolioOwner,
  canAccessStudioAdministration,
  canSwitchOrganizations,
  getAssignedOrganizationWorkspaceId,
} from './application/portfolio-access';

export {
  STUDIO_ADMINISTRATION_ROUTES,
  ORGANIZATION_ROUTES,
  isStudioAdministrationPath,
  isOrganizationHeadquartersPath,
} from './application/routes';

export {
  INHERITED_PLATFORM_CAPABILITIES,
  buildInheritedFeatureManifest,
  listCapabilitiesByCategory,
} from './feature-inheritance/registry';
export type { InheritedPlatformCapability, WorkspaceFeatureManifest } from './feature-inheritance/registry';

export { tenantScopedKey, assertTenantAccess } from './tenant/isolation';
export type { TenantIsolationDomain } from './tenant/isolation';

export { STUDIO_OS_VOCABULARY } from './core/vocabulary';
export type { StudioOsVocabularyKey } from './core/vocabulary';

export { STUDIO_OS_CORE_MODULES } from './core/modules';
export type { StudioOsCoreModule, StudioOsCoreModuleId } from './core/modules';

export { STUDIO_OS_PLATFORM_ASSETS } from './core/assets';

export {
  WorkspaceProvider,
  useWorkspace,
  getActiveWorkspaceDataAdapter,
} from './context/WorkspaceProvider';
export type { WorkspaceContextValue } from './context/WorkspaceProvider';

export {
  loadWorkspace,
  getWorkspaceModuleSubtitle,
  getWorkspaceStudioHubSubtitle,
  getWorkspaceStudioHubFooter,
} from './workspace/loader';
export type { LoadedWorkspace } from './workspace/loader';

export { configureWorkspaceRegistry, getWorkspaceRegistry } from './workspace/registry';
export type { WorkspaceRegistryApi } from './workspace/registry';

export type { WorkspaceDataAdapter } from './workspace/data-adapter';
export { emptyWorkspaceDataAdapter } from './workspace/empty-data-adapter';

export { STUDIO_OS_ROUTES, workspaceStudioModulePath, workspaceStudioEntryPath } from './workspace/routes';

export * from './profession-simulation-engine';

export {
  readActiveWorkspaceIdFromStorage,
  writeActiveWorkspaceIdToStorage,
  getRuntimeActiveWorkspaceId,
  setRuntimeActiveWorkspaceId,
  STUDIO_OS_DEFAULT_WORKSPACE_ID,
  STUDIO_OS_ACTIVE_WORKSPACE_KEY,
  scopeStorageKey,
} from './workspace/storage';

export {
  DEFAULT_WORKSPACE_PERMISSIONS,
  canAccessWorkspaceStudio,
  isPlaceholderWorkspace,
} from './workspace/permissions';

export type {
  WorkspaceId,
  WorkspaceStatus,
  WorkspaceBrandColors,
  WorkspaceTypography,
  WorkspacePermissions,
  WorkspaceModuleCopy,
  WorkspaceSchema,
  WorkspaceListItem,
} from './workspace/types';

export type * from './types/asset';
export type * from './types/blueprint';
export type * from './types/content-pack';
export type * from './types/mission-control';
export type * from './types/production';
export type * from './types/distribution';
export type * from './types/legacy';

export type {
  StudioServicePhase,
  StudioServiceResult,
  StudioServiceStub,
  StudioServiceFailureReason,
  ProviderAdapterState,
  StudioProviderAdapter,
} from './services/interfaces';
export { studioServiceNotConnected, studioServicePhase2 } from './services/interfaces';

export {
  createDefaultAiProviderStates,
  isAssetFactoryProviderId,
  normalizeProviderStatus,
} from './providers/adapters';
export type { AiProductionProviderAdapter, AssetFactoryProviderAdapter } from './providers/adapters';

export {
  CREATIVE_INTELLIGENCE_KERNEL_STAGES,
  runCreativeIntelligenceGate,
  shouldProceedToGeneration,
  formatDecisionForFounder,
} from './creative-intelligence-engine';
export type {
  CreativeIntelligenceDecision,
  FounderIntentInput,
  CreativeIntelligenceGateResult,
  KernelStage,
} from './creative-intelligence-engine';

export * from './studio-world';
export * from './studio-world-constitution';
export * from './global-atlas-layer';
export * from './collaborative-innovation-network';
export * from './innovation-lineage';
export * from './innovation-constellations';
export * from './innovation-expeditions';
export * from './design-principles';
export * from './virtual-production';
export * from './mission-control';
export * from './world-physics';
export * from './implementation-standards';
export * from './progressive-presence';
export * from './studio-world-experience';
export * from './architecture-auditor';
export * from './experience-intelligence-engine';
export * from './studio-world-atlas';
export * from './orb-recommendations';
export * from './hero-objects';
export * from './world-graph';
export * from './studio-world-knowledge-core';
export * from './studio-world-memory-system';
export * from './asset-compiler';
export * from './studio-foundry';
export * from './career-worlds';
export * from './studio-world-codex';
export * from './knowledge-retention-engine';
export * from './studio-exchange';
export * from './professional-memory-wisdom-engine';
export * from './business-discovery';
export * from './environment-asset-package';
