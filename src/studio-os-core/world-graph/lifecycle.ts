import { LIFECYCLE_ORDER } from './constants';
import type { WorldLifecycleStage, WorldPlane } from './types';

export function lifecyclePlane(stage: WorldLifecycleStage): WorldPlane {
  if (stage === 'historical' || stage === 'legacy' || stage === 'deprecated') return 'historical';
  if (stage === 'live' || stage === 'versioned' || stage === 'implemented' || stage === 'approved') {
    return 'canon';
  }
  return 'working';
}

export function canPromoteLifecycle(from: WorldLifecycleStage, to: WorldLifecycleStage): boolean {
  return LIFECYCLE_ORDER[to] > LIFECYCLE_ORDER[from];
}

export function isTerminalLifecycle(stage: WorldLifecycleStage): boolean {
  return stage === 'legacy';
}

export function formatLifecycleLabel(stage: WorldLifecycleStage): string {
  return stage
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
