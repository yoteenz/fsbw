/**
 * CanonicalStudioWorldDepartmentRegistry™ — first-class global department records.
 */

import type { DepartmentClass } from './department-classification';

export const CANONICAL_DEPARTMENT_REGISTRY_VERSION = 'canonical-department-registry.v1' as const;

export type CanonicalDepartmentCategoryId =
  | 'world-creation'
  | 'creative-production'
  | 'operations'
  | 'governance'
  | 'commerce'
  | 'founder';

export type CanonicalDepartmentLifecycleState =
  | 'DRAFT'
  | 'BLUEPRINT_READY'
  | 'RENDERING'
  | 'AWAITING_APPROVAL'
  | 'IN_CDS'
  | 'UNDER_CONSTRUCTION'
  | 'INSPECTION'
  | 'PUBLISHED'
  | 'DEGRADED'
  | 'NEEDS_REVISION';

export type CanonicalMainDepartmentId =
  | 'experience-lab'
  | 'blueprint-author'
  | 'world-compiler'
  | 'construction-mode'
  | 'creative-director-studio'
  | 'material-lab'
  | 'lighting-studio'
  | 'composition-studio'
  | 'animation-studio'
  | 'character-studio'
  | 'command-center'
  | 'ai-workforce-center'
  | 'asset-registry'
  | 'studio-world-registry'
  | 'observatory'
  | 'city-council'
  | 'permit-center'
  | 'quality-guard'
  | 'immune-system'
  | 'marketplace'
  | 'mod-registry'
  | 'certification-center'
  | 'founder-suite'
  | 'founder-dashboard'
  | 'founder-archive';

export type CanonicalDepartmentRecord = {
  departmentId: CanonicalMainDepartmentId;
  slug: string;
  name: string;
  category: CanonicalDepartmentCategoryId;
  purpose: string;
  canonicalRole: string;
  description: string;
  accessClass: 'studio-world-admin' | 'founder-read' | 'system';
  adminOnly: boolean;
  founderAccessible: boolean;
  systemAccessible: boolean;
  departmentClass: Extract<DepartmentClass, 'CANONICAL_STUDIO_WORLD_DEPARTMENT'>;
  blueprintTemplateId: string;
  blueprintRevision: number;
  founderRenderId: string | null;
  founderRenderRevision: number;
  constructionPlanId: string | null;
  constructionPlanRevision: number;
  commandDockProfile: string;
  workbenchProfile: string;
  socketProfile: string;
  materialLibraryId: string;
  lightingProfileId: string;
  compositionProfileId: string;
  departmentModelRoute: 'nano-banana-pro-full-scene';
  departmentPromptVersion: string;
  status: CanonicalDepartmentLifecycleState;
  lifecycleState: CanonicalDepartmentLifecycleState;
  publishedVersion: string | null;
  dependencies: string[];
  requiredCapabilities: string[];
  permittedActions: string[];
  marketplaceEligibility: boolean;
  routePath: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  registryVersion: typeof CANONICAL_DEPARTMENT_REGISTRY_VERSION;
  scope: 'studio-world-global';
};

export type CanonicalDepartmentCategory = {
  categoryId: CanonicalDepartmentCategoryId;
  displayName: string;
  description: string;
};

export const CANONICAL_DEPARTMENT_CATEGORIES: CanonicalDepartmentCategory[] = [
  { categoryId: 'world-creation', displayName: 'World Creation', description: 'Architecture, blueprints, compilation, construction.' },
  { categoryId: 'creative-production', displayName: 'Creative Production', description: 'Asset manufacturing and creative tooling.' },
  { categoryId: 'operations', displayName: 'Operations', description: 'Command, workforce, registries, observability.' },
  { categoryId: 'governance', displayName: 'Governance', description: 'Municipal, quality, immune enforcement.' },
  { categoryId: 'commerce', displayName: 'Commerce', description: 'Marketplace and certification.' },
  { categoryId: 'founder', displayName: 'Founder', description: 'Founder-facing global suites.' },
];

const NOW = '2026-07-13T00:00:00.000Z';

function record(
  partial: Omit<
    CanonicalDepartmentRecord,
    | 'departmentClass'
    | 'registryVersion'
    | 'scope'
    | 'createdAt'
    | 'updatedAt'
    | 'publishedAt'
    | 'status'
    | 'lifecycleState'
    | 'founderRenderId'
    | 'constructionPlanId'
    | 'publishedVersion'
    | 'blueprintRevision'
    | 'founderRenderRevision'
    | 'constructionPlanRevision'
    | 'departmentModelRoute'
    | 'marketplaceEligibility'
    | 'systemAccessible'
  > &
    Partial<Pick<CanonicalDepartmentRecord, 'status' | 'lifecycleState' | 'founderRenderId' | 'publishedVersion' | 'marketplaceEligibility'>>
): CanonicalDepartmentRecord {
  return {
    departmentClass: 'CANONICAL_STUDIO_WORLD_DEPARTMENT',
    registryVersion: CANONICAL_DEPARTMENT_REGISTRY_VERSION,
    scope: 'studio-world-global',
    createdAt: NOW,
    updatedAt: NOW,
    publishedAt: null,
    blueprintRevision: 1,
    founderRenderRevision: 0,
    constructionPlanRevision: 0,
    constructionPlanId: null,
    departmentModelRoute: 'nano-banana-pro-full-scene',
    marketplaceEligibility: false,
    systemAccessible: true,
    status: partial.status ?? 'DRAFT',
    lifecycleState: partial.lifecycleState ?? partial.status ?? 'DRAFT',
    founderRenderId: partial.founderRenderId ?? null,
    publishedVersion: partial.publishedVersion ?? null,
    ...partial,
  };
}

/** Seeded canonical main departments — rendered dynamically, not hardcoded in UI. */
export const CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY: CanonicalDepartmentRecord[] = [
  record({
    departmentId: 'experience-lab',
    slug: 'experience-lab',
    name: 'Experience Lab™',
    category: 'world-creation',
    purpose: 'Design canonical Studio World departments and official Industry Packs.',
    canonicalRole: 'master-architecture-department',
    description: 'Admin-only planning — canonical infrastructure and Industry Pack authoring.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-experience-lab-blueprint.v1',
    departmentPromptVersion: 'canonical-experience-lab-founder-render.v1',
    commandDockProfile: 'el-command-dock.v1',
    workbenchProfile: 'el-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['blueprint-author', 'world-compiler'],
    requiredCapabilities: ['architectural-planning', 'industry-pack-authoring'],
    permittedActions: ['generate', 'approve', 'publish'],
    routePath: '/admin/studio/experience-lab',
  }),
  record({
    departmentId: 'blueprint-author',
    slug: 'blueprint-author',
    name: 'Blueprint Author™',
    category: 'world-creation',
    purpose: 'Deterministic construction specifications.',
    canonicalRole: 'specification-authority',
    description: 'Blueprint Author orchestrates construction plans and socket metadata.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-blueprint-author.v1',
    departmentPromptVersion: 'canonical-blueprint-author-founder-render.v1',
    commandDockProfile: 'el-command-dock.v1',
    workbenchProfile: 'el-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['experience-lab'],
    requiredCapabilities: ['blueprint-authoring'],
    permittedActions: ['author', 'approve'],
    routePath: '/admin/studio/experience-lab',
  }),
  record({
    departmentId: 'world-compiler',
    slug: 'world-compiler',
    name: 'World Compiler™',
    category: 'world-creation',
    purpose: 'Living experience assembly.',
    canonicalRole: 'world-compiler',
    description: 'Compiles approved architecture into interactive Studio World runtime.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-world-compiler.v1',
    departmentPromptVersion: 'canonical-world-compiler-founder-render.v1',
    commandDockProfile: 'el-command-dock.v1',
    workbenchProfile: 'el-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['blueprint-author'],
    requiredCapabilities: ['world-compilation'],
    permittedActions: ['compile'],
    routePath: '/admin/studio/experience-engine',
  }),
  record({
    departmentId: 'construction-mode',
    slug: 'construction-mode',
    name: 'Construction Mode™',
    category: 'world-creation',
    purpose: 'Assembly-only manufacturing from approved assets.',
    canonicalRole: 'construction-assembly',
    description: 'Assembles approved departments — never invents architecture.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-construction-mode.v1',
    departmentPromptVersion: 'canonical-construction-mode-founder-render.v1',
    commandDockProfile: 'cm-command-dock.v1',
    workbenchProfile: 'cm-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['creative-director-studio'],
    requiredCapabilities: ['assembly'],
    permittedActions: ['assemble'],
    routePath: '/admin/studio/world/construction-mode',
  }),
  record({
    departmentId: 'creative-director-studio',
    slug: 'creative-director-studio',
    name: 'Creative Director Studio™',
    category: 'creative-production',
    purpose: 'Asset manufacturing on approved architecture.',
    canonicalRole: 'asset-manufacturing',
    description: 'Founder creative workspace — edits approved HQ, never invents canonical architecture.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-cds-blueprint.v1',
    departmentPromptVersion: 'canonical-creative-director-studio-founder-render.v1',
    commandDockProfile: 'cds-command-dock.v1',
    workbenchProfile: 'cds-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['experience-lab'],
    requiredCapabilities: ['asset-manufacturing', 'material-editing'],
    permittedActions: ['manufacture', 'customize'],
    routePath: '/admin/studio/department/creative-direction',
    status: 'BLUEPRINT_READY',
    lifecycleState: 'BLUEPRINT_READY',
  }),
  record({
    departmentId: 'material-lab',
    slug: 'material-lab',
    name: 'Material Lab™',
    category: 'creative-production',
    purpose: 'Global material intent and brand material governance.',
    canonicalRole: 'material-lab',
    description: 'Material profiles for canonical and HQ departments.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-material-lab.v1',
    departmentPromptVersion: 'canonical-material-lab-founder-render.v1',
    commandDockProfile: 'cds-command-dock.v1',
    workbenchProfile: 'cds-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['asset-registry'],
    requiredCapabilities: ['material-intent'],
    permittedActions: ['edit-materials'],
    routePath: '/admin/studio/brand-assets',
  }),
  record({
    departmentId: 'lighting-studio',
    slug: 'lighting-studio',
    name: 'Lighting Studio™',
    category: 'creative-production',
    purpose: 'Lighting profiles and validation.',
    canonicalRole: 'lighting-studio',
    description: 'Canonical lighting rigs and department lighting intent.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-lighting-studio.v1',
    departmentPromptVersion: 'canonical-lighting-studio-founder-render.v1',
    commandDockProfile: 'cds-command-dock.v1',
    workbenchProfile: 'cds-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: [],
    requiredCapabilities: ['lighting-intent'],
    permittedActions: ['edit-lighting'],
    routePath: '/admin/studio/studio-warehouse',
  }),
  record({
    departmentId: 'composition-studio',
    slug: 'composition-studio',
    name: 'Composition Studio™',
    category: 'creative-production',
    purpose: 'Device framing — not redesign.',
    canonicalRole: 'composition-studio',
    description: 'Multi-device composition from approved master landscape.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-composition-studio.v1',
    departmentPromptVersion: 'canonical-composition-studio-founder-render.v1',
    commandDockProfile: 'el-command-dock.v1',
    workbenchProfile: 'el-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['experience-lab'],
    requiredCapabilities: ['composition-pack'],
    permittedActions: ['recompose'],
    routePath: '/admin/studio/experience-lab',
  }),
  record({
    departmentId: 'animation-studio',
    slug: 'animation-studio',
    name: 'Animation Studio™',
    category: 'creative-production',
    purpose: 'Motion and animation production.',
    canonicalRole: 'animation-studio',
    description: 'Canonical animation department infrastructure.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-animation-studio.v1',
    departmentPromptVersion: 'canonical-animation-studio-founder-render.v1',
    commandDockProfile: 'cds-command-dock.v1',
    workbenchProfile: 'cds-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['creative-director-studio'],
    requiredCapabilities: ['animation'],
    permittedActions: ['animate'],
    routePath: '/admin/studio/studio-production',
  }),
  record({
    departmentId: 'character-studio',
    slug: 'character-studio',
    name: 'Character Studio™',
    category: 'creative-production',
    purpose: 'Character and talent layer production.',
    canonicalRole: 'character-studio',
    description: 'Canonical character production infrastructure.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-character-studio.v1',
    departmentPromptVersion: 'canonical-character-studio-founder-render.v1',
    commandDockProfile: 'cds-command-dock.v1',
    workbenchProfile: 'cds-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['creative-director-studio'],
    requiredCapabilities: ['character-production'],
    permittedActions: ['produce-characters'],
    routePath: '/admin/studio/casting',
  }),
  record({
    departmentId: 'command-center',
    slug: 'command-center',
    name: 'Command Center™',
    category: 'operations',
    purpose: 'Studio World executive bridge and operating state.',
    canonicalRole: 'command-center',
    description: 'Global operations command for Studio World infrastructure.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-command-center.v1',
    departmentPromptVersion: 'canonical-command-center-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['immune-system', 'ai-workforce-center'],
    requiredCapabilities: ['operations', 'incident-response'],
    permittedActions: ['monitor', 'deploy'],
    routePath: '/admin/studio/overview',
    status: 'BLUEPRINT_READY',
    lifecycleState: 'BLUEPRINT_READY',
  }),
  record({
    departmentId: 'ai-workforce-center',
    slug: 'ai-workforce-center',
    name: 'AI Workforce Center™',
    category: 'operations',
    purpose: 'Manufacturing workers and governed queues.',
    canonicalRole: 'ai-workforce',
    description: 'Global AI workforce orchestration.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-ai-workforce.v1',
    departmentPromptVersion: 'canonical-ai-workforce-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['command-center'],
    requiredCapabilities: ['worker-orchestration'],
    permittedActions: ['queue', 'dispatch'],
    routePath: '/admin/studio/render-queue',
  }),
  record({
    departmentId: 'asset-registry',
    slug: 'asset-registry',
    name: 'Asset Registry™',
    category: 'operations',
    purpose: 'Global asset registry vault.',
    canonicalRole: 'asset-registry',
    description: 'Canonical asset registry for Studio World.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-asset-registry.v1',
    departmentPromptVersion: 'canonical-asset-registry-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: [],
    requiredCapabilities: ['asset-registry'],
    permittedActions: ['register', 'browse'],
    routePath: '/admin/studio/asset-registry',
  }),
  record({
    departmentId: 'studio-world-registry',
    slug: 'studio-world-registry',
    name: 'Studio World Registry™',
    category: 'operations',
    purpose: 'Published canonical departments and infrastructure catalog.',
    canonicalRole: 'studio-world-registry',
    description: 'Registry of published canonical Studio World departments.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-studio-world-registry.v1',
    departmentPromptVersion: 'canonical-studio-world-registry-founder-render.v1',
    commandDockProfile: 'el-command-dock.v1',
    workbenchProfile: 'el-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['experience-lab'],
    requiredCapabilities: ['registry-publish'],
    permittedActions: ['publish', 'browse'],
    routePath: '/admin/studio/experience-lab',
  }),
  record({
    departmentId: 'observatory',
    slug: 'observatory',
    name: 'Observatory™',
    category: 'operations',
    purpose: 'Studio World observability and experience intelligence.',
    canonicalRole: 'observatory',
    description: 'Architecture and experience observability.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-observatory.v1',
    departmentPromptVersion: 'canonical-observatory-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['command-center'],
    requiredCapabilities: ['observability'],
    permittedActions: ['observe'],
    routePath: '/admin/studio/experience-observatory',
  }),
  record({
    departmentId: 'city-council',
    slug: 'city-council',
    name: 'City Council™',
    category: 'governance',
    purpose: 'Municipal governance and mod approval.',
    canonicalRole: 'city-council',
    description: 'Governance chamber for Studio World municipal operations.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-city-council.v1',
    departmentPromptVersion: 'canonical-city-council-founder-render.v1',
    commandDockProfile: 'council-command-dock.v1',
    workbenchProfile: 'council-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['permit-center'],
    requiredCapabilities: ['governance', 'voting'],
    permittedActions: ['review', 'approve-mods'],
    routePath: '/admin/studio/constitution-hall',
  }),
  record({
    departmentId: 'permit-center',
    slug: 'permit-center',
    name: 'Permit Center™',
    category: 'governance',
    purpose: 'Municipal construction permits.',
    canonicalRole: 'permit-office',
    description: 'Permit issuance and review for construction projects.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-permit-center.v1',
    departmentPromptVersion: 'canonical-permit-center-founder-render.v1',
    commandDockProfile: 'council-command-dock.v1',
    workbenchProfile: 'council-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: [],
    requiredCapabilities: ['permits'],
    permittedActions: ['submit-permit', 'review-permit'],
    routePath: '/admin/studio/constitution-hall',
  }),
  record({
    departmentId: 'quality-guard',
    slug: 'quality-guard',
    name: 'Quality Guard™',
    category: 'governance',
    purpose: 'Composition and asset parity enforcement.',
    canonicalRole: 'quality-guard',
    description: 'Quality gates for renders and manufacturing.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-quality-guard.v1',
    departmentPromptVersion: 'canonical-quality-guard-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['immune-system'],
    requiredCapabilities: ['quality-guard'],
    permittedActions: ['inspect', 'approve-quality'],
    routePath: '/admin/studio/qa-headquarters',
  }),
  record({
    departmentId: 'immune-system',
    slug: 'immune-system',
    name: 'Immune System™',
    category: 'governance',
    purpose: 'Routing and boundary enforcement including Architecture Law #001.',
    canonicalRole: 'immune-system',
    description: 'Platform immune system — model routing, AI UI detection, drift repair.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-immune-system.v1',
    departmentPromptVersion: 'canonical-immune-system-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: [],
    requiredCapabilities: ['immune-enforcement'],
    permittedActions: ['validate', 'reject'],
    routePath: '/admin/studio/governance',
  }),
  record({
    departmentId: 'marketplace',
    slug: 'marketplace',
    name: 'Marketplace™',
    category: 'commerce',
    purpose: 'Industry packs, departments, headquarters commerce.',
    canonicalRole: 'marketplace',
    description: 'Global marketplace infrastructure.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-marketplace.v1',
    departmentPromptVersion: 'canonical-marketplace-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['certification-center'],
    requiredCapabilities: ['commerce'],
    permittedActions: ['list', 'purchase'],
    routePath: '/admin/studio/marketplace',
    marketplaceEligibility: true,
  }),
  record({
    departmentId: 'mod-registry',
    slug: 'mod-registry',
    name: 'Mod Registry™',
    category: 'commerce',
    purpose: 'Approved mod catalog and attachment rules.',
    canonicalRole: 'mod-registry',
    description: 'Registry of approved mods for HQ customization.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-mod-registry.v1',
    departmentPromptVersion: 'canonical-mod-registry-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['city-council'],
    requiredCapabilities: ['mod-registry'],
    permittedActions: ['register-mod'],
    routePath: '/admin/studio/marketplace',
    marketplaceEligibility: true,
  }),
  record({
    departmentId: 'certification-center',
    slug: 'certification-center',
    name: 'Certification Center™',
    category: 'commerce',
    purpose: 'Certification and compliance for marketplace assets.',
    canonicalRole: 'certification-center',
    description: 'Certifies mods and marketplace listings.',
    accessClass: 'studio-world-admin',
    adminOnly: true,
    founderAccessible: false,
    blueprintTemplateId: 'canonical-certification-center.v1',
    departmentPromptVersion: 'canonical-certification-center-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['quality-guard'],
    requiredCapabilities: ['certification'],
    permittedActions: ['certify'],
    routePath: '/admin/studio/marketplace',
    marketplaceEligibility: true,
  }),
  record({
    departmentId: 'founder-suite',
    slug: 'founder-suite',
    name: 'Founder Suite™',
    category: 'founder',
    purpose: 'Founder executive suite and global founder tools.',
    canonicalRole: 'founder-suite',
    description: 'Global founder suite — not tenant HQ.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-founder-suite.v1',
    departmentPromptVersion: 'canonical-founder-suite-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: [],
    requiredCapabilities: ['founder-tools'],
    permittedActions: ['access'],
    routePath: '/admin/headquarters',
  }),
  record({
    departmentId: 'founder-dashboard',
    slug: 'founder-dashboard',
    name: 'Founder Dashboard™',
    category: 'founder',
    purpose: 'Founder operating dashboard.',
    canonicalRole: 'founder-dashboard',
    description: 'Executive founder dashboard infrastructure.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-founder-dashboard.v1',
    departmentPromptVersion: 'canonical-founder-dashboard-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['founder-suite'],
    requiredCapabilities: ['founder-dashboard'],
    permittedActions: ['view'],
    routePath: '/admin/dashboard',
  }),
  record({
    departmentId: 'founder-archive',
    slug: 'founder-archive',
    name: 'Founder Archive™',
    category: 'founder',
    purpose: 'Founder historical archive and legacy vault access.',
    canonicalRole: 'founder-archive',
    description: 'Archive infrastructure for founder legacy assets.',
    accessClass: 'founder-read',
    adminOnly: false,
    founderAccessible: true,
    blueprintTemplateId: 'canonical-founder-archive.v1',
    departmentPromptVersion: 'canonical-founder-archive-founder-render.v1',
    commandDockProfile: 'cc-command-dock.v1',
    workbenchProfile: 'cc-workbench.v1',
    socketProfile: 'default-department-ui-sockets.v1',
    materialLibraryId: 'studio-world-global-materials',
    lightingProfileId: 'studio-world-executive-lighting',
    compositionProfileId: 'master-landscape-21x9',
    dependencies: ['asset-registry'],
    requiredCapabilities: ['archive'],
    permittedActions: ['archive', 'browse'],
    routePath: '/admin/studio/legacy-system',
  }),
];

export function listCanonicalDepartmentsByCategory(
  categoryId: CanonicalDepartmentCategoryId
): CanonicalDepartmentRecord[] {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.filter((d) => d.category === categoryId);
}

export function getCanonicalDepartmentRecord(
  departmentId: CanonicalMainDepartmentId
): CanonicalDepartmentRecord | undefined {
  return CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.find((d) => d.departmentId === departmentId);
}

export function listCanonicalDepartmentTree(): Array<{
  category: CanonicalDepartmentCategory;
  departments: CanonicalDepartmentRecord[];
}> {
  return CANONICAL_DEPARTMENT_CATEGORIES.map((category) => ({
    category,
    departments: listCanonicalDepartmentsByCategory(category.categoryId),
  }));
}

export function assertCanonicalDepartmentNotOrganizationOwned(
  departmentId: string
): { ok: true; record: CanonicalDepartmentRecord } | { ok: false; code: string; message: string } {
  const record = CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.find((d) => d.departmentId === departmentId);
  if (!record) {
    return { ok: false, code: 'NOT_CANONICAL_DEPARTMENT', message: `${departmentId} is not a canonical Studio World department.` };
  }
  return { ok: true, record };
}
