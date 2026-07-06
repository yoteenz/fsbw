import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PERFORMANCE_MONITOR_UPDATED,
  getOrganizationPerformanceMonitorProfile,
  syncPerformanceMonitorFromSources,
  type OrganizationPerformanceMonitorProfile,
} from '../studio-os-core/performance-monitor';

export function usePerformanceMonitorState() {
  return useStudioProfileState<OrganizationPerformanceMonitorProfile>({
    getProfile: getOrganizationPerformanceMonitorProfile,
    syncProfile: syncPerformanceMonitorFromSources,
    updatedEvent: STUDIO_OS_PERFORMANCE_MONITOR_UPDATED,
  });
}
