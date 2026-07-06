import { STUDIO_ADMINISTRATION_ROUTES } from '../application/routes';

export type StudioPlatformNavId =
  | 'command-center'
  | 'registry'
  | 'licensing'
  | 'marketplace'
  | 'system-health'
  | 'global-ai'
  | 'cross-org-intelligence'
  | 'plugins'
  | 'developer-center'
  | 'portfolio-analytics'
  | 'portfolio-revenue'
  | 'studio-settings'
  | 'studio-updates'
  | 'studio-intelligence'
  | 'create'
  | 'blueprints'
  | 'promotion-center';

export type StudioPlatformNavItem = {
  id: StudioPlatformNavId;
  label: string;
  description: string;
  route: string;
  group: 'overview' | 'operations' | 'intelligence' | 'commerce' | 'platform';
};

/** Studio Administration navigation — separate from organization headquarters modules. */
export const STUDIO_PLATFORM_NAV: StudioPlatformNavItem[] = [
  {
    id: 'command-center',
    label: 'STUDIO COMMAND CENTER',
    description: 'Portfolio health, attention queue, and cross-company summary.',
    route: STUDIO_ADMINISTRATION_ROUTES.commandCenter,
    group: 'overview',
  },
  {
    id: 'registry',
    label: 'ORGANIZATION REGISTRY',
    description: 'Every organization running on Studio OS.',
    route: STUDIO_ADMINISTRATION_ROUTES.registry,
    group: 'overview',
  },
  {
    id: 'licensing',
    label: 'LICENSING',
    description: 'Platform licenses and organization entitlements.',
    route: STUDIO_ADMINISTRATION_ROUTES.licensing,
    group: 'commerce',
  },
  {
    id: 'marketplace',
    label: 'MARKETPLACE',
    description: 'Business ecosystem and platform marketplace activity.',
    route: STUDIO_ADMINISTRATION_ROUTES.marketplace,
    group: 'commerce',
  },
  {
    id: 'portfolio-revenue',
    label: 'PORTFOLIO REVENUE',
    description: 'Cross-organization revenue and pacing.',
    route: STUDIO_ADMINISTRATION_ROUTES.portfolioRevenue,
    group: 'commerce',
  },
  {
    id: 'system-health',
    label: 'SYSTEM HEALTH',
    description: 'Infrastructure, uptime, and workspace activity.',
    route: STUDIO_ADMINISTRATION_ROUTES.systemHealth,
    group: 'operations',
  },
  {
    id: 'global-ai',
    label: 'GLOBAL AI',
    description: 'Platform-wide AI activity and utilization.',
    route: STUDIO_ADMINISTRATION_ROUTES.globalAi,
    group: 'intelligence',
  },
  {
    id: 'cross-org-intelligence',
    label: 'CROSS-ORG INTELLIGENCE',
    description: 'Insights spanning every organization in the portfolio.',
    route: STUDIO_ADMINISTRATION_ROUTES.crossOrgIntelligence,
    group: 'intelligence',
  },
  {
    id: 'studio-intelligence',
    label: 'STUDIO INTELLIGENCE',
    description: 'Operating intelligence for Studio OS itself.',
    route: STUDIO_ADMINISTRATION_ROUTES.studioIntelligence,
    group: 'intelligence',
  },
  {
    id: 'portfolio-analytics',
    label: 'PORTFOLIO ANALYTICS',
    description: 'Aggregate analytics across organizations.',
    route: STUDIO_ADMINISTRATION_ROUTES.portfolioAnalytics,
    group: 'intelligence',
  },
  {
    id: 'plugins',
    label: 'PLUGIN MANAGEMENT',
    description: 'Platform plugins and organization enablement.',
    route: STUDIO_ADMINISTRATION_ROUTES.plugins,
    group: 'platform',
  },
  {
    id: 'developer-center',
    label: 'DEVELOPER CENTER',
    description: 'APIs, integrations, and extension tooling.',
    route: STUDIO_ADMINISTRATION_ROUTES.developerCenter,
    group: 'platform',
  },
  {
    id: 'studio-settings',
    label: 'STUDIO SETTINGS',
    description: 'Global Studio OS configuration.',
    route: STUDIO_ADMINISTRATION_ROUTES.studioSettings,
    group: 'platform',
  },
  {
    id: 'studio-updates',
    label: 'STUDIO UPDATES',
    description: 'Release notes and platform update rollout.',
    route: STUDIO_ADMINISTRATION_ROUTES.studioUpdates,
    group: 'platform',
  },
  {
    id: 'create',
    label: 'CREATE ORGANIZATION',
    description: 'Launch a new organization on Studio OS.',
    route: STUDIO_ADMINISTRATION_ROUTES.create,
    group: 'operations',
  },
  {
    id: 'blueprints',
    label: 'ORG TEMPLATES',
    description: 'Blueprint library for new organizations.',
    route: STUDIO_ADMINISTRATION_ROUTES.blueprints,
    group: 'operations',
  },
  {
    id: 'promotion-center',
    label: 'ONBOARDING',
    description: 'Organization onboarding and promotion center.',
    route: STUDIO_ADMINISTRATION_ROUTES.promotionCenter,
    group: 'operations',
  },
];

export function resolvePlatformNavFromPath(pathname: string): StudioPlatformNavItem | undefined {
  return STUDIO_PLATFORM_NAV.find((item) => {
    if (item.route === pathname) return true;
    if (item.id === 'registry' && pathname === '/admin/studio-os') return true;
    return pathname.startsWith(`${item.route}/`);
  });
}
