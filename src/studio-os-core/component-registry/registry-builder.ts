import { EXECUTIVE_IA_MILESTONE } from '../../components/admin/studio/executive-ia';
import type { ComponentCategory, ComponentRegistryEntry } from './types';

const BASE_PATH = 'src/components/admin/studio/executive-ia';
const EIA_TOKENS = ['EIA.red', 'EIA.panel', 'eiaActionBtn', 'eiaCaption', 'ADMIN_STUDIO_THEME.panelBorder'];
const EIA_A11Y = ['Futura PT readable at 6–9px', 'Accent color contrast on light panels', 'Uppercase studio-os copy'];
const EIA_RESPONSIVE = ['Flex-wrap tab bars', 'Proportional health rings', 'ExecutivePageShell full-width stack'];

function entry(
  partial: Partial<ComponentRegistryEntry> &
    Pick<ComponentRegistryEntry, 'componentId' | 'officialName' | 'description' | 'category' | 'componentPath'>
): ComponentRegistryEntry {
  return {
    variants: partial.variants ?? ['default'],
    dependencies: partial.dependencies ?? ['ExecutivePageShell'],
    usageSurfaces: partial.usageSurfaces ?? ['studio-modules', 'mission-control'],
    version: partial.version ?? '1.0.0',
    owner: partial.owner ?? 'Executive IA (M83)',
    accessibility: partial.accessibility ?? EIA_A11Y,
    responsiveRules: partial.responsiveRules ?? EIA_RESPONSIVE,
    designTokens: partial.designTokens ?? EIA_TOKENS,
    animationRules: partial.animationRules ?? [],
    interactionRules: partial.interactionRules ?? ['hover border accent on tabs'],
    documentation: partial.documentation ?? ['docs/studio-os/executive-information-architecture.md'],
    status: partial.status ?? 'live',
    milestone: partial.milestone ?? EXECUTIVE_IA_MILESTONE,
    reuseScore: partial.reuseScore ?? 90,
    ...partial,
  };
}

const EXECUTIVE_IA_COMPONENTS: ComponentRegistryEntry[] = [
  entry({
    componentId: 'executive-page-shell',
    officialName: 'ExecutivePageShell',
    description: 'Standard page wrapper for all Studio OS module workspaces — M83 primitive.',
    category: 'panel',
    componentPath: `${BASE_PATH}/ExecutivePageShell.tsx`,
    dependencies: [],
    usageSurfaces: ['all-studio-modules'],
    reuseScore: 99,
  }),
  entry({
    componentId: 'executive-hero-card',
    officialName: 'ExecutiveHeroCard',
    description: 'Hero summary card with eyebrow, title, progress ring, and stat grid.',
    category: 'card',
    componentPath: `${BASE_PATH}/ExecutiveHeroCard.tsx`,
    variants: ['default', 'with-stats'],
    reuseScore: 98,
  }),
  entry({
    componentId: 'executive-secondary-card',
    officialName: 'ExecutiveSecondaryCard',
    description: 'Secondary content card for lists, metrics, and module sections.',
    category: 'card',
    componentPath: `${BASE_PATH}/ExecutiveSecondaryGrid.tsx`,
    reuseScore: 97,
  }),
  entry({
    componentId: 'executive-focus-panel',
    officialName: 'ExecutiveFocusPanel',
    description: 'Focused section panel with title and stacked secondary cards.',
    category: 'panel',
    componentPath: `${BASE_PATH}/ExecutiveFocusPanel.tsx`,
    reuseScore: 96,
  }),
  entry({
    componentId: 'executive-health-ring',
    officialName: 'ExecutiveHealthRing',
    description: 'Circular health/progress indicator — Mission Control and module headers.',
    category: 'chart',
    componentPath: `${BASE_PATH}/ExecutiveHealthRing.tsx`,
    variants: ['sm-44', 'md-52', 'lg-56'],
    usageSurfaces: ['mission-control', 'registry-workspaces'],
    reuseScore: 95,
  }),
  entry({
    componentId: 'executive-pipeline-viz',
    officialName: 'ExecutivePipelineViz',
    description: 'Pipeline stage visualization for operational modules.',
    category: 'chart',
    componentPath: `${BASE_PATH}/ExecutivePipelineViz.tsx`,
    reuseScore: 88,
  }),
  entry({
    componentId: 'executive-trend-sparkline',
    officialName: 'ExecutiveTrendSparkline',
    description: 'Compact trend sparkline for executive metrics.',
    category: 'chart',
    componentPath: `${BASE_PATH}/ExecutiveTrendSparkline.tsx`,
    reuseScore: 85,
  }),
  entry({
    componentId: 'executive-icon-nav',
    officialName: 'ExecutiveIconNav',
    description: 'Icon navigation strip for module sub-sections.',
    category: 'navigation',
    componentPath: `${BASE_PATH}/ExecutiveIconNav.tsx`,
    interactionRules: ['active tab accent border', 'metric badges'],
    reuseScore: 92,
  }),
  entry({
    componentId: 'executive-department-card',
    officialName: 'ExecutiveDepartmentCard',
    description: 'Department status card with wing accent and health indicator.',
    category: 'card',
    componentPath: `${BASE_PATH}/ExecutiveDepartmentCard.tsx`,
    reuseScore: 90,
  }),
  entry({
    componentId: 'executive-collapsible-section',
    officialName: 'ExecutiveCollapsibleSection',
    description: 'Collapsible section for dense executive workspaces.',
    category: 'panel',
    componentPath: `${BASE_PATH}/ExecutiveCollapsibleSection.tsx`,
    interactionRules: ['expand/collapse toggle'],
    reuseScore: 86,
  }),
  entry({
    componentId: 'executive-module-summary',
    officialName: 'ExecutiveModuleSummary',
    description: 'Compact module summary block for overview grids.',
    category: 'card',
    componentPath: `${BASE_PATH}/ExecutiveModuleSummary.tsx`,
    reuseScore: 84,
  }),
  entry({
    componentId: 'eia-action-button',
    officialName: 'eiaActionBtn',
    description: 'Standard executive action button token — Mission Control CTAs.',
    category: 'button',
    componentPath: `${BASE_PATH}/executiveIaTheme.ts`,
    designTokens: ['eiaActionBtn', 'EIA.red'],
    dependencies: [],
    reuseScore: 94,
  }),
];

const PLATFORM_COMPONENTS: ComponentRegistryEntry[] = [
  entry({
    componentId: 'perspective-panel',
    officialName: 'PerspectivePanel',
    description: 'Glass/acrylic perspective-warped surface — 4-corner quad mapping.',
    category: 'glass',
    componentPath: 'src/components/perspective-panel/PerspectivePanel.tsx',
    owner: 'Platform Design',
    dependencies: ['PerspectivePanelHost'],
    designTokens: ['perspectivePanelConfig'],
    documentation: ['motherboard/CORE.md'],
    milestone: 'M84',
    reuseScore: 91,
  }),
  entry({
    componentId: 'perspective-panel-host',
    officialName: 'PerspectivePanelHost',
    description: 'Host for perspective panel warp math and cover-locked layout.',
    category: 'glass',
    componentPath: 'src/components/perspective-panel/PerspectivePanelHost.tsx',
    owner: 'Platform Design',
    milestone: 'M84',
    reuseScore: 89,
  }),
  entry({
    componentId: 'command-dock',
    officialName: 'CommandDock',
    description: 'Universal command interface — natural language routing to concierges.',
    category: 'command-dock',
    componentPath: 'src/components/admin/studio/command-dock/CommandDock.tsx',
    owner: 'Concierge Layer',
    dependencies: ['module:command-dock'],
    usageSurfaces: ['global-admin', 'mission-control'],
    designTokens: ['ADMIN_STUDIO_THEME.accent'],
    interactionRules: ['expand compact/medium/large', 'proactive suggestions', 'routing microinteractions'],
    milestone: 'M77',
    reuseScore: 99,
  }),
  entry({
    componentId: 'studio-os-brand-tagline',
    officialName: 'StudioOsBrandTagline',
    description: 'Contextual brand voice tagline per registered system.',
    category: 'brand-asset',
    componentPath: 'src/components/admin/studio/brand/StudioOsBrandTagline.tsx',
    owner: 'Brand Positioning',
    dependencies: ['brand-positioning/constants'],
    milestone: 'M92',
    reuseScore: 93,
  }),
  entry({
    componentId: 'admin-studio-stage-shell',
    officialName: 'AdminStudioStageShell',
    description: 'Standard admin page shell with breadcrumb, title, and nav group.',
    category: 'panel',
    componentPath: 'src/components/admin/studio/AdminStudioStageShell.tsx',
    owner: 'Studio OS Platform',
    usageSurfaces: ['all-admin-pages'],
    reuseScore: 96,
  }),
  entry({
    componentId: 'loading-screen',
    officialName: 'LoadingScreen',
    description: 'Global lazy-route loading state for Studio OS modules.',
    category: 'loading',
    componentPath: 'src/components/LoadingScreen.tsx',
    owner: 'Studio OS Platform',
    animationRules: ['fade-in loading indicator'],
    reuseScore: 88,
  }),
  entry({
    componentId: 'executive-timeline-shell',
    officialName: 'ExecutiveTimelineShell',
    description: 'Timeline workspace shell with animation styles.',
    category: 'timeline',
    componentPath: 'src/components/admin/studio/executive-timeline/ExecutiveTimelinePanels.tsx',
    owner: 'Executive Timeline',
    animationRules: ['timeline scroll reveal', 'milestone pulse'],
    milestone: 'M119',
    reuseScore: 87,
  }),
  entry({
    componentId: 'executive-timeline-animation',
    officialName: 'ExecutiveTimelineAnimationStyles',
    description: 'Shared CSS animation tokens for Executive Timeline.',
    category: 'animation',
    componentPath: 'src/components/admin/studio/executive-timeline/ExecutiveTimelinePanels.tsx',
    owner: 'Executive Timeline',
    animationRules: ['keyframes timeline-entry', 'anniversary glow'],
    reuseScore: 82,
  }),
  entry({
    componentId: 'mission-control-panel',
    officialName: 'MissionControl Panel Pattern',
    description: 'Legacy Wing preview panel — ExecutiveSecondaryCard + HealthRing + CTA.',
    category: 'mission-control-widget',
    componentPath: 'src/components/admin/studio/mission-control/',
    variants: ['documentation-registry', 'documentation-governance', 'system-registry', 'studio-foundation-models'],
    dependencies: ['ExecutiveSecondaryCard', 'ExecutiveHealthRing', 'eiaActionBtn'],
    usageSurfaces: ['mission-control-legacy-wing'],
    reuseScore: 95,
  }),
  entry({
    componentId: 'registry-workspace-tabs',
    officialName: 'Registry Workspace Tab Bar',
    description: 'Reusable uppercase tab pattern for registry/governance workspaces.',
    category: 'navigation',
    componentPath: 'src/components/admin/studio/system-registry/SystemRegistryWorkspace.tsx',
    variants: ['system-registry', 'documentation-registry', 'documentation-governance'],
    interactionRules: ['active tab accent border', 'flex-wrap'],
    reuseScore: 92,
  }),
  entry({
    componentId: 'registry-search-input',
    officialName: 'Registry Search Input',
    description: 'Standard search field for registry discovery tabs.',
    category: 'input',
    componentPath: 'src/components/admin/studio/system-registry/SystemRegistryWorkspace.tsx',
    designTokens: ['ADMIN_STUDIO_THEME.panelBorder', 'ADMIN_STUDIO_THEME.inputBg'],
    reuseScore: 90,
  }),
  entry({
    componentId: 'component-registry-workspace',
    officialName: 'ComponentRegistryWorkspace',
    description: 'Component Registry™ workspace — browse and discover reusable UI assets.',
    category: 'panel',
    componentPath: 'src/components/admin/studio/component-registry/ComponentRegistryWorkspace.tsx',
    owner: 'Component Registry',
    milestone: 'M128',
    reuseScore: 100,
  }),
];

const MISSION_CONTROL_PANELS = [
  'documentation-registry',
  'documentation-governance',
  'system-registry',
  'studio-foundation-models',
  'model-orchestrator',
  'legacy-network',
  'studio-intelligence-architecture',
].map((modId) =>
  entry({
    componentId: `mission-control-${modId}`,
    officialName: `MissionControl${modId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Panel`,
    description: `Legacy Wing Mission Control preview for ${modId}.`,
    category: 'mission-control-widget',
    componentPath: `src/components/admin/studio/mission-control/MissionControl${modId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Panel.tsx`,
    dependencies: ['ExecutiveSecondaryCard', 'ExecutiveHealthRing', 'eiaActionBtn'],
    usageSurfaces: ['mission-control'],
    reuseScore: 88,
  })
);

/** Build full component catalog from Executive IA, platform, and Mission Control patterns. */
export function buildComponentRegistry(): ComponentRegistryEntry[] {
  const byId = new Map<string, ComponentRegistryEntry>();

  for (const c of [...EXECUTIVE_IA_COMPONENTS, ...PLATFORM_COMPONENTS, ...MISSION_CONTROL_PANELS]) {
    byId.set(c.componentId, c);
  }

  byId.set(
    'component-registry-module',
    entry({
      componentId: 'component-registry-module',
      officialName: 'Component Registry™',
      description: 'Master catalog of every reusable UI component — assemble interfaces, never recreate.',
      category: 'panel',
      componentPath: 'src/studio-os-core/component-registry/',
      owner: 'Studio OS Platform',
      milestone: 'M128',
      documentation: ['docs/studio-os/component-registry.md'],
      dependencies: ['ExecutivePageShell', 'ExecutiveHeroCard'],
      usageSurfaces: ['developers', 'design-system'],
      reuseScore: 100,
    })
  );

  return [...byId.values()];
}

export function getComponentRegistryEntry(componentId: string): ComponentRegistryEntry | undefined {
  return buildComponentRegistry().find((e) => e.componentId === componentId);
}

export function listComponentsByCategory(category: ComponentCategory): ComponentRegistryEntry[] {
  return buildComponentRegistry().filter((e) => e.category === category);
}

export function getComponentRegistryCount(): number {
  return buildComponentRegistry().length;
}
