import { STUDIO_OS_PLATFORM_ASSETS } from '../core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../workspace/permissions';
import type { WorkspaceSchema } from '../workspace/types';

/** Neutral platform tenant — not an organization. Used only for Studio Administration context. */
export const STUDIO_PLATFORM_WORKSPACE_ID = 'studio-os';

export const STUDIO_PLATFORM_WORKSPACE: WorkspaceSchema = {
  id: STUDIO_PLATFORM_WORKSPACE_ID,
  slug: 'studio-os',
  brandName: 'STUDIO OS',
  displayName: 'STUDIO ADMINISTRATION',
  status: 'active',
  logoSrc: STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
  colors: {
    primary: '#6366F1',
    accent: '#6366F1',
    secondary: '#808080',
  },
  typography: {
    labelFont: 'Futura PT',
    accentFont: 'Covered By Your Grace',
  },
  brandVoice: 'PORTFOLIO CONTROL PLANE · NO ORGANIZATION CONTEXT',
  brandRules: ['STUDIO ADMINISTRATION NEVER INHERITS ORGANIZATION MISSION CONTROL'],
  permissions: { ...DEFAULT_WORKSPACE_PERMISSIONS, canSwitchWorkspace: true, canAccessStudioModules: false },
  moduleCopy: {},
  metadata: {
    industry: 'Platform',
    description: 'Studio OS platform administration — above every organization.',
    tags: ['platform', 'studio-administration'],
  },
  studioEnabled: false,
  studioEntryPath: '/admin/studio-os/command-center',
};
