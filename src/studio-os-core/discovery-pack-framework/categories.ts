/**
 * Pack Categories™ — six permanent pillars of Studio World's expansion roadmap.
 */

import type { DiscoveryPackCategory, DiscoveryPackCategoryPillar } from './types';

export const DISCOVERY_PACK_CATEGORY_PILLARS: Record<
  DiscoveryPackCategory,
  Omit<DiscoveryPackCategoryPillar, 'reservedCount'>
> = {
  district: {
    category: 'district',
    label: 'District Discovery Packs™',
    description:
      'Entirely new districts — Hollywood™, Fashion™, Architecture™, Music™, Culinary™ — expanding the physical world.',
  },
  civilization: {
    category: 'civilization',
    label: 'Civilization Discovery Packs™',
    description:
      'Entire professions, ecosystems, knowledge networks, headquarters, marketplaces, museums, and civilizations.',
  },
  intelligence: {
    category: 'intelligence',
    label: 'Intelligence Discovery Packs™',
    description:
      'New Orb personalities, AI species, reasoning engines, intelligence systems, and automation capabilities.',
  },
  'world-mechanics': {
    category: 'world-mechanics',
    label: 'World Mechanics Discovery Packs™',
    description:
      'New world physics — Economic Simulation™, Future Merge™, Parallel Futures™, Patent System™, Research Trees™.',
  },
  creator: {
    category: 'creator',
    label: 'Creator Discovery Packs™',
    description:
      'Official collaborations, partner institutions, professional ecosystems, brand partnerships, educational organizations.',
  },
  experience: {
    category: 'experience',
    label: 'Experience Discovery Packs™',
    description:
      'World Events, Summits, Expeditions, seasonal experiences, creative festivals, Innovation Olympics, World Expos.',
  },
};

export const DISCOVERY_FRAMEWORK_VERSION = 'discovery-pack-framework.v1';

export const HALL_OF_DISCOVERY_ID = 'museum-hall-of-discovery';

export const FRONTIER_SUMMARY =
  'Unexplored frontiers await beyond the horizon — Discovery Packs™ expand the world, not the feature list.';
