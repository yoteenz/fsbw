/**
 * Hall of Discovery™ — Museum scaffold for permanent release history exhibits.
 * Only released/revealed packs receive public exhibits.
 */

import { getPublicReleases } from '../query';
import type { DiscoveryPackRegistryEntry } from '../types';
import { HALL_OF_DISCOVERY_ID } from '../categories';

export type HallOfDiscoveryExhibit = {
  id: string;
  packId: string;
  title: string;
  category: string;
  revealTrailerSlot: boolean;
  developmentHistorySlot: boolean;
  impactSummarySlot: boolean;
  permanent: true;
};

export type HallOfDiscoveryScaffold = {
  hallId: string;
  label: string;
  tagline: string;
  exhibits: HallOfDiscoveryExhibit[];
  reservedExhibitSlots: number;
};

export function buildHallOfDiscoveryScaffold(
  registry: readonly DiscoveryPackRegistryEntry[]
): HallOfDiscoveryScaffold {
  const publicReleases = getPublicReleases();
  const reservedSlots = registry.filter(
    (e) => e.integrations.museum.hallOfDiscovery && e.status !== 'released' && e.status !== 'revealed'
  ).length;

  return {
    hallId: HALL_OF_DISCOVERY_ID,
    label: 'Hall of Discovery™',
    tagline: 'Studio World\'s living release history — every Discovery Pack reveal preserved forever',
    exhibits: publicReleases.map((r) => ({
      id: `hod-${r.packId}`,
      packId: r.packId,
      title: r.publicName,
      category: r.category,
      revealTrailerSlot: true,
      developmentHistorySlot: true,
      impactSummarySlot: true,
      permanent: true as const,
    })),
    reservedExhibitSlots: reservedSlots,
  };
}
