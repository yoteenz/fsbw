/**
 * Contextual Orb™ — department context registry types.
 * Departments register Hero Objects here; Orb UI stays presentation-only.
 */

export type OrbSurfaceActionId =
  | 'world-atlas'
  | 'command-dock'
  | 'page-guide'
  | 'voice'
  | 'daily-brief'
  | 'life-culture'
  | 'executive-workspace';

export type OrbContextAction = {
  id: string;
  label: string;
  surface: OrbSurfaceActionId;
  /** Lower rank = higher priority when merging into the five-slot toolbelt. */
  relevanceRank: number;
  /** Optional Hero Object id whose sculpture represents this surface action. */
  heroObjectId?: string;
};

export type OrbContextDefinition = {
  contextId: string;
  contextLabel: string;
  /** Up to five Hero Objects shown in the Orb radial by default. */
  primaryHeroObjectIds: string[];
  /** Reserve pool for relevance ranking and future expansion. */
  secondaryHeroObjectIds: string[];
  /** Surface opens available in this department (Command Dock, Voice, etc.). */
  contextActions: OrbContextAction[];
  /** Route/path patterns that resolve to this context (longest match wins). */
  pathPatterns: string[];
  /** Flagship ids from Studio World route registry. */
  flagshipIds?: string[];
};

export type OrbContextTransitionPhase = 'idle' | 'dissolving' | 'materializing';

export type OrbDisplaySlot =
  | {
      kind: 'hero-object';
      heroObjectId: string;
    }
  | {
      kind: 'context-action';
      action: OrbContextAction;
    };

export type ResolvedOrbToolbelt = {
  contextId: string;
  contextLabel: string;
  slots: OrbDisplaySlot[];
  rationale: string;
};
