export { STUDIO_OS_PLATFORM } from './config/platform';
export { STUDIO_OS_VOCABULARY } from './core/vocabulary';
export { STUDIO_OS_CORE_MODULES } from './core/modules';
export { STUDIO_OS_PLATFORM_ASSETS } from './core/assets';
export { WorkspaceProvider, useWorkspace, getActiveWorkspaceDataAdapter } from './context/WorkspaceProvider';
export { loadWorkspace, getWorkspaceModuleSubtitle, getWorkspaceStudioHubSubtitle } from './workspace/loader';
export { STUDIO_OS_ROUTES, workspaceStudioModulePath } from './workspace/routes';
export {
  readActiveWorkspaceIdFromStorage,
  writeActiveWorkspaceIdToStorage,
  STUDIO_OS_DEFAULT_WORKSPACE_ID,
  scopeStorageKey,
} from './workspace/storage';
export type { WorkspaceSchema, WorkspaceListItem, WorkspaceModuleCopy } from './workspace/types';
