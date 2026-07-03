/** Distribution targets — per content pack channel routing (Phase 2 ready). */

export type AdminStudioDistributionTargetId =
  | 'mobile-website'
  | 'lounge-tv'
  | 'email'
  | 'social-media'
  | 'desktop-mansion'
  | 'mobile-app';

export type AdminStudioDistributionActivation = 'ACTIVE' | 'COMING_SOON';

export type AdminStudioDistributionTarget = {
  id: AdminStudioDistributionTargetId;
  label: string;
  activation: AdminStudioDistributionActivation;
  /** Toggle for ACTIVE targets; always false for COMING_SOON until Phase 2. */
  enabled: boolean;
  plannedNote?: string;
};

export const ADMIN_STUDIO_DISTRIBUTION_TARGET_DEFINITIONS: Array<{
  id: AdminStudioDistributionTargetId;
  label: string;
  activation: AdminStudioDistributionActivation;
  defaultEnabled: boolean;
  plannedNote?: string;
}> = [
  { id: 'mobile-website', label: 'MOBILE WEBSITE', activation: 'ACTIVE', defaultEnabled: true },
  { id: 'lounge-tv', label: 'LOUNGE TV', activation: 'ACTIVE', defaultEnabled: true },
  { id: 'email', label: 'EMAIL', activation: 'ACTIVE', defaultEnabled: true },
  { id: 'social-media', label: 'SOCIAL MEDIA', activation: 'ACTIVE', defaultEnabled: true },
  {
    id: 'desktop-mansion',
    label: 'DESKTOP MANSION',
    activation: 'COMING_SOON',
    defaultEnabled: false,
    plannedNote: 'PHASE 2 — DESKTOP PENTHOUSE LOUNGE SYNC',
  },
  {
    id: 'mobile-app',
    label: 'MOBILE APP',
    activation: 'COMING_SOON',
    defaultEnabled: false,
    plannedNote: 'PHASE 2 — NATIVE APP PUSH + OFFLINE LIBRARY',
  },
];

export function createDefaultDistributionTargets(): AdminStudioDistributionTarget[] {
  return ADMIN_STUDIO_DISTRIBUTION_TARGET_DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.label,
    activation: def.activation,
    enabled: def.defaultEnabled,
    plannedNote: def.plannedNote,
  }));
}

export function mergeDistributionTargets(
  defaults: AdminStudioDistributionTarget[],
  patch?: AdminStudioDistributionTarget[]
): AdminStudioDistributionTarget[] {
  if (!patch) return defaults.map((t) => ({ ...t }));
  return defaults.map((base) => {
    const override = patch.find((p) => p.id === base.id);
    return override ? { ...base, ...override } : { ...base };
  });
}
