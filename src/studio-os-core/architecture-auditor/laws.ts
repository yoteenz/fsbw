/**
 * Studio World™ architectural laws — enforced by Architecture Auditor™.
 */

export const STUDIO_WORLD_ARCHITECTURAL_LAWS = [
  'Nothing inside Studio World™ is a webpage.',
  'Every destination is a physical place in one connected campus.',
  'The founder walks — they do not click menus to open pages.',
  'Every room is assembled via Scene Stack™ — never hardcoded as a single image.',
  'Software features become architecture — never dashboards, cards, or admin panels.',
  'Asset Registry™ is searched before any generation.',
  'Maximum reuse — shared assets across rooms.',
  'One world — consistent lighting, materials, motion, camera, typography, Orb behavior.',
] as const;

/** Forbidden webpage / SaaS patterns — immediate violation when detected */
export const FORBIDDEN_WEBPAGE_PATTERNS = [
  'dashboard cards',
  'statistic grids',
  'analytics grids',
  'page sections',
  'scroll-heavy layouts',
  'admin panels',
  'settings pages',
  'report pages',
  'table-based layouts',
  'widget collections',
  'traditional saas ui',
  'adminstudiostageshell',
  'module card grid',
  'kpi metric grid',
  'breadcrumb navigation to new page',
] as const;

/** Scene Stack™ layers the Auditor expects (mapped to SceneStackLayerId in scene-stack-auditor) */
export const AUDITOR_SCENE_STACK_LAYERS = [
  { auditorId: 'environment', label: 'Environment™', layerIds: ['environment-shell'] },
  { auditorId: 'architecture', label: 'Architecture™', layerIds: ['signature-landmark'] },
  { auditorId: 'lighting', label: 'Lighting™', layerIds: ['lighting-systems'] },
  { auditorId: 'furniture', label: 'Furniture™', layerIds: ['furniture-objects'] },
  { auditorId: 'materials', label: 'Materials™', layerIds: ['surface-materials'] },
  { auditorId: 'atmosphere', label: 'Atmosphere™', layerIds: ['atmospheric-systems', 'ambient-motion'] },
  { auditorId: 'hero-objects', label: 'Hero Objects™', layerIds: ['signature-landmark', 'furniture-objects'] },
  { auditorId: 'interaction', label: 'Interaction™', layerIds: ['interaction'] },
  { auditorId: 'runtime', label: 'Runtime™', layerIds: ['runtime-effects', 'founder-personalization'] },
] as const;

export const IMMERSIVE_SHELL_MARKERS = [
  'DepartmentGoldenBuildShell',
  'SceneStackViewport',
  'scc-world',
  'wh-world',
  'cds-stack-active',
] as const;

export const WEBPAGE_SHELL_MARKERS = [
  'AdminStudioStageShell',
  'AdminStudioModuleCard',
  'ExecutiveDepartmentCard',
  'AdminStudioLayout',
] as const;
