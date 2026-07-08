import { EXECUTIVE_ATRIUM_PATH } from './constants';
import { getDefaultHeadquartersArrivalPath } from './headquarters/architecture';

/** Routing philosophy — founders arrive at headquarters, not dashboards. */
export const HEADQUARTERS_ROUTING_PHILOSOPHY = {
  defaultArrival: EXECUTIVE_ATRIUM_PATH,
  spatialNavigation: true,
  menuIsLegacy: true,
  atlasPreferred: true,
  orbIsExecutiveIntelligence: true,
} as const;

export function resolveFounderArrivalPath(preferredPath?: string): string {
  return preferredPath ?? getDefaultHeadquartersArrivalPath();
}

export function isDashboardLegacyPath(path: string): boolean {
  return /\/admin\/dashboard/i.test(path);
}

export function resolveHeadquartersRoute(legacyPath: string): string {
  if (isDashboardLegacyPath(legacyPath)) {
    return getDefaultHeadquartersArrivalPath();
  }
  return legacyPath;
}

export function getRoutingPhilosophyLines(): string[] {
  return [
    'Founders arrive at Executive Atrium™ — not an admin dashboard.',
    'Navigation Through Space™ replaces menu-first wayfinding where possible.',
    'Atlas™ and Orb™ are constitutional navigation and intelligence surfaces.',
    'Every route should reinforce that Studio OS is Company Headquarters™.',
  ];
}
