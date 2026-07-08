/**
 * Studio Command Center™ — Executive Atrium wing portals.
 * Maps immersive architecture to existing nav groups / routes.
 */
import type { StudioNavGroupId } from '../../../../utils/adminStudioNavigation';
import {
  countModulesForGroup,
  getModulesForGroup,
  STUDIO_NAV_GROUPS,
} from '../../../../utils/adminStudioNavigation';
import { adminStudioDepartmentVerticalSlicePath } from '../../../../utils/adminStudioRoutes';

export type CommandCenterWingId =
  | 'create'
  | 'intelligence'
  | 'distribution'
  | 'operations'
  | 'customer-experience'
  | 'finance'
  | 'studio-archives'
  | 'creative-direction';

export type CommandCenterWingPortal = {
  id: CommandCenterWingId;
  label: string;
  shortLabel: string;
  tagline: string;
  icon: string;
  /** Hotspot position in Executive Atrium™ (%). */
  bounds: { left: string; top: string; width: string; height: string };
  resolveRoute: () => string;
  moduleCount: () => number;
  liveCount: () => number;
};

function firstModuleRoute(groupId: StudioNavGroupId): string {
  const mod = getModulesForGroup(groupId, { overviewOnly: true })[0]
    ?? getModulesForGroup(groupId)[0];
  return mod?.route ?? '/admin/studio/overview';
}

function firstLiveRoute(groupId: StudioNavGroupId): string {
  const mod = getModulesForGroup(groupId).find((m) => m.status === 'live');
  return mod?.route ?? firstModuleRoute(groupId);
}

export const COMMAND_CENTER_WING_PORTALS: CommandCenterWingPortal[] = [
  {
    id: 'create',
    label: 'Create Wing™',
    shortLabel: 'Create',
    tagline: 'Ideation · bibles · prompts · AI tools',
    icon: '✨',
    bounds: { left: '6%', top: '52%', width: '18%', height: '22%' },
    resolveRoute: () => firstModuleRoute('create'),
    moduleCount: () => countModulesForGroup('create'),
    liveCount: () => getModulesForGroup('create').filter((m) => m.status === 'live').length,
  },
  {
    id: 'intelligence',
    label: 'Intelligence Wing™',
    shortLabel: 'Intel',
    tagline: 'Strategy · audience · analytics · council',
    icon: '🧠',
    bounds: { left: '76%', top: '52%', width: '18%', height: '22%' },
    resolveRoute: () => firstModuleRoute('intelligence'),
    moduleCount: () => countModulesForGroup('intelligence'),
    liveCount: () => getModulesForGroup('intelligence').filter((m) => m.status === 'live').length,
  },
  {
    id: 'distribution',
    label: 'Distribution Wing™',
    shortLabel: 'Dist',
    tagline: 'Channels · queue · calendar · network',
    icon: '🚀',
    bounds: { left: '6%', top: '28%', width: '18%', height: '20%' },
    resolveRoute: () => firstLiveRoute('distribution'),
    moduleCount: () => countModulesForGroup('distribution'),
    liveCount: () => getModulesForGroup('distribution').filter((m) => m.status === 'live').length,
  },
  {
    id: 'operations',
    label: 'Operations Wing™',
    shortLabel: 'Ops',
    tagline: 'Production floor · pipeline · execution',
    icon: '🎬',
    bounds: { left: '76%', top: '28%', width: '18%', height: '20%' },
    resolveRoute: () => firstModuleRoute('production'),
    moduleCount: () => countModulesForGroup('production'),
    liveCount: () => getModulesForGroup('production').filter((m) => m.status === 'live').length,
  },
  {
    id: 'customer-experience',
    label: 'Customer Experience Wing™',
    shortLabel: 'CX',
    tagline: 'Trust · delight · belonging · touchpoints',
    icon: '💎',
    bounds: { left: '22%', top: '72%', width: '20%', height: '18%' },
    resolveRoute: () => '/admin/studio/chief-experience-officer',
    moduleCount: () => 1,
    liveCount: () => 1,
  },
  {
    id: 'finance',
    label: 'Finance Wing™',
    shortLabel: 'Finance',
    tagline: 'Company health · pulse · executive HQ signals',
    icon: '📈',
    bounds: { left: '58%', top: '72%', width: '20%', height: '18%' },
    resolveRoute: () => '/admin/studio/company-health-index',
    moduleCount: () => 2,
    liveCount: () => getModulesForGroup('overview').filter((m) => m.status === 'live').length,
  },
  {
    id: 'studio-archives',
    label: 'Studio Archives™',
    shortLabel: 'Archive',
    tagline: 'Warehouse · museum · legacy · vault',
    icon: '🏛',
    bounds: { left: '22%', top: '18%', width: '20%', height: '18%' },
    resolveRoute: () => '/admin/studio/studio-museum',
    moduleCount: () => countModulesForGroup('legacy') + countModulesForGroup('visuals'),
    liveCount: () =>
      getModulesForGroup('legacy').filter((m) => m.status === 'live').length +
      getModulesForGroup('visuals').filter((m) => m.id === 'studio-warehouse' || m.id === 'studio-museum').length,
  },
  {
    id: 'creative-direction',
    label: 'Creative Direction Studio™',
    shortLabel: 'CDS',
    tagline: 'Golden Build™ · Story Table · creative brain',
    icon: '🎨',
    bounds: { left: '58%', top: '18%', width: '20%', height: '18%' },
    resolveRoute: () => adminStudioDepartmentVerticalSlicePath('creative-direction'),
    moduleCount: () => 1,
    liveCount: () => 1,
  },
];

export function getCommandCenterWing(id: CommandCenterWingId): CommandCenterWingPortal {
  return COMMAND_CENTER_WING_PORTALS.find((w) => w.id === id) ?? COMMAND_CENTER_WING_PORTALS[0];
}

export function commandCenterWingCount(): number {
  return COMMAND_CENTER_WING_PORTALS.length;
}

export function commandCenterTotalModules(): number {
  return STUDIO_NAV_GROUPS.reduce((sum, g) => sum + countModulesForGroup(g.id), 0);
}
