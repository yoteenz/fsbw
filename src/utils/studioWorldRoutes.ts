/**
 * Studio World™ V4 — routing helpers for admin navigation and deep links.
 */

import {
  FLAGSHIP_DESTINATIONS,
  getCurrentWorldLocation,
  STUDIO_WORLD_BASE_PATH,
  type StudioWorldFlagshipId,
  type StudioWorldRouteMapping,
} from '../studio-os-core/studio-world';

export { STUDIO_WORLD_BASE_PATH };

export function adminStudioWorldPath(segments = ''): string {
  const trimmed = segments.replace(/^\//, '');
  return trimmed ? `${STUDIO_WORLD_BASE_PATH}/${trimmed}` : STUDIO_WORLD_BASE_PATH;
}

export function adminStudioWorldFlagshipPath(flagshipId: StudioWorldFlagshipId): string {
  const flagship = FLAGSHIP_DESTINATIONS.find((f) => f.id === flagshipId);
  return flagship?.worldEntryPath ?? STUDIO_WORLD_BASE_PATH;
}

/** Prefer canonical world path; fall back to legacy if unmapped. */
export function preferWorldPath(mapping: StudioWorldRouteMapping): string {
  return mapping.worldPath;
}

export function worldLocationForPathname(pathname: string): StudioWorldRouteMapping | null {
  return getCurrentWorldLocation(pathname);
}

export function worldLocationLabel(pathname: string): string | null {
  const loc = getCurrentWorldLocation(pathname);
  if (!loc) return null;
  const flagship = FLAGSHIP_DESTINATIONS.find((f) => f.id === loc.flagshipId);
  return `${flagship?.displayName ?? 'Studio World™'} · ${loc.displayName}`;
}
