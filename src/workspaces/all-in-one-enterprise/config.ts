import { STUDIO_OS_PLATFORM_ASSETS } from '../../studio-os-core/core/assets';
import { DEFAULT_WORKSPACE_PERMISSIONS } from '../../studio-os-core/workspace/permissions';
import { STUDIO_OS_ROUTES } from '../../studio-os-core/workspace/routes';
import type { WorkspaceSchema } from '../../studio-os-core/workspace/types';

export const ALL_IN_ONE_ENTERPRISE_WORKSPACE: WorkspaceSchema = {
  id: 'all-in-one-enterprise',
  slug: 'all-in-one-enterprise',
  brandName: 'ALL IN ONE ENTERPRISE',
  displayName: 'ALL IN ONE ENTERPRISE',
  status: 'active',
  logoSrc: STUDIO_OS_PLATFORM_ASSETS.placeholderThumb,
  colors: { primary: '#2563EB', accent: '#2563EB', secondary: '#64748B' },
  typography: { labelFont: 'Futura PT', accentFont: 'Covered By Your Grace' },
  brandVoice: 'ENTERPRISE HOLDING · MULTI-BRAND OPERATIONS · STUDIO OS CAMPUS',
  brandRules: ['HOLDING COMPANY · SHARED OS · ISOLATED WORKSPACE DATA'],
  permissions: { ...DEFAULT_WORKSPACE_PERMISSIONS, canAccessStudioModules: true },
  moduleCopy: {
    'mission-control': {
      subtitle: 'ENTERPRISE HQ — PORTFOLIO MISSION OVERVIEW.',
    },
  },
  studioEnabled: true,
  studioEntryPath: STUDIO_OS_ROUTES.workspaceDashboard('all-in-one-enterprise'),
  metadata: {
    industry: 'enterprise-holding',
    description: 'Multi-brand enterprise holding company on Studio OS.',
    tags: ['enterprise', 'holding', 'portfolio'],
  },
};
