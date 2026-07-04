import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os/workspace/permissions';
import type { WorkspaceSchema } from '../../studio-os/workspace/types';

function placeholderWorkspace(id: string, displayName: string): WorkspaceSchema {
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
      description: 'Placeholder workspace for StudioOS architecture testing.',
      tags: ['placeholder'],
    },
  };
}

export const SANDBOX_WORKSPACE = placeholderWorkspace('sandbox', 'SANDBOX');
export const FUTURE_BRAND_WORKSPACE = placeholderWorkspace('future-brand', 'FUTURE BRAND');
export const FUTURE_CLIENT_WORKSPACE = placeholderWorkspace('future-client', 'FUTURE CLIENT');
