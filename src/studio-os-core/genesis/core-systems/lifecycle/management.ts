import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { SystemLifecycleTransition } from '../types';
import type { SystemLifecycleState } from '../constants';
import { getCoreSystem } from '../registry/system-registry';

function now(): string {
  return new Date().toISOString();
}

export function createTransitionId(systemId: string): string {
  return `LFC-${systemId}-${Date.now().toString(36)}`;
}

const VALID_TRANSITIONS: Record<SystemLifecycleState, SystemLifecycleState[]> = {
  draft: ['proposed', 'archived'],
  proposed: ['active', 'draft', 'archived'],
  active: ['deprecated', 'suspended', 'archived'],
  deprecated: ['active', 'archived'],
  suspended: ['active', 'archived'],
  archived: [],
};

export type TransitionLifecycleInput = {
  systemId: string;
  toState: SystemLifecycleState;
  reason: string;
  actorObjectId?: string;
};

/** Lifecycle Management™ */
export function transitionSystemLifecycle(input: TransitionLifecycleInput): SystemLifecycleTransition {
  const system = getCoreSystem(input.systemId);
  if (!system) {
    throw new Error(`System not found: ${input.systemId}`);
  }

  const allowed = VALID_TRANSITIONS[system.lifecycleState];
  if (!allowed.includes(input.toState)) {
    throw new Error(
      `Invalid lifecycle transition: ${system.lifecycleState} → ${input.toState}`
    );
  }

  const transition: SystemLifecycleTransition = {
    transitionId: createTransitionId(input.systemId),
    systemId: input.systemId,
    fromState: system.lifecycleState,
    toState: input.toState,
    reason: input.reason.trim(),
    actorObjectId: input.actorObjectId,
    transitionedAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    systems: store.systems.map((s) =>
      s.systemId === input.systemId
        ? { ...s, lifecycleState: input.toState, updatedAt: transition.transitionedAt }
        : s
    ),
    lifecycleHistory: [...store.lifecycleHistory, transition],
  }));

  return transition;
}

export function listLifecycleHistory(systemId?: string): SystemLifecycleTransition[] {
  const history = readCoreSystemsStore().lifecycleHistory;
  if (!systemId) return history;
  return history.filter((t) => t.systemId === systemId);
}

export function getCurrentLifecycleState(systemId: string): SystemLifecycleState | undefined {
  return getCoreSystem(systemId)?.lifecycleState;
}

export function listAllowedLifecycleTransitions(
  systemId: string
): SystemLifecycleState[] {
  const system = getCoreSystem(systemId);
  if (!system) return [];
  return VALID_TRANSITIONS[system.lifecycleState];
}

export function getCoreSystemLifecycleSummary(): {
  state: SystemLifecycleState;
  count: number;
}[] {
  const states: SystemLifecycleState[] = [
    'draft',
    'proposed',
    'active',
    'deprecated',
    'archived',
    'suspended',
  ];
  const systems = readCoreSystemsStore().systems;
  return states.map((state) => ({
    state,
    count: systems.filter((s) => s.lifecycleState === state).length,
  }));
}
