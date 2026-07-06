import { DOCUMENTATION_SYSTEM_REGISTRY } from '../documentation-sync/system-registry';
import type { DocumentationSystemEntry } from '../documentation-sync/types';
import type { DocumentationRegistryEntry, RegistryCategory, RegistryFeatureStatus } from './types';

function inferCategory(id: string): RegistryCategory {
  if (['business-discovery-blueprint', 'profession-brain', 'organization-genome', 'professional-trust-framework'].includes(id)) {
    return 'foundation';
  }
  if (id.includes('legacy') || id === 'succession-mode' || id === 'executive-timeline') return 'legacy';
  if (['studio-institute', 'knowledge-commerce', 'expert-marketplace'].includes(id)) return 'commerce';
  if (['executive-council', 'founder-operating-system', 'founder-cognitive-load', 'organization-pulse'].includes(id)) {
    return 'executive';
  }
  if (
    id.includes('intelligence') ||
    id.includes('orchestrator') ||
    id.includes('foundation-model') ||
    id.includes('memory') ||
    id.includes('consciousness') ||
    id.includes('anticipation') ||
    id.includes('ambient') ||
    id.includes('predictive') ||
    id.includes('autonomous') ||
    id.includes('world-knowledge') ||
    id === 'knowledge-confidence' ||
    id === 'command-dock'
  ) {
    return 'intelligence';
  }
  if (id === 'mission-control' || id === 'organization-operating-manual') return 'operations';
  return 'platform';
}

function inferStatus(milestone?: string): RegistryFeatureStatus {
  if (!milestone) return 'live';
  if (milestone.startsWith('M12')) return 'live';
  return 'live';
}

function inferOwner(category: RegistryCategory): string {
  switch (category) {
    case 'foundation':
      return 'Studio OS Platform';
    case 'intelligence':
      return 'Studio Intelligence Team';
    case 'legacy':
      return 'Legacy & Succession';
    case 'commerce':
      return 'Studio Institute';
    case 'executive':
      return 'Executive Council';
    default:
      return 'Studio OS Platform';
  }
}

function inferConcierges(id: string): string[] {
  if (id === 'command-dock') return ['Chief Concierge'];
  if (id.includes('executive') || id === 'organization-pulse') return ['Chief Concierge', 'Chief of Staff'];
  if (id.includes('legal') || id === 'professional-trust-framework') return ['Chief Concierge'];
  return ['Chief Concierge'];
}

function inferDepartments(category: RegistryCategory): string[] {
  switch (category) {
    case 'intelligence':
      return ['Intelligence', 'Executive'];
    case 'foundation':
      return ['Discovery', 'Operations'];
    case 'commerce':
      return ['Institute', 'Knowledge Commerce'];
    case 'legacy':
      return ['Legacy', 'Intelligence'];
    default:
      return ['Platform'];
  }
}

/** Expand M125 system registry entry into full Documentation Registry™ metadata. */
export function buildRegistryEntryFromSystem(sys: DocumentationSystemEntry): DocumentationRegistryEntry {
  const category = inferCategory(sys.id);
  const version = sys.milestone ?? '1.0.0';
  const releaseDate = '2026-07-06';
  const walkthroughRef = `walkthrough:${sys.id}`;
  const academyRef = `academy:lesson-${sys.id}`;

  return {
    officialName: sys.label,
    internalId: sys.id,
    category,
    description: sys.overview,
    purpose: sys.purpose,
    capabilities: sys.capabilities,
    dependencies: sys.relatedSystems.slice(0, 3),
    relatedSystems: sys.relatedSystems,
    status: inferStatus(sys.milestone),
    owner: inferOwner(category),
    version,
    releaseDate,
    lastUpdated: new Date().toISOString().slice(0, 10),
    associatedDepartments: inferDepartments(category),
    associatedConcierges: inferConcierges(sys.id),
    associatedWorkflows: sys.exampleWorkflows,
    supportedOrganizations: ['all'],
    requiredPermissions: sys.id.includes('trust') || sys.id.includes('legal') ? ['professional-trust'] : ['standard'],
    featureFlags: [],
    keywords: sys.searchKeywords,
    aliases: sys.aliases,
    searchSynonyms: [...sys.aliases, ...sys.searchKeywords.slice(0, 5)],
    documentationLinks: [sys.docPath, sys.route ? `route:${sys.route}` : ''].filter(Boolean),
    academyLessons: [academyRef],
    tutorialReferences: [`tutorial:${sys.id}`],
    walkthroughReferences: [walkthroughRef],
    tooltips: [`${sys.label} — ${sys.purpose.slice(0, 80)}`],
    faqReferences: [`faq:${sys.id}`],
    commandDockReferences: [`resolve:${sys.id}`, `explain ${sys.label}`],
    developerDocumentation: [`src/studio-os-core/${sys.moduleId ?? sys.id}/`, sys.docPath],
    architectureDocumentation: [sys.docPath, 'docs/studio-os/PLATFORM_ARCHITECTURE.md'],
    releaseNotes: sys.milestone ? [`${sys.milestone} — ${sys.label} V1.0`] : [],
    exampleWorkflows: sys.exampleWorkflows,
    relatedScreens: sys.route ? [sys.route] : [],
    relatedComponents: sys.moduleId ? [`${sys.moduleId}Workspace`, `MissionControl${sys.moduleId}Panel`] : [],
    futureMilestones: [],
    moduleId: sys.moduleId,
    route: sys.route,
    milestone: sys.milestone,
    docPath: sys.docPath,
  };
}

/** Build full registry from canonical system registry — single registration source. */
export function buildDocumentationRegistry(): DocumentationRegistryEntry[] {
  return DOCUMENTATION_SYSTEM_REGISTRY.map(buildRegistryEntryFromSystem);
}

export function getRegistryEntryById(internalId: string): DocumentationRegistryEntry | undefined {
  return buildDocumentationRegistry().find((e) => e.internalId === internalId || e.moduleId === internalId);
}

export function listRegistryEntriesByCategory(category: RegistryCategory): DocumentationRegistryEntry[] {
  return buildDocumentationRegistry().filter((e) => e.category === category);
}

export function getRegistryEntryCount(): number {
  return buildDocumentationRegistry().length;
}
