import type { StudioWorldMigrationStatus } from '../studio-world/types';
import type { AtlasActivityLevel } from './types';

export function resolveNodeActivity(status?: StudioWorldMigrationStatus): AtlasActivityLevel {
  if (status === 'immersive-live') return 'generating';
  if (status === 'immersive-partial') return 'pulse';
  if (status === 'standard-room') return 'idle';
  return 'dormant';
}

export function activityGlowClass(activity: AtlasActivityLevel): string {
  switch (activity) {
    case 'generating':
      return 'is-generating';
    case 'pulse':
      return 'is-pulse';
    case 'active':
      return 'is-active';
    case 'idle':
      return 'is-idle';
    default:
      return 'is-dormant';
  }
}
