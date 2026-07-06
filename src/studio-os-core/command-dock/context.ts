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
    return {
      contextId: 'institute',
      label: 'STUDIO INSTITUTE',
      portfolioMode: false,
      suggestedCommands: [
        'Schedule executive learning session.',
        'Find mentorship time next week.',
      ],
      commandTypes: ['knowledge-search', 'meetings', 'strategy'],
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

  if (pathname.includes('/expansion-center')) {
    return {
      contextId: 'expansion-center',
      label: 'EXPANSION CENTER · GROW HEADQUARTERS',
      portfolioMode: false,
      suggestedCommands: [
        'I want to start posting educational painting videos.',
        'Recommend an expansion pack for my industry.',
        'What departments can I add to Headquarters?',
        'Install Creator Studio.',
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
    const suggestions =
      activeOrg.tenantId === 'ndxbook'
        ? [
            'Help me connect Instagram.',
            'Create Page 001 for NDXBOOK.',
            'What is my next founder milestone?',
            ...industrySuggestions.slice(0, 1),
          ]
        : [
            ...industrySuggestions.slice(0, 2),
            'What are today\'s priorities?',
            'Review today\'s content.',
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
