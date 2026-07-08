/**
 * Progressive Presence™ — Article K18 information hierarchy model.
 * ERA 2 — WORLD™ · Constitutional Law Layer 3
 */

/** Presence Level™ — 0 Architecture through 4 Architect */
export type PresenceLevel = 0 | 1 | 2 | 3 | 4;

export type PresenceIntent =
  | 'ambient'
  | 'tap'
  | 'explore'
  | 'architect';

export type PresenceMedium =
  | 'architecture'
  | 'rail'
  | 'tray'
  | 'hud'
  | 'overlay'
  | 'orb'
  | 'plaque'
  | 'hologram'
  | 'engraving'
  | 'projection'
  | 'audio';

export type VisualWeight = 'none' | 'subtle' | 'normal' | 'emphasis';
export type AnimationWeight = 'none' | 'subtle' | 'normal';
export type DismissBehavior = 'persistent' | 'auto-collapse' | 'manual-collapse' | 'session';

export type UIElementPresence = {
  id: string;
  label: string;
  presenceLevel: PresenceLevel;
  priority: number;
  context?: string;
  requiredIntent: PresenceIntent;
  visualWeight: VisualWeight;
  animationWeight: AnimationWeight;
  dismissBehavior: DismissBehavior;
  medium?: PresenceMedium;
  /** Max simultaneous ambient slots in this room (Level 1 cap = 3) */
  countsTowardAmbientCap?: boolean;
};

export type PresenceRoomFocus = {
  roomId: string;
  primaryQuestion: string;
  narrativeElementId: string;
};

export type PresenceEngineState = {
  /** Highest presence level the founder has unlocked this session */
  revealedLevel: PresenceLevel;
  /** Element ids intentionally expanded (tap / explore) */
  expandedElements: ReadonlySet<string>;
  /** Element ids dismissed for session */
  dismissedElements: ReadonlySet<string>;
};

export type PresenceVisibilityResult = {
  visible: boolean;
  presenceLevel: PresenceLevel;
  reason: string;
};
