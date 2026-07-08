/**
 * Known World™ — Atlas region taxonomy.
 * The Atlas charts what civilization understands — not the full world.
 */

import type { AtlasRegionKind, PublicAtlasRegionSummary } from '../types';

export type AtlasRegionDefinition = {
  id: string;
  kind: AtlasRegionKind;
  /** Public label when charted — null for truly unknown slots */
  publicLabel: string | null;
  charted: boolean;
  /** Internal pack slot — never exposed */
  linkedPackId?: string;
};

/**
 * Internal Atlas registry — region kinds and counts only in public API.
 * @internal Never render uncharted slot identities in founder UI.
 */
export const ATLAS_REGION_REGISTRY: AtlasRegionDefinition[] = [
  { id: 'reg-innovation-district', kind: 'known', publicLabel: 'Innovation District', charted: true },
  { id: 'reg-knowledge-quarter', kind: 'known', publicLabel: 'Knowledge Quarter', charted: true },
  { id: 'reg-marketplace-pavilion', kind: 'known', publicLabel: 'Marketplace Pavilion', charted: true },
  { id: 'reg-museum-wing', kind: 'known', publicLabel: 'Living Museum Wing', charted: true },
  { id: 'reg-archives-campus', kind: 'known', publicLabel: 'Studio Archives Campus', charted: true },
  { id: 'reg-prototype-vault', kind: 'known', publicLabel: 'Prototype Vault', charted: true },
  { id: 'reg-historical-archives', kind: 'historical', publicLabel: 'Historical Archives', charted: true },
  { id: 'reg-restricted-research', kind: 'restricted', publicLabel: 'Restricted Research Zone', charted: false },
  { id: 'reg-experimental-lab', kind: 'experimental', publicLabel: 'Experimental Laboratory', charted: false },
  { id: 'reg-slot-beyond-horizon', kind: 'unknown', publicLabel: null, charted: false, linkedPackId: 'DP-DIST-001' },
  { id: 'reg-slot-uncharted-north', kind: 'uncharted', publicLabel: null, charted: false, linkedPackId: 'DP-DIST-002' },
  { id: 'reg-slot-future-era', kind: 'future', publicLabel: null, charted: false, linkedPackId: 'DP-MECH-001' },
  { id: 'reg-slot-civilization-edge', kind: 'unknown', publicLabel: null, charted: false, linkedPackId: 'DP-CIV-001' },
  { id: 'reg-slot-intelligence-deep', kind: 'restricted', publicLabel: null, charted: false, linkedPackId: 'DP-INT-001' },
  { id: 'reg-slot-creator-frontier', kind: 'uncharted', publicLabel: null, charted: false, linkedPackId: 'DP-CRE-001' },
  { id: 'reg-slot-experience-beyond', kind: 'future', publicLabel: null, charted: false, linkedPackId: 'DP-EXP-003' },
];

export function computePublicAtlasRegionSummary(): PublicAtlasRegionSummary {
  const counts: Record<AtlasRegionKind, number> = {
    known: 0,
    unknown: 0,
    uncharted: 0,
    restricted: 0,
    experimental: 0,
    historical: 0,
    future: 0,
  };

  let charted = 0;
  let total = ATLAS_REGION_REGISTRY.length;

  for (const region of ATLAS_REGION_REGISTRY) {
    counts[region.kind] += 1;
    if (region.charted) charted += 1;
  }

  const fogCoveragePct = Math.round(((total - charted) / total) * 100);

  return {
    knownCount: counts.known,
    unknownCount: counts.unknown,
    unchartedCount: counts.uncharted,
    restrictedCount: counts.restricted,
    experimentalCount: counts.experimental,
    historicalCount: counts.historical,
    futureCount: counts.future,
    fogCoveragePct,
    totalRegions: total,
    chartedRegions: charted,
  };
}

export function atlasRegionKindLabel(kind: AtlasRegionKind): string {
  const labels: Record<AtlasRegionKind, string> = {
    known: 'Known Regions™',
    unknown: 'Unknown Regions™',
    uncharted: 'Uncharted Regions™',
    restricted: 'Restricted Regions™',
    experimental: 'Experimental Regions™',
    historical: 'Historical Regions™',
    future: 'Future Regions™',
  };
  return labels[kind];
}
