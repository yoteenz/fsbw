/**
 * Studio World Experience Engine™ — central authority for global interaction philosophy.
 * Owns Progressive Presence™, navigation behavior, information hierarchy, and reveal sequencing.
 */

import {
  createPresenceState,
  expandPresenceElement,
  collapsePresenceElement,
  dismissPresenceElement,
  revealPresenceLevel,
  resolvePresenceVisibility,
  type PresenceEngineState,
  type PresenceIntent,
  type PresenceLevel,
} from '../progressive-presence';
import type { ExperienceProfile } from './types';
import { EXPERIENCE_TOKENS } from './experience-tokens';

export type PresenceController = {
  state: PresenceEngineState;
  isVisible: (elementId: string, options?: { forceIntent?: PresenceIntent; ambientVisibleCount?: number }) => boolean;
  expand: (elementId: string, level?: PresenceLevel) => void;
  collapse: (elementId: string) => void;
  dismiss: (elementId: string) => void;
  toggle: (elementId: string, level?: PresenceLevel) => void;
  revealLevel: (level: PresenceLevel) => void;
};

export type StudioWorldExperienceEngine = {
  profile: ExperienceProfile;
  tokens: typeof EXPERIENCE_TOKENS;
  presence: PresenceController;
  overlaysEarned: boolean;
  defaultPresenceLevel: PresenceLevel;
};

export function createPresenceController(
  initialState: PresenceEngineState,
  onChange: (next: PresenceEngineState) => void
): PresenceController {
  return {
    state: initialState,
    isVisible: (elementId, options) =>
      resolvePresenceVisibility(elementId, initialState, options).visible,
    expand: (elementId, level) => onChange(expandPresenceElement(initialState, elementId, level)),
    collapse: (elementId) => onChange(collapsePresenceElement(initialState, elementId)),
    dismiss: (elementId) => onChange(dismissPresenceElement(initialState, elementId)),
    toggle: (elementId, level) =>
      onChange(
        initialState.expandedElements.has(elementId)
          ? collapsePresenceElement(initialState, elementId)
          : expandPresenceElement(initialState, elementId, level)
      ),
    revealLevel: (level) => onChange(revealPresenceLevel(initialState, level)),
  };
}

/** Factory used by React provider — presence controller updated via state setter in hook layer */
export function computeOverlaysEarned(state: PresenceEngineState): boolean {
  return state.expandedElements.has('world-health-expanded') || state.revealedLevel >= 3;
}

export function createStudioWorldExperienceEngine(
  profile: ExperienceProfile,
  presenceState: PresenceEngineState,
  setPresenceState: (next: PresenceEngineState) => void
): StudioWorldExperienceEngine {
  const controller: PresenceController = {
    get state() {
      return presenceState;
    },
    isVisible: (elementId, options) =>
      resolvePresenceVisibility(elementId, presenceState, options).visible,
    expand: (elementId, level) => setPresenceState(expandPresenceElement(presenceState, elementId, level)),
    collapse: (elementId) => setPresenceState(collapsePresenceElement(presenceState, elementId)),
    dismiss: (elementId) => setPresenceState(dismissPresenceElement(presenceState, elementId)),
    toggle: (elementId, level) =>
      setPresenceState(
        presenceState.expandedElements.has(elementId)
          ? collapsePresenceElement(presenceState, elementId)
          : expandPresenceElement(presenceState, elementId, level)
      ),
    revealLevel: (level) => setPresenceState(revealPresenceLevel(presenceState, level)),
  };

  return {
    profile,
    tokens: EXPERIENCE_TOKENS,
    presence: controller,
    overlaysEarned: computeOverlaysEarned(presenceState),
    defaultPresenceLevel: profile.defaultPresenceLevel,
  };
}

export function createInitialPresenceState(profile: ExperienceProfile): PresenceEngineState {
  const state = createPresenceState();
  return revealPresenceLevel(state, profile.defaultPresenceLevel);
}
