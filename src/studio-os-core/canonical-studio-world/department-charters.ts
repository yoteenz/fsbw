import type { CanonicalMainDepartmentId } from './canonical-department-registry';

export const DEPARTMENT_CHARTER_VERSION = 'department-charter.v1' as const;

export type DepartmentCharter = {
  charterVersion: typeof DEPARTMENT_CHARTER_VERSION;
  departmentId: CanonicalMainDepartmentId;
  mission: string;
  responsibilities: string[];
  nonResponsibilities: string[];
  userClasses: string[];
  coreWorkflows: string[];
  requiredTools: string[];
  requiredCommandModules: string[];
  requiredWorkbenchModules: string[];
  requiredPanels: string[];
  requiredSockets: string[];
  handoffDestinations: string[];
  upstreamDependencies: string[];
  downstreamDependencies: string[];
  visualIdentity: string;
  atmosphere: string;
  architecturalMetaphor: string;
  availability: string;
  healthRequirements: string[];
  permitRequirements: string[];
  lifecycleRules: string[];
  /** Architectural elements that MUST appear in founder render. */
  mustInclude?: string[];
  /** Architectural elements that MUST NEVER appear in founder render. */
  neverInclude?: string[];
};

const charter = (
  departmentId: CanonicalMainDepartmentId,
  partial: Omit<DepartmentCharter, 'charterVersion' | 'departmentId'>
): DepartmentCharter => ({
  charterVersion: DEPARTMENT_CHARTER_VERSION,
  departmentId,
  ...partial,
});

export const DEPARTMENT_CHARTERS: Partial<Record<CanonicalMainDepartmentId, DepartmentCharter>> = {
  'experience-lab': charter('experience-lab', {
    mission: 'Design canonical Studio World departments and official Industry Packs.',
    responsibilities: [
      'architectural planning',
      'Blueprint Author orchestration',
      'master Founder Render generation',
      'construction planning',
      'canonical infrastructure creation',
      'official pack creation',
    ],
    nonResponsibilities: ['founder customization', 'isolated asset manufacturing', 'tenant-specific edits'],
    userClasses: ['Admin Founder', 'authorized Studio World architects', 'system workers'],
    coreWorkflows: ['select department', 'author blueprint', 'generate render', 'approve', 'publish'],
    requiredTools: ['Blueprint Author', 'Industry Pack Registry', 'Socket Registry'],
    requiredCommandModules: ['world-registry-context', 'blueprint-context', 'revision-context', 'permit-status', 'cost-forecast'],
    requiredWorkbenchModules: ['architectural-tools', 'material-intent', 'lighting-intent', 'composition', 'budget-forecast', 'permit-center'],
    requiredPanels: ['department-tree', 'render-queue', 'approval-queue'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT', 'DISPLAY_A'],
    handoffDestinations: ['creative-director-studio', 'construction-mode', 'studio-world-registry'],
    upstreamDependencies: ['blueprint-author'],
    downstreamDependencies: ['creative-director-studio', 'studio-world-registry'],
    visualIdentity: 'bright architectural planning atelier',
    atmosphere: 'executive marble planning studio',
    architecturalMetaphor: 'master planning department',
    availability: 'admin-only',
    healthRequirements: ['immune-system-clear', 'architecture-law-001-pass'],
    permitRequirements: ['municipal-planning-permit'],
    lifecycleRules: ['must-publish-before-founder-clone', 'no-tenant-ownership'],
    mustInclude: [
      'floating holographic room blueprint',
      'construction holograms',
      'lighting studies',
      'material studies',
      'architectural workbench',
      'integrated blank command dock',
      'integrated blank workbench',
    ],
    neverInclude: [
      'reception desk',
      'waiting room',
      'receptionist furniture',
      'corporate lobby',
      'concierge desk',
      'ReceptionShell',
    ],
  }),
  'creative-director-studio': charter('creative-director-studio', {
    mission: 'Manufacture and customize assets on approved architecture.',
    responsibilities: ['asset manufacturing', 'material editing', 'lighting editing', 'approved mod attachment'],
    nonResponsibilities: ['canonical architecture invention', 'department creation', 'Industry Pack authoring'],
    userClasses: ['Founder', 'authorized production staff'],
    coreWorkflows: ['receive handoff', 'manufacture assets', 'customize HQ', 'approve revisions'],
    requiredTools: ['Material Lab', 'Lighting Studio', 'Composition Suite', 'Asset Library'],
    requiredCommandModules: ['project-context', 'selected-asset', 'manufacturing-status', 'approvals', 'render-queue'],
    requiredWorkbenchModules: ['asset-workbench', 'material-lab', 'lighting-studio', 'composition-suite', 'asset-library', 'render-queue'],
    requiredPanels: ['asset-turntable', 'approval-gallery'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT', 'CENTER_STAGE'],
    handoffDestinations: ['construction-mode'],
    upstreamDependencies: ['experience-lab'],
    downstreamDependencies: ['construction-mode'],
    visualIdentity: 'immersive creative manufacturing studio',
    atmosphere: 'production atelier',
    architecturalMetaphor: 'creative director atelier',
    availability: 'founder-accessible',
    healthRequirements: ['approved-handoff-present'],
    permitRequirements: [],
    lifecycleRules: ['requires-approved-blueprint', 'no-architecture-invention'],
    mustInclude: [
      'isolated production stages',
      'material testing',
      'asset version bays',
      'lighting rigs',
      'camera rigs',
      'reference wall',
      'production benches',
      'integrated blank command dock',
      'integrated blank workbench',
    ],
    neverInclude: ['Reception layout', 'reception desk', 'waiting lounge', 'ReceptionShell'],
  }),
  'command-center': charter('command-center', {
    mission: 'Operate Studio World global infrastructure and incident response.',
    responsibilities: ['global operating state', 'infrastructure health', 'workforce orchestration', 'incident response'],
    nonResponsibilities: ['HQ customization', 'Industry Pack authoring'],
    userClasses: ['Admin Founder', 'operations staff'],
    coreWorkflows: ['monitor health', 'dispatch workforce', 'resolve incidents'],
    requiredTools: ['AI Workforce', 'Immune System', 'Observatory'],
    requiredCommandModules: ['global-operating-state', 'alerts', 'infrastructure-health', 'active-incidents'],
    requiredWorkbenchModules: ['deployment-controls', 'ai-workforce', 'queue-management', 'immune-system', 'diagnostics', 'budget-controls'],
    requiredPanels: ['health-grid', 'incident-feed'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT', 'STATUS_BAR'],
    handoffDestinations: ['ai-workforce-center', 'immune-system'],
    upstreamDependencies: ['immune-system'],
    downstreamDependencies: ['ai-workforce-center', 'observatory'],
    visualIdentity: 'executive command bridge',
    atmosphere: 'spaceship command bridge',
    architecturalMetaphor: 'command center bridge',
    availability: 'admin-only',
    healthRequirements: ['all-systems-nominal'],
    permitRequirements: [],
    lifecycleRules: ['global-scope-only'],
    mustInclude: [
      'mission wall',
      'city telemetry',
      'organization graph',
      'AI monitoring',
      'municipal command tables',
    ],
    neverInclude: ['reception desk', 'waiting lounge', 'ReceptionShell'],
  }),
  marketplace: charter('marketplace', {
    mission: 'Commerce district for industry packs, mods, and licensing.',
    responsibilities: ['commerce', 'listings', 'licensing displays'],
    nonResponsibilities: ['canonical architecture invention'],
    userClasses: ['Founder', 'creators'],
    coreWorkflows: ['browse', 'purchase', 'license'],
    requiredTools: ['Marketplace', 'Mod Registry'],
    requiredCommandModules: ['commerce-context'],
    requiredWorkbenchModules: ['storefront-tools'],
    requiredPanels: ['featured-mods'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT'],
    handoffDestinations: ['certification-center'],
    upstreamDependencies: ['certification-center'],
    downstreamDependencies: [],
    visualIdentity: 'commercial district with storefronts',
    atmosphere: 'bustling commerce plaza',
    architecturalMetaphor: 'marketplace district',
    availability: 'founder-accessible',
    healthRequirements: ['certification-clear'],
    permitRequirements: [],
    lifecycleRules: ['marketplace-eligible'],
    mustInclude: ['storefronts', 'licensing displays', 'creator kiosks', 'featured mods'],
    neverInclude: ['reception desk', 'waiting lounge', 'ReceptionShell'],
  }),
  'founder-suite': charter('founder-suite', {
    mission: 'Executive headquarters and monumental gathering space.',
    responsibilities: ['founder executive access', 'global founder tools'],
    nonResponsibilities: ['tenant HQ customization'],
    userClasses: ['Founder'],
    coreWorkflows: ['access', 'present', 'govern'],
    requiredTools: ['Founder Dashboard'],
    requiredCommandModules: ['founder-context'],
    requiredWorkbenchModules: ['founder-tools'],
    requiredPanels: ['executive-overview'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT'],
    handoffDestinations: ['founder-dashboard'],
    upstreamDependencies: [],
    downstreamDependencies: ['founder-dashboard'],
    visualIdentity: 'monumental executive atrium',
    atmosphere: 'premium executive headquarters',
    architecturalMetaphor: 'executive atrium',
    availability: 'founder-accessible',
    healthRequirements: ['founder-access'],
    permitRequirements: [],
    lifecycleRules: ['global-scope-only'],
    mustInclude: [
      'monumental central gathering space',
      'premium architecture',
      'executive circulation',
      'presentation areas',
    ],
    neverInclude: ['reception desk', 'concierge desk', 'waiting lounge'],
  }),
};

/** Default charter for departments without explicit charter yet. */
export function resolveDepartmentCharter(departmentId: CanonicalMainDepartmentId): DepartmentCharter {
  const existing = DEPARTMENT_CHARTERS[departmentId];
  if (existing) return existing;
  return charter(departmentId, {
    mission: `Operate canonical Studio World department: ${departmentId}.`,
    responsibilities: ['canonical infrastructure operation'],
    nonResponsibilities: ['tenant-specific ownership', 'founder company branding'],
    userClasses: ['Admin Founder', 'system workers'],
    coreWorkflows: ['generate', 'approve', 'publish'],
    requiredTools: ['Blueprint Author'],
    requiredCommandModules: ['department-context'],
    requiredWorkbenchModules: ['department-tools'],
    requiredPanels: ['department-panel'],
    requiredSockets: ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT'],
    handoffDestinations: ['creative-director-studio'],
    upstreamDependencies: [],
    downstreamDependencies: ['creative-director-studio'],
    visualIdentity: 'Studio World canonical department',
    atmosphere: 'premium executive interior',
    architecturalMetaphor: 'canonical department chamber',
    availability: 'admin-only',
    healthRequirements: ['architecture-law-001-pass'],
    permitRequirements: [],
    lifecycleRules: ['no-organization-ownership'],
  });
}
