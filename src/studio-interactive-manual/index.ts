export {
  StudioInteractiveManualProvider,
  useStudioInteractiveManual,
  useStudioInteractiveManualOptional,
} from './StudioInteractiveManualContext';
export type { StudioInteractiveManualContextValue } from './StudioInteractiveManualContext';
export { STUDIO_INTERACTIVE_MANUAL_LABEL } from './constants';
export { getAllManualModules, getManualModuleById } from './registry';
export { buildManualSearchIndex, searchManualIndex } from './searchIndex';
export { getManualProgressSummary, readManualProgressStore } from './progressStorage';
export { readManualMissingTargetLogs } from './targetResolver';
export { STUDIO_MANUAL_WHATS_NEW, getRecentWhatsNew } from './whatsNew';
export { resolveManualModuleIdForPath } from './knowledge-graph/queries';
export * from './knowledge-graph';
