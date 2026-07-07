/** Milestone 127 — System Registry™ V1.0 */

export const SYSTEM_REGISTRY_STORAGE_KEY = 'studioOsSystemRegistry_v1';
export const SYSTEM_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_SYSTEM_REGISTRY_UPDATED = 'studio-os-system-registry-updated';

export const SYSTEM_REGISTRY_ACCENT = '#0369A1';

export const SYSTEM_REGISTRY_PHILOSOPHY = [
  'Nothing inside Studio OS should exist anonymously — everything registers itself.',
  'The System Registry™ is the master index of the operating system.',
  'Studio OS always knows exactly what exists, where it exists, how it connects, and what depends upon it.',
  'One master directory. Infinite discoverability.',
] as const;

/** Every object type that can register in the master directory */
export const SYSTEM_REGISTRY_CATEGORIES = [
  'organization',
  'department',
  'module',
  'feature',
  'page',
  'route',
  'panel',
  'card',
  'component',
  'animation',
  'service',
  'api',
  'automation',
  'concierge',
  'headquarters',
  'knowledge-product',
  'marketplace-asset',
  'sdk-plugin',
  'event',
  'policy',
  'permission',
  'workflow',
  'prompt-template',
  'asset',
] as const;

/** Surfaces that consume the System Registry™ */
export const SYSTEM_DISCOVERY_SURFACES = [
  'search',
  'documentation',
  'architecture',
  'developers',
  'command-dock',
  'dependencies',
  'studio-intelligence',
  'future-milestones',
] as const;

export const SYSTEM_LIFECYCLE_STATUSES = ['live', 'demo', 'in-progress', 'planned', 'deprecated', 'upcoming'] as const;
