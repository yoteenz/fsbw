import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os-core/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os-core/workspace/permissions';
import type { WorkspaceSchema } from '../../studio-os-core/workspace/types';

/** Shared placeholder workspace factory — architecture testing only. */
export function createPlaceholderWorkspace(id: string, displayName: string): WorkspaceSchema {
  return {
    id,
    slug: id,
    brandName: displayName,
    displayName,
    status: 'placeholder',
    logoSrc: STUDIO_OS_PLATFORM_ASSETS.workspaceIcon,
    colors: { primary: '#6B7280', accent: '#9CA3AF' },
    typography: { labelFont: 'Futura PT', accentFont: 'Covered By Your Grace' },
    brandVoice: 'PLACEHOLDER — ARCHITECTURE TESTING ONLY',
    brandRules: ['NO PRODUCTION DATA', 'STUDIO MODULES DISABLED'],
    permissions: { ...DEFAULT_WORKSPACE_PERMISSIONS, canAccessStudioModules: false },
    moduleCopy: {},
    studioEnabled: false,
    studioEntryPath: `/admin/studio-os/workspace/${id}`,
    metadata: {
      description: 'Placeholder workspace for studio os architecture testing.',
      tags: ['placeholder'],
    },
  };
}
