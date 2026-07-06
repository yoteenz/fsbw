import type { DockContextProfile } from './types';
import { canAccessStudioAdministration } from '../application/portfolio-access';
import { isStudioAdministrationPath } from '../application/routes';
import { STUDIO_ADMINISTRATION_ROUTES } from '../application/routes';
import { loadWorkspace } from '../workspace/loader';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import { resolveModuleTenantId } from '../workspace/tenant-ids';
import {
  ensureOrganizationArchitectureProfile,
  listDockExpansionSuggestions,
} from '../industry-architecture';
import { listExecutiveGrowthSuggestions } from '../monetization-architecture';
import { listDiscoveryDockSuggestions } from '../business-discovery-blueprint';
import { listProfessionBrainDockSuggestions } from '../profession-brain';
import { listExpertMarketplaceDockSuggestions } from '../expert-marketplace';
import { listStudioInstituteDockSuggestions } from '../studio-institute';
import { listKnowledgeCommerceDockSuggestions } from '../knowledge-commerce';
import { listProfessionalTrustDockSuggestions } from '../professional-trust-framework';
import { listOrganizationGenomeDockSuggestions } from '../organization-genome';
import { listMemoryEngineDockSuggestions } from '../memory-engine';
import { listCompanyHealthIndexDockSuggestions } from '../company-health-index';
import { listSuccessionModeDockSuggestions } from '../succession-mode';
import { listExecutiveCouncilDockSuggestions } from '../executive-council';
import { listOrganizationPulseDockSuggestions } from '../organization-pulse';
import { listWisdomCaptureDockSuggestions } from '../wisdom-capture';
import { listShadowModeDockSuggestions } from '../shadow-mode';
import { listDigitalTwinDockSuggestions } from '../organization-digital-twin';
import { listSimulationLabDockSuggestions } from '../business-simulation-lab';
import { listKnowledgeConfidenceDockSuggestions } from '../knowledge-confidence';
import { listLegacyVaultDockSuggestions } from '../legacy-vault';
import { listAmbientAwarenessDockSuggestions } from '../ambient-awareness';

function isPortfolioPath(pathname: string): boolean {
  return (
    isStudioAdministrationPath(pathname) ||
    pathname === '/admin/studio-os' ||
    pathname.startsWith('/admin/studio-os/')
  );
}

function activeOrganizationLabel(): { name: string; tenantId: ReturnType<typeof resolveModuleTenantId> } {
  const workspaceId = getRuntimeActiveWorkspaceId();
  const loaded = loadWorkspace(workspaceId);
  return {
    name: loaded?.schema.displayName ?? 'HEADQUARTERS',
    tenantId: resolveModuleTenantId(workspaceId),
  };
}

/** Context-aware command suggestions based on founder location in headquarters. */
export function resolveDockContext(pathname: string): DockContextProfile {
  const portfolioMode = isPortfolioPath(pathname) && canAccessStudioAdministration();
  const activeOrg = activeOrganizationLabel();

  if (pathname === STUDIO_ADMINISTRATION_ROUTES.commandCenter || pathname.endsWith('/command-center')) {
    return {
      contextId: 'studio-command-center',
      label: 'STUDIO COMMAND CENTER · PORTFOLIO',
      portfolioMode: true,
      suggestedCommands: [
        'Which organizations need attention today?',
        'Summarize portfolio revenue this month.',
        'Show global AI activity across all companies.',
      ],
      commandTypes: ['strategy', 'analytics', 'revenue', 'organization-settings'],
    };
  }

  if (portfolioMode) {
    return {
      contextId: 'portfolio',
      label: 'STUDIO ADMINISTRATION · PORTFOLIO',
      portfolioMode: true,
      suggestedCommands: [
        'Move every product launch back one week.',
        'Show portfolio publishing load this week.',
        'Which organizations have conflicts tomorrow?',
      ],
      commandTypes: ['scheduling', 'publishing', 'campaigns', 'organization-settings', 'strategy'],
    };
  }

  if (pathname.includes('/production-studio') || pathname.includes('/render-queue')) {
    return {
      contextId: 'production',
      label: 'PRODUCTION STUDIO',
      portfolioMode: false,
      suggestedCommands: [
        'Prepare launch assets.',
        'Review render queue priorities.',
        'Schedule a photoshoot.',
      ],
      commandTypes: ['production', 'creative-requests', 'scheduling'],
    };
  }

  if (pathname.includes('/screening-room') || pathname.includes('/concierge-approval')) {
    return {
      contextId: 'review',
      label: 'SCREENING & REVIEW',
      portfolioMode: false,
      suggestedCommands: [
        'Review today\'s content.',
        'Approve Version B for publishing.',
        'Request changes on hero cut.',
      ],
      commandTypes: ['approvals', 'creative-requests', 'publishing'],
    };
  }

  if (pathname.includes('/design-dna-canon')) {
    return {
      contextId: 'design-dna',
      label: 'DESIGN DNA & CANON',
      portfolioMode: false,
      suggestedCommands: [
        'Review canon page relationships for Build-A-Wig.',
        'Run headquarters design review on mobile showroom.',
        'Which pages are protected canon references?',
      ],
      commandTypes: ['creative-requests', 'knowledge-search', 'strategy'],
    };
  }

  if (pathname.includes('/design-genome')) {
    return {
      contextId: 'design-genome',
      label: 'DESIGN GENOME',
      portfolioMode: false,
      suggestedCommands: [
        'Does the genome contain an approved hero for this page?',
        'Promote this timeline into the Design Genome.',
        'Show inheritance lineage for client profile patterns.',
      ],
      commandTypes: ['creative-requests', 'knowledge-search', 'strategy'],
    };
  }

  if (pathname.includes('/studio-institute') || pathname.includes('/organizational-apprenticeship')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'institute',
      label: 'STUDIO INSTITUTE™ · LEARN FROM EXPERTISE',
      portfolioMode: false,
      suggestedCommands: listStudioInstituteDockSuggestions(workspaceId),
      commandTypes: ['knowledge-search', 'meetings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/revenue') || pathname.includes('/business-model')) {
    return {
      contextId: 'revenue',
      label: 'REVENUE',
      portfolioMode: false,
      suggestedCommands: [
        'Summarize revenue pacing this month.',
        'Flag campaigns affecting margin.',
      ],
      commandTypes: ['revenue', 'analytics', 'campaigns'],
    };
  }

  if (pathname.includes('/publishing') || pathname.includes('/distribution')) {
    return {
      contextId: 'publishing',
      label: 'PUBLISHING',
      portfolioMode: false,
      suggestedCommands: [
        'Generate tomorrow\'s publishing schedule.',
        'Pause publishing while I\'m out of town.',
        'Find the best day to post the first NDXBOOK video.',
      ],
      commandTypes: ['publishing', 'campaigns', 'scheduling'],
    };
  }

  if (pathname.includes('/legacy-vault')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'legacy-vault',
      label: 'LEGACY VAULT™ · PRESERVE THE STORY',
      portfolioMode: false,
      suggestedCommands: listLegacyVaultDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/ambient-awareness')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'ambient-awareness',
      label: 'AMBIENT AWARENESS™ · ALREADY AWARE',
      portfolioMode: false,
      suggestedCommands: listAmbientAwarenessDockSuggestions(workspaceId),
      commandTypes: ['executive-requests', 'strategy', 'organization-settings'],
    };
  }

  if (pathname.includes('/knowledge-confidence')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'knowledge-confidence',
      label: 'KNOWLEDGE CONFIDENCE™ · TRUST THROUGH TRANSPARENCY',
      portfolioMode: false,
      suggestedCommands: listKnowledgeConfidenceDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/business-simulation-lab')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'business-simulation-lab',
      label: 'SIMULATION LAB™ · PRACTICE TOMORROW',
      portfolioMode: false,
      suggestedCommands: listSimulationLabDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/organization-digital-twin')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'organization-digital-twin',
      label: 'DIGITAL TWIN™ · EXPLORE BEFORE ACTING',
      portfolioMode: false,
      suggestedCommands: listDigitalTwinDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/shadow-mode')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'shadow-mode',
      label: 'SHADOW MODE™ · OBSERVE BEFORE ACTING',
      portfolioMode: false,
      suggestedCommands: listShadowModeDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/wisdom-capture')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'wisdom-capture',
      label: 'WISDOM CAPTURE™ · PRESERVE INSIGHTS',
      portfolioMode: false,
      suggestedCommands: listWisdomCaptureDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/organization-pulse')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'organization-pulse',
      label: 'ORGANIZATION PULSE™ · HOW WE FEEL',
      portfolioMode: false,
      suggestedCommands: listOrganizationPulseDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/executive-council')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'executive-council',
      label: 'EXECUTIVE COUNCIL™ · COLLABORATIVE LEADERSHIP',
      portfolioMode: false,
      suggestedCommands: listExecutiveCouncilDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/succession-mode')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'succession-mode',
      label: 'SUCCESSION MODE™ · PRESERVE LEGACY',
      portfolioMode: false,
      suggestedCommands: listSuccessionModeDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/company-health-index')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'company-health-index',
      label: 'COMPANY HEALTH INDEX™ · ORGANIZATIONAL HEALTH',
      portfolioMode: false,
      suggestedCommands: listCompanyHealthIndexDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/memory-engine')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'memory-engine',
      label: 'MEMORY ENGINE™ · REMEMBER FOREVER',
      portfolioMode: false,
      suggestedCommands: listMemoryEngineDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/organization-genome')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'organization-genome',
      label: 'ORGANIZATION GENOME™ · IDENTITY LAYER',
      portfolioMode: false,
      suggestedCommands: listOrganizationGenomeDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/professional-trust-framework')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'professional-trust-framework',
      label: 'PROFESSIONAL TRUST FRAMEWORK™ · RESPONSIBLE GUIDANCE',
      portfolioMode: false,
      suggestedCommands: listProfessionalTrustDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'executive-requests', 'strategy'],
    };
  }

  if (pathname.includes('/knowledge-commerce')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'knowledge-commerce',
      label: 'KNOWLEDGE COMMERCE™ · MONETIZE KNOWLEDGE',
      portfolioMode: false,
      suggestedCommands: listKnowledgeCommerceDockSuggestions(workspaceId),
      commandTypes: ['revenue', 'organization-settings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/expert-marketplace')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'expert-marketplace',
      label: 'EXPERT MARKETPLACE™ · SHARE EXPERTISE',
      portfolioMode: false,
      suggestedCommands: listExpertMarketplaceDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/profession-brain')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    return {
      contextId: 'profession-brain',
      label: 'PROFESSION BRAIN™ · INSTITUTIONAL INTELLIGENCE',
      portfolioMode: false,
      suggestedCommands: listProfessionBrainDockSuggestions(workspaceId),
      commandTypes: ['organization-settings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/organization-inauguration')) {
    return {
      contextId: 'organization-inauguration',
      label: 'ORGANIZATION INAUGURATION · FOUNDER CEREMONY',
      portfolioMode: false,
      suggestedCommands: [
        'What is in our Organization Charter?',
        'Show me the founding timeline.',
        'What are our first recommendations?',
      ],
      commandTypes: ['organization-settings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/business-discovery-blueprint')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    const discoverySuggestions = listDiscoveryDockSuggestions(workspaceId);
    return {
      contextId: 'business-discovery-blueprint',
      label: 'BUSINESS DISCOVERY BLUEPRINT™ · ORGANIZATIONAL ARCHAEOLOGY',
      portfolioMode: false,
      suggestedCommands: discoverySuggestions,
      commandTypes: ['organization-settings', 'strategy', 'executive-requests'],
    };
  }

  if (pathname.includes('/expansion-center')) {
    const workspaceId = getRuntimeActiveWorkspaceId();
    const growthSuggestions = listExecutiveGrowthSuggestions(workspaceId);
    return {
      contextId: 'expansion-center',
      label: 'EXPANSION CENTER · GROW HEADQUARTERS',
      portfolioMode: false,
      suggestedCommands: [
        ...growthSuggestions.slice(0, 2),
        'What is our Digital Payroll this month?',
        'Which Digital Staff should we activate next?',
      ],
      commandTypes: ['organization-settings', 'strategy', 'production', 'publishing'],
    };
  }

  if (pathname.includes('/executive-timeline')) {
    return {
      contextId: 'timeline',
      label: 'EXECUTIVE TIMELINE',
      portfolioMode: false,
      suggestedCommands: [
        'Move tomorrow\'s meeting.',
        'Block Friday morning for strategy.',
        'Move everything affected.',
      ],
      commandTypes: ['scheduling', 'meetings', 'personal-life', 'travel'],
    };
  }

  if (pathname.includes('/mission-control') || pathname.endsWith('/studio')) {
    const hqLabel =
      activeOrg.tenantId === 'ndxbook'
        ? 'NDXBOOK HEADQUARTERS'
        : `${activeOrg.name.toUpperCase()} HEADQUARTERS`;
    const workspaceId = getRuntimeActiveWorkspaceId();
    const archProfile = ensureOrganizationArchitectureProfile(workspaceId);
    const industrySuggestions = listDockExpansionSuggestions(archProfile.industryId);
    const growthSuggestions = listExecutiveGrowthSuggestions(workspaceId);
    const discoverySuggestions = listDiscoveryDockSuggestions(workspaceId);
    const brainSuggestions = listProfessionBrainDockSuggestions(workspaceId);
    const suggestions =
      activeOrg.tenantId === 'ndxbook'
        ? [
            'Help me connect Instagram.',
            'Create Page 001 for NDXBOOK.',
            ...brainSuggestions.slice(0, 1),
            ...discoverySuggestions.slice(0, 1),
            ...growthSuggestions.slice(0, 1),
          ]
        : [
            ...brainSuggestions.slice(0, 1),
            ...discoverySuggestions.slice(0, 1),
            ...growthSuggestions.slice(0, 1),
            ...industrySuggestions.slice(0, 1),
          ];
    return {
      contextId: 'mission-control',
      label: hqLabel,
      portfolioMode: false,
      suggestedCommands: suggestions,
      commandTypes: ['executive-requests', 'scheduling', 'approvals', 'strategy'],
    };
  }

  return {
    contextId: 'headquarters',
    label: `${activeOrg.name.toUpperCase()} HEADQUARTERS`,
    portfolioMode: false,
    suggestedCommands: [
      'Move tomorrow\'s meeting.',
      'Delay Noir by two weeks.',
      'Find time for a vacation.',
    ],
    commandTypes: ['scheduling', 'campaigns', 'publishing', 'strategy', 'personal-life'],
  };
}

export function greetingForFounder(firstName: string): string {
  const h = new Date().getHours();
  const period = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return `Good ${period}, ${firstName}.`;
}
