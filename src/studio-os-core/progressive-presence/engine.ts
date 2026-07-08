import { MAX_AMBIENT_ELEMENTS } from './law';
import { getUIElementPresence } from './registry';
import type {
  PresenceEngineState,
  PresenceIntent,
  PresenceLevel,
  PresenceVisibilityResult,
  UIElementPresence,
} from './types';

export function createPresenceState(): PresenceEngineState {
  return {
    revealedLevel: 1,
    expandedElements: new Set(),
    dismissedElements: new Set(),
  };
}

function intentSatisfied(
  element: UIElementPresence,
  state: PresenceEngineState,
  forceIntent?: PresenceIntent
): boolean {
  if (state.dismissedElements.has(element.id)) return false;

  const intent = forceIntent ?? element.requiredIntent;

  switch (intent) {
    case 'ambient':
      return true;
    case 'tap':
      return state.expandedElements.has(element.id) || state.revealedLevel >= 2;
    case 'explore':
      return state.expandedElements.has(element.id) || state.revealedLevel >= 3;
    case 'architect':
      return state.expandedElements.has(element.id) || state.revealedLevel >= 4;
    default:
      return false;
  }
}

/** Progressive Presence Engine™ — central visibility authority */
export function resolvePresenceVisibility(
  elementId: string,
  state: PresenceEngineState,
  options?: {
    forceIntent?: PresenceIntent;
    ambientVisibleCount?: number;
  }
): PresenceVisibilityResult {
  const element = getUIElementPresence(elementId);
  if (!element) {
    return { visible: true, presenceLevel: 1, reason: 'unregistered-default-visible' };
  }

  if (state.dismissedElements.has(element.id)) {
    return { visible: false, presenceLevel: element.presenceLevel, reason: 'dismissed' };
  }

  if (element.presenceLevel > state.revealedLevel && !state.expandedElements.has(element.id)) {
    return { visible: false, presenceLevel: element.presenceLevel, reason: 'level-locked' };
  }

  if (!intentSatisfied(element, state, options?.forceIntent)) {
    return { visible: false, presenceLevel: element.presenceLevel, reason: 'intent-required' };
  }

  if (
    element.presenceLevel === 1 &&
    element.countsTowardAmbientCap &&
    options?.ambientVisibleCount !== undefined &&
    options.ambientVisibleCount >= MAX_AMBIENT_ELEMENTS &&
    !state.expandedElements.has(element.id)
  ) {
    return { visible: false, presenceLevel: element.presenceLevel, reason: 'ambient-cap' };
  }

  return { visible: true, presenceLevel: element.presenceLevel, reason: 'earned' };
}

export function expandPresenceElement(
  state: PresenceEngineState,
  elementId: string,
  level?: PresenceLevel
): PresenceEngineState {
  const element = getUIElementPresence(elementId);
  const expanded = new Set(state.expandedElements);
  expanded.add(elementId);
  const revealedLevel = Math.max(
    state.revealedLevel,
    level ?? element?.presenceLevel ?? 2
  ) as PresenceLevel;
  const dismissed = new Set(state.dismissedElements);
  dismissed.delete(elementId);
  return { revealedLevel, expandedElements: expanded, dismissedElements: dismissed };
}

export function collapsePresenceElement(
  state: PresenceEngineState,
  elementId: string
): PresenceEngineState {
  const expanded = new Set(state.expandedElements);
  expanded.delete(elementId);
  return { ...state, expandedElements: expanded };
}

export function dismissPresenceElement(
  state: PresenceEngineState,
  elementId: string
): PresenceEngineState {
  const dismissed = new Set(state.dismissedElements);
  dismissed.add(elementId);
  const expanded = new Set(state.expandedElements);
  expanded.delete(elementId);
  return { ...state, expandedElements: expanded, dismissedElements: dismissed };
}

export function revealPresenceLevel(
  state: PresenceEngineState,
  level: PresenceLevel
): PresenceEngineState {
  return { ...state, revealedLevel: Math.max(state.revealedLevel, level) as PresenceLevel };
}

export function countVisibleAmbient(
  state: PresenceEngineState,
  elementIds: string[]
): number {
  let count = 0;
  for (const id of elementIds) {
    const result = resolvePresenceVisibility(id, state, { ambientVisibleCount: count });
    if (result.visible) count += 1;
  }
  return count;
}
