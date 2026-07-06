import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os-core/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os-core/workspace/permissions';
import { STUDIO_OS_ROUTES } from '../../studio-os-core/workspace/routes';
import type { WorkspaceSchema } from '../../studio-os-core/workspace/types';

export const VXD_INC_WORKSPACE: WorkspaceSchema = {
  id: 'vxd-inc',
  slug: 'vxd-inc',
  brandName: 'VXD INC',
  displayName: 'VXD INC',
  status: 'active',
  logoSrc: STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
  colors: { primary: '#0F172A', accent: '#EB1C24', secondary: '#64748B' },
  typography: { labelFont: 'Futura PT', accentFont: 'Covered By Your Grace' },
  brandVoice: 'STUDIO OS PLATFORM OWNER · PORTFOLIO INTELLIGENCE · CROSS-WORKSPACE LEARNING',
  brandRules: ['PLATFORM GOVERNANCE · STUDIO INTELLIGENCE LAYER'],
  permissions: { ...DEFAULT_WORKSPACE_PERMISSIONS, canAccessStudioModules: true },
  moduleCopy: {
    'mission-control': {
      subtitle: 'VXD HQ · PORTFOLIO INTELLIGENCE · PLATFORM GOVERNANCE.',
    },
    'distribution-network': {
      subtitle: 'PORTFOLIO SIGNAL ROUTING — THE BROADCASTING LAYER OF VXD INC.',
    },
    'studio-intelligence': {
      subtitle: 'PORTFOLIO INTELLIGENCE — CROSS-WORKSPACE INSIGHTS WITH FOUNDER APPROVAL.',
    },
  },
  studioEnabled: true,
  studioEntryPath: STUDIO_OS_ROUTES.workspaceDashboard('vxd-inc'),
  metadata: {
    industry: 'platform',
    description: 'VXD Inc. — Studio OS platform owner · portfolio intelligence.',
    tags: ['platform', 'vxd', 'studio-intelligence'],
  },
};
