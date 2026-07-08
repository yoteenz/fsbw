/** Studio World navigation philosophy — inherited by every destination */

export const NAVIGATION_PHILOSOPHY = {
  railRole: 'Architectural destinations only — Atlas™, districts, wings, quick travel.',
  trayRole: 'Scene and workspace navigation only — local interactions within current destination.',
  railNeverContains: ['dashboards', 'metrics', 'World Health bars', 'operational panels', 'scene tabs'],
  trayNeverContains: ['global systems', 'department destinations', 'Atlas destinations'],
} as const;

export const ORB_PHILOSOPHY = {
  role: 'Intelligence layer — surfaces contextual insight instead of persistent widgets.',
  replaces: ['persistent dashboards', 'competing metric panels', 'always-on civilization feeds'],
  surfaces: ['civilization events', 'milestones', 'marketplace signals', 'creative queue alerts'],
} as const;

export const ATLAS_PHILOSOPHY = {
  role: 'Universal transportation — where am I in the civilization, where can I travel.',
  neverContains: ['operational dashboards', 'scene workspaces'],
} as const;
