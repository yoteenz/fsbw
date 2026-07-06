import { ADMIN_STUDIO_BASE_PATH } from '../../utils/adminStudioRoutes';
import { DOCUMENTATION_SYSTEM_REGISTRY } from './system-registry';

type PageGuideOverride = {
  purpose?: string;
  whyItExists?: string;
  whenToUse?: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
  relatedPages?: Array<{ label: string; route: string; kind?: string }>;
  exampleWorkflows?: string[];
  relatedAssets?: string[];
  ownersManualChapter?: string;
  tourSteps?: string[];
  contextualHint?: string;
};

/** Rich page guides synced from documentation registry — replaces generic boilerplate. */
function fromSystem(systemId: string, extra?: PageGuideOverride): PageGuideOverride {
  const sys = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.id === systemId);
  if (!sys) return extra ?? {};
  return {
    purpose: sys.purpose,
    whyItExists: sys.overview,
    whenToUse: sys.whenUsed,
    bestPractices: [
      `Understand ${sys.label} purpose before relying on automation`,
      'Use Command Dock for contextual questions about this module',
      `Review related systems: ${sys.relatedSystems.slice(0, 3).join(', ')}`,
    ],
    commonMistakes: [
      'Skipping foundational setup before using advanced features',
      'Treating Studio OS modules as generic SaaS tools',
      'Ignoring Professional Trust Framework on regulated workflows',
    ],
    exampleWorkflows: sys.exampleWorkflows,
    relatedPages: sys.relatedSystems
      .slice(0, 4)
      .map((id) => {
        const rel = DOCUMENTATION_SYSTEM_REGISTRY.find((s) => s.id === id);
        return rel?.route ? { label: rel.label, route: rel.route } : null;
      })
      .filter(Boolean) as PageGuideOverride['relatedPages'],
    ownersManualChapter: `CHAPTER · ${sys.label.toUpperCase()}`,
    tourSteps: [
      `Welcome to ${sys.label}`,
      sys.purpose,
      sys.howItWorks,
      'Review related systems in Knowledge Graph',
      'Return to Mission Control when ready',
    ],
    contextualHint: sys.milestone ? `${sys.milestone} · ${sys.label} — press ⓘ for walkthrough` : undefined,
    ...extra,
  };
}

export const DOCUMENTATION_PAGE_GUIDE_OVERRIDES: Partial<Record<string, PageGuideOverride>> = {
  'business-discovery-blueprint': fromSystem('business-discovery-blueprint'),
  'profession-brain': fromSystem('profession-brain'),
  'organization-genome': fromSystem('organization-genome'),
  'professional-trust-framework': fromSystem('professional-trust-framework'),
  'memory-engine': fromSystem('memory-engine'),
  'knowledge-confidence': fromSystem('knowledge-confidence'),
  'executive-council': fromSystem('executive-council'),
  'organization-pulse': fromSystem('organization-pulse'),
  'succession-mode': fromSystem('succession-mode'),
  'legacy-vault': fromSystem('legacy-vault'),
  'studio-institute': fromSystem('studio-institute'),
  'expert-marketplace': fromSystem('expert-marketplace'),
  'knowledge-commerce': fromSystem('knowledge-commerce'),
  'command-dock': fromSystem('command-dock'),
  'ambient-awareness': fromSystem('ambient-awareness'),
  'anticipation-engine': fromSystem('anticipation-engine'),
  'founder-cognitive-load': fromSystem('founder-cognitive-load'),
  'presence-engine': fromSystem('presence-engine'),
  'relationship-memory': fromSystem('relationship-memory'),
  'predictive-organization': fromSystem('predictive-organization'),
  'autonomous-preparation': fromSystem('autonomous-preparation'),
  'organizational-consciousness': fromSystem('organizational-consciousness'),
  'executive-timeline': fromSystem('executive-timeline'),
  'world-knowledge-engine': fromSystem('world-knowledge-engine'),
  'founder-operating-system': fromSystem('founder-operating-system'),
  'studio-intelligence': fromSystem('studio-intelligence'),
  'studio-intelligence-architecture': fromSystem('studio-intelligence-architecture'),
  'model-orchestrator': fromSystem('model-orchestrator'),
  'studio-foundation-models': fromSystem('studio-foundation-models'),
  'organization-operating-manual': fromSystem('organization-operating-manual'),
  'legacy-network': fromSystem('legacy-network'),
  'documentation-sync': fromSystem('documentation-sync'),
  'documentation-registry': fromSystem('documentation-registry'),
  'documentation-governance': fromSystem('documentation-governance'),
  'system-registry': fromSystem('system-registry'),
  'component-registry': fromSystem('component-registry'),
  'design-token-engine': fromSystem('design-token-engine'),
  'interaction-engine': fromSystem('interaction-engine'),
  'event-bus': fromSystem('event-bus'),
  'automation-registry': fromSystem('automation-registry'),
  'prompt-registry': fromSystem('prompt-registry'),
  'policy-engine': fromSystem('policy-engine'),
  'permission-engine': fromSystem('permission-engine'),
  'workspace-runtime': fromSystem('workspace-runtime'),
  'plugin-sdk': fromSystem('plugin-sdk'),
  'workflow-engine': fromSystem('workflow-engine'),
  'state-engine': fromSystem('state-engine'),
  'asset-registry': fromSystem('asset-registry'),
  'mission-control': fromSystem('mission-control', {
    relatedPages: [
      { label: 'KNOWLEDGE HUB', route: `${ADMIN_STUDIO_BASE_PATH}/knowledge-hub` },
      { label: 'COMMAND DOCK', route: `${ADMIN_STUDIO_BASE_PATH}/command-dock` },
      { label: 'STUDIO INTELLIGENCE ARCHITECTURE', route: `${ADMIN_STUDIO_BASE_PATH}/studio-intelligence-architecture` },
    ],
  }),
};

export function getDocumentationPageGuideOverride(moduleId: string): PageGuideOverride | undefined {
  return DOCUMENTATION_PAGE_GUIDE_OVERRIDES[moduleId];
}
