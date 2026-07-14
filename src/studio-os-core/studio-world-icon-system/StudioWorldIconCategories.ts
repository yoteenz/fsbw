/** Studio World Icon System — canonical category IDs. */
export const STUDIO_WORLD_ICON_CATEGORY_IDS = [
  'navigation',
  'workspace',
  'ai',
  'production',
  'review',
  'assets',
  'marketplace',
  'collaboration',
  'devices',
  'system',
  'analytics',
  'automation',
  'cloud',
  'security',
  'media',
  'brand',
  'studio-world-exclusive',
  'future',
] as const;

export type StudioWorldIconCategoryId = (typeof STUDIO_WORLD_ICON_CATEGORY_IDS)[number];

export type StudioWorldIconCategory = {
  id: StudioWorldIconCategoryId;
  title: string;
  description: string;
  colorToken: string;
  priority: number;
  iconCount: number;
  futureCount: number;
  tags: string[];
};

export const STUDIO_WORLD_ICON_CATEGORIES: StudioWorldIconCategory[] = [
  { id: 'navigation', title: 'Navigation', description: 'Wayfinding, menus, breadcrumbs, spatial anchors', colorToken: '--sw-icon-cat-navigation', priority: 100, iconCount: 0, futureCount: 0, tags: ['nav', 'dock', 'hud'] },
  { id: 'workspace', title: 'Workspace', description: 'Departments, environments, workbench tools', colorToken: '--sw-icon-cat-workspace', priority: 95, iconCount: 0, futureCount: 0, tags: ['department', 'workbench'] },
  { id: 'ai', title: 'AI', description: 'Genesis, generation, model orchestration', colorToken: '--sw-icon-cat-ai', priority: 90, iconCount: 0, futureCount: 0, tags: ['genesis', 'generation'] },
  { id: 'production', title: 'Production', description: 'Pipeline, jobs, outputs, manufacturing', colorToken: '--sw-icon-cat-production', priority: 88, iconCount: 0, futureCount: 0, tags: ['pipeline', 'work-order'] },
  { id: 'review', title: 'Review', description: 'Founder review, approval, revision', colorToken: '--sw-icon-cat-review', priority: 85, iconCount: 0, futureCount: 0, tags: ['approval', 'founder'] },
  { id: 'assets', title: 'Assets', description: 'Blueprints, materials, manifests, references', colorToken: '--sw-icon-cat-assets', priority: 82, iconCount: 0, futureCount: 0, tags: ['blueprint', 'material'] },
  { id: 'marketplace', title: 'Marketplace', description: 'Listings, commerce, distribution', colorToken: '--sw-icon-cat-marketplace', priority: 80, iconCount: 0, futureCount: 0, tags: ['commerce'] },
  { id: 'collaboration', title: 'Collaboration', description: 'Teams, comments, sharing', colorToken: '--sw-icon-cat-collaboration', priority: 78, iconCount: 0, futureCount: 0, tags: ['team', 'share'] },
  { id: 'devices', title: 'Devices', description: 'Desktop, mobile, tablet, TV outputs', colorToken: '--sw-icon-cat-devices', priority: 75, iconCount: 0, futureCount: 0, tags: ['responsive'] },
  { id: 'system', title: 'System', description: 'Settings, diagnostics, terminal', colorToken: '--sw-icon-cat-system', priority: 72, iconCount: 0, futureCount: 0, tags: ['settings', 'diagnostics'] },
  { id: 'analytics', title: 'Analytics', description: 'Metrics, performance, dashboards', colorToken: '--sw-icon-cat-analytics', priority: 70, iconCount: 0, futureCount: 0, tags: ['metrics'] },
  { id: 'automation', title: 'Automation', description: 'Scheduler, workers, orchestration', colorToken: '--sw-icon-cat-automation', priority: 68, iconCount: 0, futureCount: 0, tags: ['scheduler'] },
  { id: 'cloud', title: 'Cloud', description: 'Sync, CDN, remote assets', colorToken: '--sw-icon-cat-cloud', priority: 65, iconCount: 0, futureCount: 0, tags: ['sync', 'cdn'] },
  { id: 'security', title: 'Security', description: 'Permissions, locks, governance', colorToken: '--sw-icon-cat-security', priority: 63, iconCount: 0, futureCount: 0, tags: ['permissions'] },
  { id: 'media', title: 'Media', description: 'Playback, capture, fullscreen', colorToken: '--sw-icon-cat-media', priority: 60, iconCount: 0, futureCount: 0, tags: ['playback'] },
  { id: 'brand', title: 'Brand', description: 'Frontal Slayer, Studio identity', colorToken: '--sw-icon-cat-brand', priority: 58, iconCount: 0, futureCount: 0, tags: ['identity'] },
  { id: 'studio-world-exclusive', title: 'Studio World Exclusive', description: 'Canonical Studio World-only symbols', colorToken: '--sw-icon-cat-exclusive', priority: 55, iconCount: 0, futureCount: 0, tags: ['canonical'] },
  { id: 'future', title: 'Future', description: 'Reserved slots for upcoming symbol families', colorToken: '--sw-icon-cat-future', priority: 10, iconCount: 0, futureCount: 0, tags: ['reserved'] },
];

export function getStudioWorldIconCategory(id: StudioWorldIconCategoryId): StudioWorldIconCategory | undefined {
  return STUDIO_WORLD_ICON_CATEGORIES.find((c) => c.id === id);
}
