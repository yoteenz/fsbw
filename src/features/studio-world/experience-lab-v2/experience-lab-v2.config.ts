import type { ExperienceLabV2EnvironmentConfig } from './experience-lab-v2.types';
import experienceLabV2ViewportEnvironmentUrl from '../../../assets/studio-world/experience-lab/experience-lab-v2-viewport-environment.png';

/** Canonical Experience Lab environment — decorative only, no baked UI. */
export const DEFAULT_V2_ENVIRONMENT: ExperienceLabV2EnvironmentConfig = {
  desktopEnvironmentUrl: experienceLabV2ViewportEnvironmentUrl,
  mobileEnvironmentUrl: experienceLabV2ViewportEnvironmentUrl,
  environmentOpacity: 1,
  environmentPosition: 'center center',
  environmentScale: 1,
  centerSafeZone: 'clamp(280px, 42vw, 720px)',
  sideSafeZones: 'clamp(48px, 8vw, 120px)',
  topSafeZone: 'clamp(72px, 12vh, 140px)',
  bottomSafeZone: 'clamp(96px, 18vh, 200px)',
  scrimStrength: 0.55,
};

export const V2_ENVIRONMENT_PRESETS = {
  dark: { scrimStrength: 0.35, environmentOpacity: 0.5 },
  bright: { scrimStrength: 0.72, environmentOpacity: 0.28 },
  detailed: { scrimStrength: 0.58, environmentOpacity: 0.38 },
  minimal: { scrimStrength: 0.45, environmentOpacity: 0.22 },
} as const;

export const VIEWPORT_MODE_QUERY_KEY = 'view';

export const VIEW_QUERY_TO_MODE: Record<string, string> = {
  blueprint: 'BLUEPRINT',
  'founder-render': 'FOUNDER_RENDER',
  construction: 'CONSTRUCTION_PLAN',
  materials: 'MATERIALS',
  lighting: 'LIGHTING',
  camera: 'CAMERA',
  split: 'SPLIT_VIEW',
};

export const MODE_TO_VIEW_QUERY: Record<string, string> = {
  BLUEPRINT: 'blueprint',
  FOUNDER_RENDER: 'founder-render',
  CONSTRUCTION_PLAN: 'construction',
  MATERIALS: 'materials',
  LIGHTING: 'lighting',
  CAMERA: 'camera',
  SPLIT_VIEW: 'split',
};

export const LEFT_INSPECTOR_MODULES = [
  { id: 'blueprint', label: 'Blueprint', viewportMode: 'BLUEPRINT', summary: 'Holographic specification layer' },
  { id: 'construction', label: 'Construction Plan', viewportMode: 'CONSTRUCTION_PLAN', summary: 'Assembly and manufacturing plan' },
  { id: 'charter', label: 'Department Charter', viewportMode: 'EMPTY_STATE', summary: 'Mission, scope, and governance charter' },
  { id: 'scope', label: 'Scope & Rules', viewportMode: 'EMPTY_STATE', summary: 'Boundaries and constitutional rules' },
  { id: 'dependencies', label: 'Dependencies', viewportMode: 'EMPTY_STATE', summary: 'Upstream department dependencies' },
  { id: 'registry', label: 'Scene / Department Registry', viewportMode: 'EMPTY_STATE', summary: 'Canonical registry context' },
] as const;

export const RIGHT_INSPECTOR_MODULES = [
  { id: 'materials', label: 'Materials', viewportMode: 'MATERIALS', summary: 'Material profile and brand vault refs' },
  { id: 'lighting', label: 'Lighting', viewportMode: 'LIGHTING', summary: 'Lighting planner output' },
  { id: 'camera', label: 'Camera / Composition', viewportMode: 'CAMERA', summary: 'Composition and camera profile' },
  { id: 'performance', label: 'Performance Impact', viewportMode: 'EMPTY_STATE', summary: 'Render cost and build time' },
  { id: 'permits', label: 'Permits & Approvals', viewportMode: 'EMPTY_STATE', summary: 'Municipal and founder gates' },
  { id: 'immune', label: 'Immune System / Health', viewportMode: 'EMPTY_STATE', summary: 'Quality guard and drift status' },
  { id: 'metadata', label: 'Artifact Metadata', viewportMode: 'EMPTY_STATE', summary: 'Revision, provider, prompt version' },
] as const;

export const BOTTOM_TOOL_DOCK_ITEMS = [
  { id: 'experience-lab', label: 'Experience Lab', active: true },
  { id: 'registry', label: 'Studio World Registry' },
  { id: 'arch-tools', label: 'Architectural Tools' },
  { id: 'materials', label: 'Material Library' },
  { id: 'lighting', label: 'Lighting Studio' },
  { id: 'composition', label: 'Composition Studio' },
  { id: 'assets', label: 'Asset Reference' },
  { id: 'budget', label: 'Budget Forecast' },
  { id: 'permits', label: 'Permit Center' },
  { id: 'command', label: 'Command Center' },
] as const;

export const MOBILE_PRIMARY_DOCK_IDS = ['experience-lab', 'arch-tools', 'materials', 'lighting', 'command'] as const;
