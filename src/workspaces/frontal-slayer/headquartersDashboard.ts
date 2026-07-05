/** Frontal Slayer admin — Headquarters dashboard card (organization layer, not Studio OS). */

export const HEADQUARTERS_DASHBOARD_METRIC = 14;

export const HEADQUARTERS_DASHBOARD_ITEMS = [
  { label: 'MISSION CONTROL', value: 'Executive HQ', color: 'text-red-500' as const },
  { label: 'PRODUCTION', value: 'Studio', color: 'text-gray-500' as const },
  { label: 'PUBLISHING', value: 'Queue', color: 'text-gray-500' as const },
  { label: 'EXECUTIVES', value: 'Council', color: 'text-gray-500' as const },
  { label: 'CAMPAIGNS', value: 'Engine', color: 'text-gray-500' as const },
  { label: 'KNOWLEDGE', value: 'Hub', color: 'text-gray-500' as const },
];

export const HEADQUARTERS_DASHBOARD_FOOTER = 'HEADQUARTERS · STUDIO OS · FRONTAL SLAYER';

/** Studio Administration dashboard card — portfolio owners only. */
export const STUDIO_ADMIN_DASHBOARD_METRIC = 4;

export const STUDIO_ADMIN_DASHBOARD_ITEMS = [
  { label: 'ORGANIZATIONS', value: 'Registry', color: 'text-red-500' as const },
  { label: 'ONBOARDING', value: 'Wizard', color: 'text-gray-500' as const },
  { label: 'TEMPLATES', value: 'Blueprints', color: 'text-gray-500' as const },
  { label: 'PORTFOLIO', value: 'Intel', color: 'text-gray-500' as const },
  { label: 'LICENSING', value: 'Ready', color: 'text-gray-500' as const },
  { label: 'PLUGINS', value: 'Ready', color: 'text-gray-500' as const },
];

export const STUDIO_ADMIN_DASHBOARD_FOOTER = 'STUDIO OS · PORTFOLIO CONTROL PLANE';
