/** Semantic registry — keyed by written labels on the canonical labeled source sheet. */

export type ExperienceLabIconName =
  | 'experienceLab'
  | 'blueprint'
  | 'construction'
  | 'materials'
  | 'lighting'
  | 'camera'
  | 'splitView'
  | 'founderRender'
  | 'projects'
  | 'history'
  | 'revisions'
  | 'milestones'
  | 'analytics'
  | 'performance'
  | 'issues'
  | 'approved'
  | 'playback'
  | 'pause'
  | 'stop'
  | 'next'
  | 'previous'
  | 'loop'
  | 'capture'
  | 'fullscreen'
  | 'zoomIn'
  | 'zoomOut'
  | 'pan'
  | 'fitView'
  | 'orbit'
  | 'perspective'
  | 'toggleUi'
  | 'grid'
  | 'hide'
  | 'lock'
  | 'unlock'
  | 'duplicate'
  | 'delete'
  | 'edit'
  | 'settings'
  | 'filter'
  | 'export'
  | 'import'
  | 'cloudSync'
  | 'database'
  | 'link'
  | 'share'
  | 'users'
  | 'team'
  | 'notifications'
  | 'comments'
  | 'notes'
  | 'attachments'
  | 'schedule'
  | 'timeTracking'
  | 'flag'
  | 'favorite'
  | 'dashboard'
  | 'focusMode'
  | 'terminal'
  | 'diagnostics'
  | 'security'
  | 'permissions'
  | 'help'
  | 'about';

export type ExperienceLabIconRegistryEntry = {
  sourceLabel: string;
  row: number;
  column: number;
  intendedUse: string;
  accessibleLabel: string;
};

export const EXPERIENCE_LAB_ICON_REGISTRY = {
  experienceLab: {
    sourceLabel: 'EXPERIENCE LAB',
    row: 0,
    column: 0,
    intendedUse: 'Experience Lab identity · architectural workbench',
    accessibleLabel: 'Experience Lab',
  },
  blueprint: {
    sourceLabel: 'BLUEPRINT',
    row: 0,
    column: 1,
    intendedUse: 'StudioViewport Blueprint mode',
    accessibleLabel: 'Blueprint',
  },
  construction: {
    sourceLabel: 'CONSTRUCTION',
    row: 0,
    column: 2,
    intendedUse: 'Construction Plan inspector · viewport mode',
    accessibleLabel: 'Construction',
  },
  materials: {
    sourceLabel: 'MATERIALS',
    row: 0,
    column: 3,
    intendedUse: 'Material Library · materials viewport mode',
    accessibleLabel: 'Materials',
  },
  lighting: {
    sourceLabel: 'LIGHTING',
    row: 0,
    column: 4,
    intendedUse: 'Lighting Studio · lighting viewport mode',
    accessibleLabel: 'Lighting',
  },
  camera: {
    sourceLabel: 'CAMERA',
    row: 0,
    column: 5,
    intendedUse: 'Camera Studio · camera viewport mode',
    accessibleLabel: 'Camera',
  },
  splitView: {
    sourceLabel: 'SPLIT VIEW',
    row: 0,
    column: 6,
    intendedUse: 'Split viewport mode',
    accessibleLabel: 'Split view',
  },
  founderRender: {
    sourceLabel: 'FOUNDER RENDER',
    row: 0,
    column: 7,
    intendedUse: 'Founder Render viewport mode',
    accessibleLabel: 'Founder render',
  },
  projects: {
    sourceLabel: 'PROJECTS',
    row: 1,
    column: 0,
    intendedUse: 'Project browser',
    accessibleLabel: 'Projects',
  },
  history: {
    sourceLabel: 'HISTORY',
    row: 1,
    column: 1,
    intendedUse: 'Founder review history',
    accessibleLabel: 'History',
  },
  revisions: {
    sourceLabel: 'REVISIONS',
    row: 1,
    column: 2,
    intendedUse: 'Founder review revisions',
    accessibleLabel: 'Revisions',
  },
  milestones: {
    sourceLabel: 'MILESTONES',
    row: 1,
    column: 3,
    intendedUse: 'Milestone tracker',
    accessibleLabel: 'Milestones',
  },
  analytics: {
    sourceLabel: 'ANALYTICS',
    row: 1,
    column: 4,
    intendedUse: 'Analytics · budget forecast workbench',
    accessibleLabel: 'Analytics',
  },
  performance: {
    sourceLabel: 'PERFORMANCE',
    row: 1,
    column: 5,
    intendedUse: 'Performance diagnostics',
    accessibleLabel: 'Performance',
  },
  issues: {
    sourceLabel: 'ISSUES',
    row: 1,
    column: 6,
    intendedUse: 'Inspector issues panel',
    accessibleLabel: 'Issues',
  },
  approved: {
    sourceLabel: 'APPROVED',
    row: 1,
    column: 7,
    intendedUse: 'Approval status · inspector approved state',
    accessibleLabel: 'Approved',
  },
  playback: {
    sourceLabel: 'PLAYBACK',
    row: 2,
    column: 0,
    intendedUse: 'Founder review playback',
    accessibleLabel: 'Play',
  },
  pause: {
    sourceLabel: 'PAUSE',
    row: 2,
    column: 1,
    intendedUse: 'Founder review pause',
    accessibleLabel: 'Pause',
  },
  stop: {
    sourceLabel: 'STOP',
    row: 2,
    column: 2,
    intendedUse: 'Stop playback',
    accessibleLabel: 'Stop',
  },
  next: {
    sourceLabel: 'NEXT',
    row: 2,
    column: 3,
    intendedUse: 'Next revision step',
    accessibleLabel: 'Next',
  },
  previous: {
    sourceLabel: 'PREVIOUS',
    row: 2,
    column: 4,
    intendedUse: 'Previous revision step',
    accessibleLabel: 'Previous',
  },
  loop: {
    sourceLabel: 'LOOP',
    row: 2,
    column: 5,
    intendedUse: 'Loop playback',
    accessibleLabel: 'Loop',
  },
  capture: {
    sourceLabel: 'CAPTURE',
    row: 2,
    column: 6,
    intendedUse: 'Capture viewport frame',
    accessibleLabel: 'Capture',
  },
  fullscreen: {
    sourceLabel: 'FULLSCREEN',
    row: 2,
    column: 7,
    intendedUse: 'Viewport fullscreen toggle',
    accessibleLabel: 'Fullscreen',
  },
  zoomIn: {
    sourceLabel: 'ZOOM IN',
    row: 3,
    column: 0,
    intendedUse: 'Viewport zoom in',
    accessibleLabel: 'Zoom in',
  },
  zoomOut: {
    sourceLabel: 'ZOOM OUT',
    row: 3,
    column: 1,
    intendedUse: 'Viewport zoom out',
    accessibleLabel: 'Zoom out',
  },
  pan: {
    sourceLabel: 'PAN',
    row: 3,
    column: 2,
    intendedUse: 'Viewport pan tool',
    accessibleLabel: 'Pan',
  },
  fitView: {
    sourceLabel: 'FIT VIEW',
    row: 3,
    column: 3,
    intendedUse: 'Fit viewport to content',
    accessibleLabel: 'Fit view',
  },
  orbit: {
    sourceLabel: 'ORBIT',
    row: 3,
    column: 4,
    intendedUse: 'Orbit camera control',
    accessibleLabel: 'Orbit',
  },
  perspective: {
    sourceLabel: 'PERSPECTIVE',
    row: 3,
    column: 5,
    intendedUse: 'Composition studio perspective',
    accessibleLabel: 'Perspective',
  },
  toggleUi: {
    sourceLabel: 'TOGGLE UI',
    row: 3,
    column: 6,
    intendedUse: 'Toggle viewport UI chrome',
    accessibleLabel: 'Toggle UI',
  },
  grid: {
    sourceLabel: 'GRID',
    row: 3,
    column: 7,
    intendedUse: 'Viewport grid overlay',
    accessibleLabel: 'Grid',
  },
  hide: {
    sourceLabel: 'HIDE',
    row: 4,
    column: 0,
    intendedUse: 'Inspector hide layer',
    accessibleLabel: 'Hide',
  },
  lock: {
    sourceLabel: 'LOCK',
    row: 4,
    column: 1,
    intendedUse: 'Inspector lock control',
    accessibleLabel: 'Lock',
  },
  unlock: {
    sourceLabel: 'UNLOCK',
    row: 4,
    column: 2,
    intendedUse: 'Inspector unlock control',
    accessibleLabel: 'Unlock',
  },
  duplicate: {
    sourceLabel: 'DUPLICATE',
    row: 4,
    column: 3,
    intendedUse: 'Duplicate artifact',
    accessibleLabel: 'Duplicate',
  },
  delete: {
    sourceLabel: 'DELETE',
    row: 4,
    column: 4,
    intendedUse: 'Delete artifact',
    accessibleLabel: 'Delete',
  },
  edit: {
    sourceLabel: 'EDIT',
    row: 4,
    column: 5,
    intendedUse: 'Inspector edit mode',
    accessibleLabel: 'Edit',
  },
  settings: {
    sourceLabel: 'SETTINGS',
    row: 4,
    column: 6,
    intendedUse: 'Inspector settings',
    accessibleLabel: 'Settings',
  },
  filter: {
    sourceLabel: 'FILTER',
    row: 4,
    column: 7,
    intendedUse: 'Inspector filter',
    accessibleLabel: 'Filter',
  },
  export: {
    sourceLabel: 'EXPORT',
    row: 5,
    column: 0,
    intendedUse: 'Export artifact',
    accessibleLabel: 'Export',
  },
  import: {
    sourceLabel: 'IMPORT',
    row: 5,
    column: 1,
    intendedUse: 'Import asset',
    accessibleLabel: 'Import',
  },
  cloudSync: {
    sourceLabel: 'CLOUD SYNC',
    row: 5,
    column: 2,
    intendedUse: 'Cloud sync diagnostics',
    accessibleLabel: 'Cloud sync',
  },
  database: {
    sourceLabel: 'DATABASE',
    row: 5,
    column: 3,
    intendedUse: 'Database diagnostics',
    accessibleLabel: 'Database',
  },
  link: {
    sourceLabel: 'LINK',
    row: 5,
    column: 4,
    intendedUse: 'Copy link',
    accessibleLabel: 'Link',
  },
  share: {
    sourceLabel: 'SHARE',
    row: 5,
    column: 5,
    intendedUse: 'Share artifact',
    accessibleLabel: 'Share',
  },
  users: {
    sourceLabel: 'USERS',
    row: 5,
    column: 6,
    intendedUse: 'User profile · founder identity',
    accessibleLabel: 'User',
  },
  team: {
    sourceLabel: 'TEAM',
    row: 5,
    column: 7,
    intendedUse: 'Workforce center',
    accessibleLabel: 'Team',
  },
  notifications: {
    sourceLabel: 'NOTIFICATIONS',
    row: 6,
    column: 0,
    intendedUse: 'Command Dock alerts',
    accessibleLabel: 'Notifications',
  },
  comments: {
    sourceLabel: 'COMMENTS',
    row: 6,
    column: 1,
    intendedUse: 'Founder review comments',
    accessibleLabel: 'Comments',
  },
  notes: {
    sourceLabel: 'NOTES',
    row: 6,
    column: 2,
    intendedUse: 'Founder review notes',
    accessibleLabel: 'Notes',
  },
  attachments: {
    sourceLabel: 'ATTACHMENTS',
    row: 6,
    column: 3,
    intendedUse: 'Founder review attachments · asset reference',
    accessibleLabel: 'Attachments',
  },
  schedule: {
    sourceLabel: 'SCHEDULE',
    row: 6,
    column: 4,
    intendedUse: 'Schedule planner',
    accessibleLabel: 'Schedule',
  },
  timeTracking: {
    sourceLabel: 'TIME TRACKING',
    row: 6,
    column: 5,
    intendedUse: 'Time tracking',
    accessibleLabel: 'Time tracking',
  },
  flag: {
    sourceLabel: 'FLAG',
    row: 6,
    column: 6,
    intendedUse: 'Flag for review',
    accessibleLabel: 'Flag',
  },
  favorite: {
    sourceLabel: 'FAVORITE',
    row: 6,
    column: 7,
    intendedUse: 'Favorite artifact',
    accessibleLabel: 'Favorite',
  },
  dashboard: {
    sourceLabel: 'DASHBOARD',
    row: 7,
    column: 0,
    intendedUse: 'Workbench dashboard navigation',
    accessibleLabel: 'Dashboard',
  },
  focusMode: {
    sourceLabel: 'FOCUS MODE',
    row: 7,
    column: 1,
    intendedUse: 'Viewport focus mode',
    accessibleLabel: 'Focus mode',
  },
  terminal: {
    sourceLabel: 'TERMINAL',
    row: 7,
    column: 2,
    intendedUse: 'Diagnostics terminal',
    accessibleLabel: 'Terminal',
  },
  diagnostics: {
    sourceLabel: 'DIAGNOSTICS',
    row: 7,
    column: 3,
    intendedUse: 'Diagnostics drawer',
    accessibleLabel: 'Diagnostics',
  },
  security: {
    sourceLabel: 'SECURITY',
    row: 7,
    column: 4,
    intendedUse: 'Security diagnostics',
    accessibleLabel: 'Security',
  },
  permissions: {
    sourceLabel: 'PERMISSIONS',
    row: 7,
    column: 5,
    intendedUse: 'Permit center · permissions',
    accessibleLabel: 'Permissions',
  },
  help: {
    sourceLabel: 'HELP',
    row: 7,
    column: 6,
    intendedUse: 'Help panel',
    accessibleLabel: 'Help',
  },
  about: {
    sourceLabel: 'ABOUT',
    row: 7,
    column: 7,
    intendedUse: 'About Experience Lab',
    accessibleLabel: 'About',
  },
} as const satisfies Record<ExperienceLabIconName, ExperienceLabIconRegistryEntry>;

export const EXPERIENCE_LAB_ICON_NAMES = Object.keys(
  EXPERIENCE_LAB_ICON_REGISTRY,
) as ExperienceLabIconName[];

export function isExperienceLabIconName(name: string): name is ExperienceLabIconName {
  return name in EXPERIENCE_LAB_ICON_REGISTRY;
}
