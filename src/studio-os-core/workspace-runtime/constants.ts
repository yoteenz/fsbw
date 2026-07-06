/** Milestone 136 — Workspace Runtime™ V1.0 */

export const WORKSPACE_RUNTIME_STORAGE_KEY = 'studioOsWorkspaceRuntime_v1';
export const WORKSPACE_RUNTIME_VERSION = '1.0.0';
export const STUDIO_OS_WORKSPACE_RUNTIME_UPDATED = 'studio-os-workspace-runtime-updated';

export const WORKSPACE_RUNTIME_ACCENT = '#1E40AF';

export const WORKSPACE_RUNTIME_PHILOSOPHY = [
  'Organizations should never interfere with one another — every org owns its own digital headquarters.',
  'Studio OS provides the platform. Workspace Runtime™ provides the organization.',
  'Nothing leaks between organizations unless explicitly authorized.',
  'Organizations share the platform. Never the runtime.',
] as const;

export const RUNTIME_COMPONENTS = [
  'headquarters',
  'departments',
  'digital-concierges',
  'profession-brain',
  'organization-genome',
  'knowledge-fabric',
  'memory-engine',
  'command-dock',
  'executive-council',
  'policies',
  'permissions',
  'automation',
  'assets',
  'marketplace',
  'studio-institute',
  'legacy-vault',
  'organization-timeline',
  'organization-pulse',
] as const;

export const SANDBOX_ENVIRONMENTS = ['production', 'development', 'testing', 'preview', 'training'] as const;

export const RUNTIME_CONFIG_CATEGORIES = [
  'installed-modules',
  'department-packs',
  'profession-packs',
  'industry-packs',
  'brand-identity',
  'themes',
  'custom-policies',
  'organization-preferences',
  'feature-flags',
  'regional-settings',
  'ai-provider-preferences',
] as const;

export const HEALTH_METRIC_IDS = [
  'performance',
  'memory-usage',
  'automation-load',
  'ai-requests',
  'storage',
  'knowledge-growth',
  'errors',
  'security-events',
  'integration-health',
] as const;
