import { getOrganizationPerformanceMonitorProfile } from './store';

export function isPerformanceMonitorActive(organizationId: string): boolean {
  return getOrganizationPerformanceMonitorProfile(organizationId) !== null;
}

export function hasPerformanceBottlenecks(organizationId: string): boolean {
  return (getOrganizationPerformanceMonitorProfile(organizationId)?.bottlenecksOpen ?? 0) > 0;
}
