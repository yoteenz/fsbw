import type { DockContextProfile } from './types';
import { canAccessStudioAdministration } from '../application/portfolio-access';
import { isStudioAdministrationPath } from '../application/routes';

function isPortfolioPath(pathname: string): boolean {
  return (
    isStudioAdministrationPath(pathname) ||
    pathname === '/admin/studio-os' ||
    pathname.startsWith('/admin/studio-os/')
  );
}

/** Context-aware command suggestions based on founder location in headquarters. */
export function resolveDockContext(pathname: string): DockContextProfile {
  const portfolioMode = isPortfolioPath(pathname) && canAccessStudioAdministration();

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
    return {
      contextId: 'mission-control',
      label: 'MISSION CONTROL',
      portfolioMode: false,
      suggestedCommands: [
        'What are today\'s priorities?',
        'Review today\'s content.',
        'Clear my afternoon.',
      ],
      commandTypes: ['executive-requests', 'scheduling', 'approvals', 'strategy'],
    };
  }

  return {
    contextId: 'headquarters',
    label: 'HEADQUARTERS',
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
