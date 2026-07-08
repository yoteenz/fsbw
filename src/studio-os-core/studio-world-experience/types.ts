/**
 * Studio World Global Experience System™ — Experience Profile metadata.
 * Departments declare WHAT they contain; the Experience Engine decides HOW it is experienced.
 */

import type { PresenceLevel } from '../progressive-presence';

export type ExperienceOrbMode =
  | 'creative'
  | 'archival'
  | 'executive'
  | 'museum'
  | 'marketplace'
  | 'knowledge'
  | 'navigation'
  | 'civilization'
  | 'neutral';

export type ExperienceProfile = {
  /** Canonical department / destination id */
  departmentId: string;
  displayName: string;
  /** Primary Story™ — one narrative sentence */
  primaryStory: string;
  /** One Primary Focus™ question */
  primaryQuestion: string;
  primaryOrbMode: ExperienceOrbMode;
  defaultPresenceLevel: PresenceLevel;
  ambientInformation: string[];
  contextModules: string[];
  deepSystems: string[];
  /** Scene tray zone ids or labels — workspace-local navigation */
  sceneModules?: string[];
  narrativeElementId?: string;
};

export type StudioWorldExperienceRuntime = {
  profile: ExperienceProfile;
  overlaysEarned: boolean;
};
