/** Maps Experience Lab V2 surfaces to semantic icon names from the labeled sprite registry. */
import type { ExperienceLabIconName } from '../icons/experience-lab-icon-registry';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { WorkbenchEditingToolId, WorkbenchWorldNavId } from './experience-lab-v2-workbench-config';

export const VIEWPORT_MODE_ICON: Partial<Record<StudioViewportMode, ExperienceLabIconName>> = {
  BLUEPRINT: 'blueprint',
  FOUNDER_RENDER: 'founderRender',
  CONSTRUCTION_PLAN: 'construction',
  MATERIALS: 'materials',
  LIGHTING: 'lighting',
  CAMERA: 'camera',
  SPLIT_VIEW: 'splitView',
};

export const WORKBENCH_TOOL_ICON: Record<WorkbenchEditingToolId, ExperienceLabIconName> = {
  'architectural-tools': 'construction',
  'material-library': 'materials',
  'asset-reference': 'attachments',
  'budget-forecast': 'analytics',
  'workforce-center': 'team',
  'permit-center': 'permissions',
  'lighting-studio': 'lighting',
  'camera-studio': 'camera',
  'composition-studio': 'perspective',
  'character-studio': 'users',
  'animation-studio': 'playback',
  'material-lab': 'materials',
};

export const WORKBENCH_NAV_ICON: Record<WorkbenchWorldNavId, ExperienceLabIconName> = {
  dashboard: 'projects',
  'studio-world': 'orbit',
  marketplace: 'share',
  'command-center': 'terminal',
};

export const INSPECTOR_ACTION_ICONS = {
  settings: 'settings',
  filter: 'filter',
  edit: 'edit',
  hide: 'hide',
  lock: 'lock',
  unlock: 'unlock',
  approved: 'approved',
  issues: 'issues',
} as const satisfies Record<string, ExperienceLabIconName>;

export const FOUNDER_REVIEW_ICONS = {
  revisions: 'revisions',
  history: 'history',
  comments: 'comments',
  notes: 'notes',
  attachments: 'attachments',
  playback: 'playback',
  pause: 'pause',
  previous: 'previous',
  next: 'next',
  capture: 'capture',
} as const satisfies Record<string, ExperienceLabIconName>;

export const DIAGNOSTICS_ICONS = {
  diagnostics: 'diagnostics',
  performance: 'performance',
  terminal: 'terminal',
  database: 'database',
  cloudSync: 'cloudSync',
  security: 'security',
} as const satisfies Record<string, ExperienceLabIconName>;
