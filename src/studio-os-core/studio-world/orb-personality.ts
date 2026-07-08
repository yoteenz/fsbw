/**
 * Studio Orb™ — personality shifts by flagship destination.
 * Same Orb. Different expertise.
 */

import type { StudioWorldFlagshipId } from './types';
import { FLAGSHIP_RESPONSIBILITY_LAWS } from './responsibility-framework';
import {
  CONSTITUTION_KEEPER_ACCENT,
  CONSTITUTION_KEEPER_GREETING,
  CONSTITUTION_KEEPER_ROLE,
} from '../studio-world-constitution/orb-keeper';
import {
  COLLABORATION_CURATOR_ACCENT,
  COLLABORATION_CURATOR_GREETING,
  COLLABORATION_CURATOR_ROLE,
} from '../collaborative-innovation-network/orb-curator';
import {
  INNOVATION_HISTORIAN_ACCENT,
  INNOVATION_HISTORIAN_GREETING,
  INNOVATION_HISTORIAN_ROLE,
} from '../innovation-lineage/orb-historian';
import {
  COSMIC_GUIDE_ACCENT,
  COSMIC_GUIDE_GREETING,
  COSMIC_GUIDE_ROLE,
} from '../innovation-constellations/cosmic-guide';
import {
  EXPEDITION_GUIDE_ACCENT,
  EXPEDITION_GUIDE_GREETING,
  EXPEDITION_GUIDE_ROLE,
} from '../innovation-expeditions/expedition-guide';

export type StudioWorldOrbPersonality = {
  flagshipId: StudioWorldFlagshipId;
  role: string;
  greeting: string;
  guidance: string;
  accent: string;
};

const ORB_PERSONALITIES: Record<StudioWorldFlagshipId, StudioWorldOrbPersonality> = {
  'creative-direction-studio': {
    flagshipId: 'creative-direction-studio',
    role: 'Creative Director',
    greeting: 'I create ideas here — Founder Intent™, Story Table™, and Concept Approval™ live in this studio.',
    guidance: 'Output is an approved creative vision. Nothing is manufactured, archived, or sold here.',
    accent: '#c9a962',
  },
  'studio-warehouse': {
    flagshipId: 'studio-warehouse',
    role: 'Production Supervisor',
    greeting: 'I manufacture ideas here — Scene Deconstruction™, Asset Registry™, and Assembly™ begin after vision approval.',
    guidance: 'Warehouse creates reusable building blocks. It never invents.',
    accent: '#8ba4c4',
  },
  'studio-archives': {
    flagshipId: 'studio-archives',
    role: 'Historian',
    greeting: 'I preserve ideas here — Golden Builds™, Museum™, and Company Genome Vault™ are institutional memory.',
    guidance: 'Archives never generate or manufacture. They remember forever.',
    accent: '#9b7bb8',
  },
  marketplace: {
    flagshipId: 'marketplace',
    role: 'Curator',
    greeting: 'I share ideas here — Blueprint Marketplace™, Asset Packs™, and Licensing™ distribute work that originated elsewhere.',
    guidance: 'Marketplace never generates or creates. Everything here came from another destination.',
    accent: '#e8c878',
  },
  headquarters: {
    flagshipId: 'headquarters',
    role: 'Executive Assistant',
    greeting: 'I run my company here — Marketing, Sales, Finance, and every department executes real business work.',
    guidance: 'Creative Direction Studio™ creates. Headquarters™ executes.',
    accent: '#b8d4a8',
  },
  'studio-command-center': {
    flagshipId: 'studio-command-center',
    role: 'Chief of Staff',
    greeting: 'I oversee everything here — Command Center™ orchestrates, observes, and coordinates Studio World™.',
    guidance: 'Command Center never creates. It is the brain of the campus.',
    accent: '#a8c4e0',
  },
  'expedition-hub': {
    flagshipId: 'expedition-hub',
    role: 'Coach',
    greeting: 'I transform my company here — Launch Company™, Rebrand™, and Scale™ combine destinations into guided journeys.',
    guidance: 'Every Expedition combines multiple flagships into one coached experience.',
    accent: '#d4af7a',
  },
};

export function resolveStudioWorldOrbPersonality(
  flagshipId: StudioWorldFlagshipId
): StudioWorldOrbPersonality {
  return ORB_PERSONALITIES[flagshipId];
}

export function resolveStudioWorldOrbGreeting(flagshipId: StudioWorldFlagshipId): {
  greeting: string;
  guidance: string;
  role: string;
} {
  const p = ORB_PERSONALITIES[flagshipId];
  const law = FLAGSHIP_RESPONSIBILITY_LAWS[flagshipId];
  return {
    role: p.role,
    greeting: p.greeting,
    guidance: `${law.successPhrase} ${p.guidance}`,
  };
}

/** Resolve flagship from a Studio OS path (legacy or world canonical). */
export function resolveFlagshipFromPath(pathname: string): StudioWorldFlagshipId | null {
  const p = pathname.toLowerCase();
  if (p.includes('creative-direction') || p.includes('/department/creative')) {
    return 'creative-direction-studio';
  }
  if (p.includes('studio-warehouse') || p.includes('/world/warehouse')) {
    return 'studio-warehouse';
  }
  if (p.includes('marketplace') || p.includes('/world/marketplace')) {
    return 'marketplace';
  }
  if (p.includes('studio-archives') || p.includes('/world/archives')) {
    return 'studio-archives';
  }
  if (p.includes('/headquarters') || p.includes('/world/headquarters')) {
    return 'headquarters';
  }
  if (p.includes('expansion-center') || p.includes('expedition-hub') || p.includes('/world/expedition')) {
    return 'expedition-hub';
  }
  if (
    p.includes('constitution-hall') ||
    p.includes('/studio/overview') ||
    p.includes('command-center') ||
    p.includes('world-atlas') ||
    p.includes('architecture-observatory') ||
    p.includes('experience-observatory')
  ) {
    return 'studio-command-center';
  }
  return null;
}

export function resolveOrbPersonalityForPath(pathname: string): StudioWorldOrbPersonality | null {
  const p = pathname.toLowerCase();
  if (p.includes('constitution-hall')) {
    return {
      flagshipId: 'studio-command-center',
      role: CONSTITUTION_KEEPER_ROLE,
      greeting: CONSTITUTION_KEEPER_GREETING,
      guidance:
        'I explain why principles exist, how Studio World evolves, and whether new ideas fit the civilization.',
      accent: CONSTITUTION_KEEPER_ACCENT,
    };
  }
  if (p.includes('innovation-lineage-gallery') || p.includes('lineage-gallery')) {
    return {
      flagshipId: 'studio-archives',
      role: INNOVATION_HISTORIAN_ROLE,
      greeting: INNOVATION_HISTORIAN_GREETING,
      guidance:
        'I trace how inventions evolved — generations, forks, merges, and Marketplace impact preserved forever.',
      accent: INNOVATION_HISTORIAN_ACCENT,
    };
  }
  if (p.includes('innovation-constellations') || p.includes('constellations-observatory')) {
    return {
      flagshipId: 'studio-archives',
      role: COSMIC_GUIDE_ROLE,
      greeting: COSMIC_GUIDE_GREETING,
      guidance:
        'I navigate the living universe — constellation evolution, derivative innovations, collaboration pathways, and whitespace opportunity.',
      accent: COSMIC_GUIDE_ACCENT,
    };
  }
  if (p.includes('innovation-expeditions') || p.includes('expeditions-hall')) {
    return {
      flagshipId: 'studio-archives',
      role: EXPEDITION_GUIDE_ROLE,
      greeting: EXPEDITION_GUIDE_GREETING,
      guidance:
        'I guide expeditions through Studio World — stories, principles, and missions at every stop. Learning by experiencing, not reading.',
      accent: EXPEDITION_GUIDE_ACCENT,
    };
  }
  if (p.includes('innovation-district')) {
    return {
      flagshipId: 'studio-archives',
      role: COLLABORATION_CURATOR_ROLE,
      greeting: COLLABORATION_CURATOR_GREETING,
      guidance:
        'I identify complementary founders, highlight co-invention opportunities, and guide joint publishing with transparent royalties.',
      accent: COLLABORATION_CURATOR_ACCENT,
    };
  }
  const flagshipId = resolveFlagshipFromPath(pathname);
  return flagshipId ? ORB_PERSONALITIES[flagshipId] : null;
}
