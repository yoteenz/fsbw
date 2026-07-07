import { ADMIN_STUDIO_BASE_PATH } from '../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_MODULES } from '../../utils/adminStudioNavigation';
import { STUDIO_OS_CORE_MODULES } from '../core/modules';
import { DOCUMENTATION_SYSTEM_REGISTRY } from '../documentation-sync/system-registry';
import { getAllRegistryEntries } from '../knowledge-registry/registration';
import type { SystemRegistryCategory, SystemRegistryEntry, SystemLifecycleStatus } from './types';

const PLATFORM_CREATED = '2026-01-01';
const PLATFORM_UPDATED = '2026-07-06';

function inferOwner(category: SystemRegistryCategory): string {
  switch (category) {
    case 'module':
    case 'feature':
      return 'Studio OS Platform';
    case 'concierge':
      return 'Concierge Layer';
    case 'service':
    case 'api':
      return 'Platform Infrastructure';
    case 'organization':
    case 'department':
      return 'Organization Context';
    default:
      return 'Studio OS Platform';
  }
}

function baseEntry(
  partial: Partial<SystemRegistryEntry> &
    Pick<SystemRegistryEntry, 'uniqueId' | 'officialName' | 'description' | 'category' | 'status' | 'version'>
): SystemRegistryEntry {
  return {
    owner: partial.owner ?? inferOwner(partial.category),
    createdDate: partial.createdDate ?? PLATFORM_CREATED,
    updatedDate: partial.updatedDate ?? PLATFORM_UPDATED,
    health: partial.health ?? 95,
    lifecycle: partial.lifecycle ?? partial.status,
    keywords: partial.keywords ?? [partial.uniqueId.replace(/-/g, ' '), partial.officialName.toLowerCase()],
    aliases: partial.aliases ?? [],
    permissions: partial.permissions ?? ['standard'],
    organizations: partial.organizations ?? ['all'],
    documentation: partial.documentation ?? [],
    dependencies: partial.dependencies ?? [],
    relatedSystems: partial.relatedSystems ?? [],
    ...partial,
  };
}

function moduleToEntry(mod: (typeof STUDIO_OS_CORE_MODULES)[number]): SystemRegistryEntry {
  const doc = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.moduleId === mod.id || s.id === mod.id);
  return baseEntry({
    uniqueId: `module:${mod.id}`,
    officialName: doc?.label ?? mod.label,
    description: doc?.overview ?? mod.description,
    category: 'module',
    dependencies: doc?.relatedSystems.slice(0, 3) ?? [],
    status: (doc ? 'live' : 'demo') as SystemLifecycleStatus,
    version: doc?.milestone ?? '1.0.0',
    permissions: ['standard'],
    relatedSystems: doc?.relatedSystems ?? [],
    documentation: doc ? [doc.docPath, doc.route ?? ''].filter(Boolean) : [`module:${mod.id}`],
    route: mod.routeSegment ? `${ADMIN_STUDIO_BASE_PATH}/${mod.routeSegment}` : undefined,
    moduleId: mod.id,
    milestone: doc?.milestone,
    keywords: doc?.searchKeywords ?? [mod.id.replace(/-/g, ' ')],
    aliases: doc?.aliases ?? [],
  });
}

function buildInfrastructureEntries(): SystemRegistryEntry[] {
  const entries: SystemRegistryEntry[] = [
    baseEntry({
      uniqueId: 'headquarters:mission-control',
      officialName: 'Headquarters / Mission Control',
      description: 'Executive nerve center — priorities, health, and navigation hub for Studio OS.',
      category: 'headquarters',
      dependencies: ['module:command-dock', 'module:studio-intelligence'],
      status: 'live',
      version: 'M83',
      relatedSystems: ['module:mission-control', 'module:organization-pulse'],
      documentation: ['docs/studio-os/executive-information-architecture.md'],
      route: `${ADMIN_STUDIO_BASE_PATH}/mission-control`,
    }),
    baseEntry({
      uniqueId: 'headquarters:executive-strategy-floor',
      officialName: 'Executive Strategy Floor™',
      description:
        'Planned meta-headquarters for Studio OS itself — immersive departmental environment for constitution, knowledge, systems, architecture, engineering excellence, QA, release readiness, roadmap, design system, and design revisions (DR-005). Registration only.',
      category: 'headquarters',
      dependencies: ['DR-005', 'module:knowledge-registry', 'module:system-registry', 'module:manifest-reconciliation'],
      status: 'planned',
      version: 'DR-005',
      relatedSystems: [
        'DR-005',
        'module:knowledge-registry',
        'module:system-registry',
        'module:engineering-excellence-dashboard',
        'module:qa-headquarters',
        'module:release-readiness',
        'module:component-registry',
        'module:design-token-engine',
        'module:studio-intelligence-architecture',
      ],
      documentation: ['docs/studio-os/master-spec/design-revisions.yaml', 'docs/studio-os/master-spec/MASTER_SPEC_INDEX.md'],
      moduleId: 'executive-strategy-floor',
      keywords: ['executive strategy floor', 'studio os headquarters', 'platform executive', 'meta headquarters', 'DR-005'],
      aliases: ['Studio OS Headquarters', 'Platform Executive HQ', 'Executive Strategy Floor'],
    }),
    baseEntry({
      uniqueId: 'concierge:chief-concierge',
      officialName: 'Chief Concierge',
      description: 'Primary digital concierge — routes commands, answers platform questions, proactive guidance.',
      category: 'concierge',
      dependencies: ['module:command-dock', 'module:concierge-routing'],
      status: 'live',
      version: '1.0.0',
      relatedSystems: ['module:command-dock', 'module:concierge-layer'],
      permissions: ['standard', 'executive'],
    }),
    baseEntry({
      uniqueId: 'concierge:chief-of-staff',
      officialName: 'Chief of Staff Concierge',
      description: 'Executive coordination concierge — prioritization, briefing, leadership team alignment.',
      category: 'concierge',
      dependencies: ['module:chief-of-staff', 'module:executive-council'],
      status: 'live',
      version: '1.0.0',
      relatedSystems: ['module:executive-organization'],
      permissions: ['executive'],
    }),
    baseEntry({
      uniqueId: 'service:studio-intelligence-layer',
      officialName: 'Studio Intelligence Layer',
      description: 'Model-agnostic intelligence pipeline — retrieve, rank, trust, scope, memory, validate, route.',
      category: 'service',
      dependencies: ['module:studio-intelligence-architecture', 'module:model-orchestrator'],
      status: 'live',
      version: 'M122',
      relatedSystems: ['module:profession-brain', 'module:memory-engine'],
      documentation: ['docs/studio-os/studio-intelligence-architecture.md'],
    }),
    baseEntry({
      uniqueId: 'api:profile-image',
      officialName: 'Profile Image API',
      description: 'POST /api/profile-image — uploads profile images to Supabase Storage.',
      category: 'api',
      dependencies: ['service:supabase-auth'],
      status: 'live',
      version: '1.0.0',
      documentation: ['docs/PROFILES_COLUMNS_AND_APP_MAPPING.md'],
      permissions: ['authenticated'],
    }),
    baseEntry({
      uniqueId: 'automation:boundary-sync',
      officialName: 'Organization Boundary Sync',
      description: 'Syncs all Studio OS module profiles when organization context changes.',
      category: 'automation',
      dependencies: ['service:organization-context'],
      status: 'live',
      version: '1.0.0',
      relatedSystems: ['module:organization-inauguration'],
      componentPath: 'src/studio-os-core/organization-context/boundary-sync.ts',
    }),
    baseEntry({
      uniqueId: 'workflow:getting-started',
      officialName: 'Getting Started Progression',
      description: 'Progressive onboarding from organization setup through organizational consciousness.',
      category: 'workflow',
      dependencies: ['module:business-discovery-blueprint', 'module:profession-brain'],
      status: 'live',
      version: 'M125',
      documentation: ['docs/studio-os/documentation-sync.md'],
    }),
    baseEntry({
      uniqueId: 'policy:professional-trust',
      officialName: 'Professional Trust Policy',
      description: 'Regulated workflow scope validation — legal, medical, financial guardrails.',
      category: 'policy',
      dependencies: ['module:professional-trust-framework'],
      status: 'live',
      version: '1.0.0',
      permissions: ['professional-trust'],
    }),
    baseEntry({
      uniqueId: 'permission:executive',
      officialName: 'Executive Permission',
      description: 'Access to executive modules, council, succession, and strategic intelligence.',
      category: 'permission',
      status: 'live',
      version: '1.0.0',
      relatedSystems: ['module:executive-council', 'module:succession-mode'],
    }),
    baseEntry({
      uniqueId: 'event:organization-boundary-changed',
      officialName: 'Organization Boundary Changed',
      description: 'Dispatched when organization context updates — triggers module profile resync.',
      category: 'event',
      dependencies: ['automation:boundary-sync'],
      status: 'live',
      version: '1.0.0',
    }),
    baseEntry({
      uniqueId: 'knowledge-product:institute-course',
      officialName: 'Studio Institute Course',
      description: 'Learning product generated from Profession Brain™ and Documentation Registry™.',
      category: 'knowledge-product',
      dependencies: ['module:studio-institute', 'module:knowledge-registry'],
      status: 'live',
      version: '1.0.0',
    }),
    baseEntry({
      uniqueId: 'marketplace-asset:expert-pack',
      officialName: 'Expert Marketplace Pack',
      description: 'Shareable expertise pack — optional marketplace asset with attribution.',
      category: 'marketplace-asset',
      dependencies: ['module:expert-marketplace', 'module:legacy-network'],
      status: 'live',
      version: '1.0.0',
    }),
    baseEntry({
      uniqueId: 'sdk-plugin:workspace-adapter',
      officialName: 'Workspace Data Adapter',
      description: 'SDK plugin pattern for workspace-specific data without polluting Core.',
      category: 'sdk-plugin',
      dependencies: ['module:ecosystem'],
      status: 'live',
      version: '1.0.0',
      documentation: ['docs/studio-os/EXTENSIBILITY.md'],
    }),
    baseEntry({
      uniqueId: 'prompt-template:command-dock',
      officialName: 'Command Dock Prompt Template',
      description: 'Natural language command routing template for Chief Concierge.',
      category: 'prompt-template',
      dependencies: ['module:command-dock', 'concierge:chief-concierge'],
      status: 'live',
      version: '1.0.0',
    }),
    baseEntry({
      uniqueId: 'organization:workspace',
      officialName: 'Organization Workspace',
      description: 'Tenant-scoped organization instance — all module profiles keyed by workspace ID.',
      category: 'organization',
      dependencies: ['service:organization-context'],
      status: 'live',
      version: '1.0.0',
      documentation: ['docs/studio-os/workspace-system.md'],
    }),
    baseEntry({
      uniqueId: 'department:executive',
      officialName: 'Executive Department',
      description: 'Leadership department — council, CoS, founder operating system, pulse.',
      category: 'department',
      dependencies: ['module:executive-organization'],
      status: 'live',
      version: '1.0.0',
      relatedSystems: ['module:executive-council', 'module:organization-pulse'],
    }),
  ];

  for (const nav of ADMIN_STUDIO_MODULES.filter((m) => m.status === 'live').slice(0, 20)) {
    entries.push(
      baseEntry({
        uniqueId: `page:${nav.id}`,
        officialName: nav.title,
        description: nav.purpose,
        category: 'page',
        dependencies: nav.moduleKey ? [`module:${nav.moduleKey}`] : [],
        status: 'live',
        version: nav.metric ?? '1.0.0',
        route: nav.route,
        moduleId: nav.moduleKey,
        milestone: nav.metric,
        relatedSystems: nav.moduleKey ? [`module:${nav.moduleKey}`] : [],
      })
    );
  }

  for (const nav of ADMIN_STUDIO_MODULES.filter((m) => m.moduleKey && m.route)) {
    entries.push(
      baseEntry({
        uniqueId: `route:${nav.moduleKey ?? nav.id}`,
        officialName: `${nav.title} Route`,
        description: `Admin route for ${nav.title}`,
        category: 'route',
        dependencies: [`page:${nav.id}`],
        status: 'live',
        version: '1.0.0',
        route: nav.route,
        moduleId: nav.moduleKey,
      })
    );
  }

  const panelModules = [
    'knowledge-registry',
    'documentation-governance',
    'studio-foundation-models',
    'model-orchestrator',
    'legacy-network',
  ];
  for (const modId of panelModules) {
    entries.push(
      baseEntry({
        uniqueId: `panel:mission-control-${modId}`,
        officialName: `Mission Control ${modId.replace(/-/g, ' ').toUpperCase()} Panel`,
        description: `Legacy Wing preview panel for ${modId}.`,
        category: 'panel',
        dependencies: [`module:${modId}`, 'headquarters:mission-control'],
        status: 'live',
        version: '1.0.0',
        moduleId: modId,
        componentPath: `src/components/admin/studio/mission-control/MissionControl${modId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Panel.tsx`,
      })
    );
  }

  return entries;
}

/** Build master registry from Core modules, documentation registry, navigation, and platform infrastructure. */
export function buildSystemRegistry(): SystemRegistryEntry[] {
  const byId = new Map<string, SystemRegistryEntry>();

  for (const mod of STUDIO_OS_CORE_MODULES) {
    byId.set(`module:${mod.id}`, moduleToEntry(mod));
  }

  for (const docEntry of getAllRegistryEntries()) {
    const existing = byId.get(`module:${docEntry.internalId}`);
    if (existing) {
      byId.set(`module:${docEntry.internalId}`, {
        ...existing,
        officialName: docEntry.officialName,
        description: docEntry.description,
        dependencies: docEntry.dependencies,
        relatedSystems: docEntry.relatedSystems,
        documentation: [...existing.documentation, ...docEntry.documentationLinks],
        version: docEntry.version,
        updatedDate: docEntry.lastUpdated,
        health: 96,
        keywords: [...existing.keywords, ...docEntry.keywords],
        aliases: [...existing.aliases, ...docEntry.aliases],
      });
    } else {
      byId.set(`feature:${docEntry.internalId}`, baseEntry({
        uniqueId: `feature:${docEntry.internalId}`,
        officialName: docEntry.officialName,
        description: docEntry.description,
        category: 'feature',
        dependencies: docEntry.dependencies,
        status: docEntry.status as SystemLifecycleStatus,
        version: docEntry.version,
        permissions: docEntry.requiredPermissions,
        relatedSystems: docEntry.relatedSystems,
        documentation: docEntry.documentationLinks,
        route: docEntry.route,
        moduleId: docEntry.moduleId,
        milestone: docEntry.milestone,
        keywords: docEntry.keywords,
        aliases: docEntry.aliases,
        updatedDate: docEntry.lastUpdated,
      }));
    }
  }

  for (const infra of buildInfrastructureEntries()) {
    if (!byId.has(infra.uniqueId)) {
      byId.set(infra.uniqueId, infra);
    }
  }

  byId.set(
    'module:system-registry',
    baseEntry({
      uniqueId: 'module:system-registry',
      officialName: 'System Registry™',
      description: 'Master registry of every object, service, module, feature, and system inside Studio OS.',
      category: 'module',
      dependencies: ['module:documentation-governance', 'module:knowledge-registry'],
      status: 'live',
      version: 'M127',
      relatedSystems: ['module:knowledge-registry', 'module:command-dock', 'module:studio-intelligence'],
      documentation: ['docs/studio-os/system-registry.md'],
      route: `${ADMIN_STUDIO_BASE_PATH}/system-registry`,
      moduleId: 'system-registry',
      milestone: 'M127',
      keywords: ['system registry', 'master directory', 'master index', 'os directory'],
      aliases: ['master registry', 'platform registry', 'sr'],
    })
  );

  return [...byId.values()];
}

export function getSystemRegistryEntry(uniqueId: string): SystemRegistryEntry | undefined {
  return buildSystemRegistry().find((e) => e.uniqueId === uniqueId || e.moduleId === uniqueId);
}

export function listSystemsByCategory(category: SystemRegistryCategory): SystemRegistryEntry[] {
  return buildSystemRegistry().filter((e) => e.category === category);
}

export function getSystemRegistryCount(): number {
  return buildSystemRegistry().length;
}
