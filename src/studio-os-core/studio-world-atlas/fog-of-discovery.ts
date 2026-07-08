import type { StudioWorldMigrationStatus } from '../studio-world/types';
import type { StudioWorldFlagshipId } from '../studio-world/types';

/** Fog of Discovery™ — only unlocked destinations appear on the living map */
export function resolveFogForNode(
  flagshipId: StudioWorldFlagshipId | undefined,
  migrationStatus: StudioWorldMigrationStatus | undefined,
  discoveredIds: Set<string>
): boolean {
  if (!flagshipId) return false;
  if (discoveredIds.has(flagshipId)) return true;
  if (migrationStatus === 'immersive-live' || migrationStatus === 'immersive-partial') return true;
  if (flagshipId === 'studio-command-center' || flagshipId === 'creative-direction-studio') return true;
  if (flagshipId === 'studio-warehouse' || flagshipId === 'studio-archives') return true;
  if (flagshipId === 'marketplace' || flagshipId === 'headquarters' || flagshipId === 'expedition-hub') return true;
  return migrationStatus !== 'coming-soon';
}

export function fogOpacity(unlocked: boolean, fogged: boolean): number {
  if (!unlocked || fogged) return 0.35;
  return 1;
}
