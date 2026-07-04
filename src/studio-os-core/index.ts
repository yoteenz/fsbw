/**
 * studio-os-core — reusable studio os platform package.
 * Industry-agnostic logic only; workspace implementations live in src/workspaces/.
 */

export { STUDIO_OS_PLATFORM } from './config/platform';
export type { StudioOsPlatformConfig } from './config/platform';

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
