export const XELAB_SUBSYSTEM_NAME = 'Experience Lab™';
export const XELAB_SUBSYSTEM_VERSION = '1.0.0';

export const XELAB_PANEL_IDS = [
  'runtime-status',
  'brand-dna',
  'platform-dna',
  'department-dna',
  'scene-dna',
  'component-dna',
  'motion-dna',
  'interaction-dna',
  'runtime-inspector',
  'performance',
] as const;

export type XelabPanelId = (typeof XELAB_PANEL_IDS)[number];

export const XELAB_PANEL_LABELS: Record<XelabPanelId, string> = {
  'runtime-status': 'Runtime Status™',
  'brand-dna': 'Brand DNA™',
  'platform-dna': 'Platform DNA™',
  'department-dna': 'Department DNA™',
  'scene-dna': 'Scene DNA™',
  'component-dna': 'Component DNA™',
  'motion-dna': 'Motion DNA™',
  'interaction-dna': 'Interaction DNA™',
  'runtime-inspector': 'Runtime Inspector™',
  performance: 'Performance™',
};

/** Canonical test scenarios — identical runtime infrastructure, DNA inheritance only */
export const XELAB_TEST_SCENARIOS = [
  {
    scenarioId: 'studio-os-hq',
    label: 'Studio OS Executive Headquarters',
    brandId: 'studio-os',
    departmentId: 'headquarters',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'Executive Headquarters — operating civilization',
  },
  {
    scenarioId: 'studio-os-institute',
    label: 'Studio OS Institute',
    brandId: 'studio-os',
    departmentId: 'knowledge',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'Institute of Knowledge — archival intelligence',
  },
  {
    scenarioId: 'studio-os-command',
    label: 'Studio OS Command Center',
    brandId: 'studio-os',
    departmentId: 'command-center',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'Command Center — decisive operations',
  },
  {
    scenarioId: 'frontal-slayer-hq',
    label: 'Frontal Slayer Headquarters',
    brandId: 'frontal-slayer',
    departmentId: 'headquarters',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'The Mansion™ — concierge arrival',
  },
  {
    scenarioId: 'frontal-slayer-hair-lab',
    label: 'Frontal Slayer Hair Analysis Lab',
    brandId: 'frontal-slayer',
    departmentId: 'creative',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'Hair Analysis Lab — mirror-light diagnostics',
  },
  {
    scenarioId: 'ndx-hq',
    label: 'NDX Headquarters',
    brandId: 'ndx',
    departmentId: 'headquarters',
    sceneId: 'hq-master-demonstration-v1',
    heroLabel: 'Media Command — signal desk live',
  },
] as const;

export type XelabScenarioId = (typeof XELAB_TEST_SCENARIOS)[number]['scenarioId'];

export const XELAB_SWITCHER_OPTIONS = {
  brand: ['studio-os', 'frontal-slayer', 'ndx'] as const,
  department: ['headquarters', 'knowledge', 'command-center', 'creative', 'operations'] as const,
  scene: ['hq-master-demonstration-v1'] as const,
  theme: ['default', 'high-contrast', 'soft-wash'] as const,
  orb: ['default', 'minimal', 'prominent'] as const,
  lighting: ['default', 'warm-marble', 'salon-glow', 'broadcast-dark'] as const,
  particle: ['default', 'none', 'enhanced'] as const,
  typography: ['default', 'display-large', 'compact'] as const,
  animation: ['default', 'fast', 'slow', 'reduced'] as const,
};

export type XelabLabSwitchers = {
  themeVariant: (typeof XELAB_SWITCHER_OPTIONS.theme)[number];
  orbVariant: (typeof XELAB_SWITCHER_OPTIONS.orb)[number];
  lightingVariant: (typeof XELAB_SWITCHER_OPTIONS.lighting)[number];
  particleVariant: (typeof XELAB_SWITCHER_OPTIONS.particle)[number];
  typographyVariant: (typeof XELAB_SWITCHER_OPTIONS.typography)[number];
  animationVariant: (typeof XELAB_SWITCHER_OPTIONS.animation)[number];
};

export const XELAB_DEFAULT_SWITCHERS: XelabLabSwitchers = {
  themeVariant: 'default',
  orbVariant: 'default',
  lightingVariant: 'default',
  particleVariant: 'default',
  typographyVariant: 'default',
  animationVariant: 'default',
};
