/** Milestone 137 — Plugin SDK™ V1.0 */

export const PLUGIN_SDK_STORAGE_KEY = 'studioOsPluginSdk_v1';
export const PLUGIN_SDK_VERSION = '1.0.0';
export const STUDIO_OS_PLUGIN_SDK_UPDATED = 'studio-os-plugin-sdk-updated';

export const PLUGIN_SDK_ACCENT = '#7C3AED';

export const PLUGIN_SDK_PHILOSOPHY = [
  'Studio OS should not attempt to build every feature — it should become a platform others can extend.',
  'Every plugin becomes a first-class Studio OS citizen with full registration capabilities.',
  'Plugins execute inside isolated sandboxes — Policy Engine™ and Permission Engine™ always enforced.',
  'Future innovation comes not only from Studio, but from the ecosystem built around it.',
] as const;

export const PLUGIN_TYPES = [
  'organization-modules',
  'department-packs',
  'profession-packs',
  'marketplace-extensions',
  'dashboard-widgets',
  'command-dock-skills',
  'automation-actions',
  'workflow-nodes',
  'integrations',
  'reports',
  'analytics',
  'custom-pages',
  'custom-panels',
  'custom-commands',
  'ai-tools',
  'developer-utilities',
  'future-plugins',
] as const;

export const SDK_REGISTRATION_CAPABILITIES = [
  'register-pages',
  'register-components',
  'register-commands',
  'register-automations',
  'register-events',
  'register-permissions',
  'register-policies',
  'register-assets',
  'register-documentation',
  'register-academy-lessons',
  'register-search-entries',
  'register-tooltips',
] as const;

export const MARKETPLACE_TIERS = [
  'verified-plugins',
  'official-plugins',
  'community-plugins',
  'paid-plugins',
  'free-plugins',
  'internal-organization-plugins',
] as const;

export const SANDBOX_VIOLATIONS = [
  'unauthorized-organization-access',
  'protected-system-modification',
  'private-data-read',
  'permission-bypass',
  'policy-violation',
] as const;
