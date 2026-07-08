/**
 * Discovery States™ — lifecycle from conception to historical canon.
 * Part of the World Graph™ — internal states never expose pack identity publicly.
 */

import type { DiscoveryPackStatus, DiscoveryState } from './types';

/** Ordered lifecycle — each Discovery Pack traverses this path */
export const DISCOVERY_STATE_ORDER: readonly DiscoveryState[] = [
  'conceived',
  'research',
  'prototype',
  'hidden',
  'rumored',
  'teased',
  'announced',
  'discovered',
  'integrated',
  'historical',
] as const;

/** States visible to founders in the current era — never the full roadmap */
export const PUBLIC_ERA_VISIBLE_STATES: readonly DiscoveryState[] = [
  'rumored',
  'teased',
  'announced',
  'discovered',
  'integrated',
  'historical',
] as const;

/** States that must never appear in founder UI with pack identity */
export const INTERNAL_ONLY_STATES: readonly DiscoveryState[] = [
  'conceived',
  'research',
  'prototype',
  'hidden',
] as const;

const STATUS_TO_DEFAULT_STATE: Record<DiscoveryPackStatus, DiscoveryState> = {
  reserved: 'hidden',
  classified: 'hidden',
  scheduled: 'rumored',
  revealed: 'announced',
  released: 'discovered',
  archived: 'historical',
};

export function resolveDiscoveryState(
  explicitState: DiscoveryState | undefined,
  status: DiscoveryPackStatus
): DiscoveryState {
  return explicitState ?? STATUS_TO_DEFAULT_STATE[status];
}

export function isPublicEraVisibleState(state: DiscoveryState): boolean {
  return (PUBLIC_ERA_VISIBLE_STATES as readonly string[]).includes(state);
}

export function isInternalOnlyState(state: DiscoveryState): boolean {
  return (INTERNAL_ONLY_STATES as readonly string[]).includes(state);
}

export function discoveryStateIndex(state: DiscoveryState): number {
  return DISCOVERY_STATE_ORDER.indexOf(state);
}

export function hasReachedState(current: DiscoveryState, target: DiscoveryState): boolean {
  return discoveryStateIndex(current) >= discoveryStateIndex(target);
}

export function nextDiscoveryState(state: DiscoveryState): DiscoveryState | null {
  const idx = discoveryStateIndex(state);
  if (idx < 0 || idx >= DISCOVERY_STATE_ORDER.length - 1) return null;
  return DISCOVERY_STATE_ORDER[idx + 1]!;
}

export function discoveryStateLabel(state: DiscoveryState): string {
  const labels: Record<DiscoveryState, string> = {
    conceived: 'Conceived™',
    research: 'Research™',
    prototype: 'Prototype™',
    hidden: 'Hidden™',
    rumored: 'Rumored™',
    teased: 'Teased™',
    announced: 'Announced™',
    discovered: 'Discovered™',
    integrated: 'Integrated™',
    historical: 'Historical™',
  };
  return labels[state];
}

/** Count registry entries by lifecycle bucket — public API uses aggregates only */
export function countByDiscoveryState(
  entries: readonly { discoveryState?: DiscoveryState; status: DiscoveryPackStatus }[]
): Record<DiscoveryState, number> {
  const counts = Object.fromEntries(
    DISCOVERY_STATE_ORDER.map((s) => [s, 0])
  ) as Record<DiscoveryState, number>;

  for (const entry of entries) {
    const state = resolveDiscoveryState(entry.discoveryState, entry.status);
    counts[state] += 1;
  }

  return counts;
}
