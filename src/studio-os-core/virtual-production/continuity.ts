/**
 * Continuity state — first-class production data between shots.
 */

import type { ContinuityState, VirtualProductionShot } from './types';

export function buildInheritedStartState(
  previousShotEndState: ContinuityState | undefined,
  overrides?: ContinuityState
): ContinuityState {
  if (!previousShotEndState) return overrides ?? {};
  return {
    ...previousShotEndState,
    ...overrides,
  };
}

export function linkShotContinuity(
  shot: VirtualProductionShot,
  inheritsFromShotId: string | undefined,
  previousEndState: ContinuityState | undefined,
  startOverrides?: ContinuityState
): {
  shotId: string;
  inheritsFromShotId?: string;
  startState: ContinuityState;
  endState: ContinuityState;
} {
  return {
    shotId: shot.id,
    inheritsFromShotId,
    startState: buildInheritedStartState(previousEndState, startOverrides),
    endState: {},
  };
}

export function mergeEndIntoNextStart(
  shots: Array<{ shotId: string; endState: ContinuityState }>
): Map<string, ContinuityState> {
  const chain = new Map<string, ContinuityState>();
  for (let i = 1; i < shots.length; i++) {
    chain.set(shots[i].shotId, shots[i - 1].endState);
  }
  return chain;
}
